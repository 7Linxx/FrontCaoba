import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, switchMap, tap, timer } from 'rxjs';

import { mensajeError } from '../../../core/utils/mensaje-error';
import { AlojamientoResumen, Cotizacion } from '../../../models/cotizacion.model';
import { Reserva } from '../../../models/reserva.model';
import { Alerta } from '../../../shared/components/alerta/alerta';
import { DialogoConfirmacion } from '../../../shared/components/dialogo-confirmacion/dialogo-confirmacion';
import { CotizacionesService } from '../cotizaciones.service';
import { ReservasService } from '../reservas.service';

type Fase = 'libre' | 'pagando' | 'confirmando';

/** Tiempo que dura el pago simulado antes de confirmar la reserva. */
const PAUSA_PAGO_SIMULADO_MS = 1200;

const FORMATO_MONEDA = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function aIso(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

@Component({
  selector: 'app-cotizador',
  imports: [ReactiveFormsModule, CurrencyPipe, Alerta, DialogoConfirmacion],
  templateUrl: './cotizador.html',
  styleUrl: './cotizador.css',
})
export class Cotizador {
  private readonly cotizaciones = inject(CotizacionesService);
  private readonly reservas = inject(ReservasService);

  /** Se emite cuando el pago simulado fue aprobado y el back confirmó la reserva. */
  readonly reservaCreada = output<Reserva>();

  /** Se genera al primer intento de pago y se conserva en los reintentos (RF16). */
  private claveIdempotencia: string | null = null;

  protected readonly alojamientos = signal<AlojamientoResumen[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorLista = signal('');

  protected readonly seleccionado = signal<AlojamientoResumen | null>(null);
  protected readonly serviciosElegidos = signal<number[]>([]);
  protected readonly cotizacion = signal<Cotizacion | null>(null);
  protected readonly cotizando = signal(false);
  protected readonly fase = signal<Fase>('libre');
  protected readonly pagoAbierto = signal(false);
  protected readonly error = signal('');

  /** Las fechas deben ser estrictamente futuras (RF14). */
  protected readonly minimo = (() => {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    return aIso(manana);
  })();

  protected readonly form = inject(NonNullableFormBuilder).group({
    fechaEntrada: ['', Validators.required],
    fechaSalida: ['', Validators.required],
    numeroHuespedes: [1, [Validators.required, Validators.min(1)]],
  });

  protected readonly textoPago = computed(() => {
    const c = this.cotizacion();
    if (!c) return '';

    switch (this.fase()) {
      case 'pagando':
        return 'Procesando el pago…';
      case 'confirmando':
        return 'Pago aprobado. Confirmando la reserva…';
      default:
        return `Se simulará el pago de ${FORMATO_MONEDA.format(c.total)} al anfitrión. Cuando el pago sea aprobado, la reserva quedará confirmada.`;
    }
  });

  constructor() {
    this.cargarLista();

    // Si el huésped cambia algo, la cotización anterior ya no vale.
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.invalidar());
  }

  protected cargarLista(): void {
    this.cargando.set(true);
    this.errorLista.set('');

    this.cotizaciones
        .listarAlojamientos()
        .pipe(finalize(() => this.cargando.set(false)))
        .subscribe({
          next: (lista) => this.alojamientos.set(lista),
          error: (e) =>
              this.errorLista.set(
                  mensajeError(e, 'No fue posible consultar los alojamientos.', {
                    fijos: { 401: 'Tu sesión expiró. Ingresa nuevamente.' },
                  }),
              ),
        });
  }

  protected seleccionar(alojamiento: AlojamientoResumen): void {
    this.reiniciar();
    this.seleccionado.set(alojamiento);
  }

  protected volver(): void {
    this.reiniciar();
  }

  protected alternarServicio(id: number): void {
    this.serviciosElegidos.update((lista) =>
        lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id],
    );
    this.invalidar();
  }

  protected cotizar(): void {
    const aloj = this.seleccionado();
    if (!aloj || this.cotizando() || this.fase() !== 'libre') return;

    this.form.markAllAsTouched();
    this.error.set('');

    if (this.form.invalid) return;

    const v = this.form.getRawValue();

    if (v.fechaSalida <= v.fechaEntrada) {
      this.error.set('La fecha de salida debe ser posterior a la de entrada.');
      return;
    }

    if (v.numeroHuespedes > aloj.capacidad) {
      this.error.set(`Este alojamiento admite máximo ${aloj.capacidad} huéspedes.`);
      return;
    }

    this.cotizando.set(true);

    this.cotizaciones
        .cotizar({
          idAlojamiento: aloj.idAlojamiento,
          fechaEntrada: v.fechaEntrada,
          fechaSalida: v.fechaSalida,
          numeroHuespedes: v.numeroHuespedes,
          idsServiciosAdicionales: this.serviciosElegidos(),
        })
        .pipe(finalize(() => this.cotizando.set(false)))
        .subscribe({
          next: (c) => this.cotizacion.set(c),
          error: (e) =>
              this.error.set(
                  mensajeError(
                      e,
                      'No fue posible calcular la cotización. Revisa que las fechas estén disponibles.',
                      { fijos: { 403: 'Solo los huéspedes pueden cotizar.' } },
                  ),
              ),
        });
  }

  protected pedirPago(): void {
    if (!this.cotizacion() || this.fase() !== 'libre') return;
    this.pagoAbierto.set(true);
  }

  protected cancelarPago(): void {
    if (this.fase() === 'libre') this.pagoAbierto.set(false);
  }

  /** Pago simulado: cuando "se aprueba", se crea la reserva en el back. */
  protected confirmarPago(): void {
    const aloj = this.seleccionado();
    if (!aloj || !this.cotizacion() || this.fase() !== 'libre') return;

    this.claveIdempotencia ??= crypto.randomUUID();
    const clave = this.claveIdempotencia;
    const v = this.form.getRawValue();

    this.error.set('');
    this.fase.set('pagando');

    timer(PAUSA_PAGO_SIMULADO_MS)
        .pipe(
            tap(() => this.fase.set('confirmando')),
            switchMap(() =>
                this.reservas.crear({
                  claveIdempotencia: clave,
                  idAlojamiento: aloj.idAlojamiento,
                  fechaEntrada: v.fechaEntrada,
                  fechaSalida: v.fechaSalida,
                  numeroHuespedes: v.numeroHuespedes,
                  idsServiciosAdicionales: this.serviciosElegidos(),
                }),
            ),
            finalize(() => this.fase.set('libre')),
        )
        .subscribe({
          next: (reserva) => {
            this.pagoAbierto.set(false);
            this.reiniciar();
            this.reservaCreada.emit(reserva);
          },
          error: (e) => {
            this.pagoAbierto.set(false);
            this.error.set(
                mensajeError(
                    e,
                    'No fue posible confirmar la reserva. No se realizó ningún cobro real; puedes intentarlo de nuevo.',
                    { fijos: { 403: 'Solo los huéspedes pueden reservar.' } },
                ),
            );
          },
        });
  }

  private invalidar(): void {
    this.cotizacion.set(null);
    this.claveIdempotencia = null;
  }

  private reiniciar(): void {
    this.seleccionado.set(null);
    this.serviciosElegidos.set([]);
    this.cotizacion.set(null);
    this.claveIdempotencia = null;
    this.error.set('');
    this.form.reset();
  }
}