import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { mensajeError } from '../../../core/utils/mensaje-error';
import { EstadoReserva, ModoReservas, Reserva } from '../../../models/reserva.model';
import { Alerta } from '../../../shared/components/alerta/alerta';
import { DialogoConfirmacion } from '../../../shared/components/dialogo-confirmacion/dialogo-confirmacion';
import { Cotizador } from '../cotizador/cotizador';
import { ReservaDetalle } from '../reserva-detalle/reserva-detalle';
import { ReservasTabla } from '../reservas-tabla/reservas-tabla';
import { ReservasService } from '../reservas.service';
import { CurrencyPipe } from '@angular/common';

type Vista = 'reservas' | 'cotizar';
type FiltroEstado = 'TODAS' | EstadoReserva;

const FORMATO_MONEDA = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

@Component({
  selector: 'app-reservas',
  imports: [ReactiveFormsModule, CurrencyPipe, Alerta, DialogoConfirmacion, ReservasTabla, ReservaDetalle, Cotizador],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
  host: { class: 'pagina' },
})
export class Reservas {
  private readonly auth = inject(AuthService);
  private readonly reservasService = inject(ReservasService);

  /** Huésped ve su historial; anfitrión ve las reservas recibidas. */
  protected readonly modo = computed<ModoReservas | null>(() => {
    const rol = this.auth.rol();
    if (rol === 'HUESPED') return 'huesped';
    if (rol === 'ANFITRION') return 'anfitrion';
    return null;
  });

  protected readonly vista = signal<Vista>('reservas');
  protected readonly filtro = signal<FiltroEstado>('TODAS');

  protected readonly reservas = signal<Reserva[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');

  protected readonly seleccionada = signal<Reserva | null>(null);
  protected readonly cancelando = signal<Reserva | null>(null);
  protected readonly procesando = signal(false);
  protected readonly motivoEnviado = signal(false);
  protected readonly errorCancelacion = signal('');

  protected readonly motivo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(500)],
  });

  protected readonly visibles = computed(() => {
    const filtro = this.filtro();
    return filtro === 'TODAS'
        ? this.reservas()
        : this.reservas().filter((reserva) => reserva.estado === filtro);
  });

  protected readonly total = computed(() => this.reservas().length);
  protected readonly confirmadas = computed(() => this.contar('CONFIRMADA'));
  protected readonly finalizadas = computed(() => this.contar('FINALIZADA'));
  protected readonly canceladas = computed(() => this.contar('CANCELADA'));

  /** Dinero recibido por el anfitrión: todas las reservas que no fueron canceladas. */
  protected readonly ingresos = computed(() =>
      this.reservas()
          .filter((reserva) => reserva.estado !== 'CANCELADA')
          .reduce((suma, reserva) => suma + reserva.ingresoAnfitrion, 0),
  );

  protected readonly etiqueta = computed(() => {
    if (this.modo() === 'anfitrion') return 'RESERVAS RECIBIDAS';
    return this.vista() === 'cotizar' ? 'COTIZAR Y RESERVAR' : 'HISTORIAL DE RESERVAS';
  });

  protected readonly descripcion = computed(() => {
    if (this.modo() === 'anfitrion') {
      return 'Consulta las reservas que han recibido tus alojamientos y el dinero recibido por cada una.';
    }

    return this.vista() === 'cotizar'
        ? 'Elige un alojamiento, revisa sus especificaciones, cotiza tu estancia y confirma la reserva con el pago.'
        : 'Consulta el estado de tus reservas, su detalle y cancela las que estén confirmadas.';
  });

  protected readonly textoCancelacion = computed(() => {
    const reserva = this.cancelando();
    return reserva
        ? `¿Deseas cancelar la reserva de "${reserva.alojamiento}"? Se aplicará la política de cancelación del alojamiento y las fechas quedarán libres.`
        : '';
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    const modo = this.modo();
    if (!modo || this.cargando()) return;

    this.cargando.set(true);
    this.error.set('');

    const peticion =
        modo === 'huesped' ? this.reservasService.misReservas() : this.reservasService.reservasRecibidas();

    peticion.pipe(finalize(() => this.cargando.set(false))).subscribe({
      next: (lista) => this.reservas.set(lista),
      error: (e) => {
        this.reservas.set([]);
        this.error.set(
            mensajeError(e, 'No fue posible consultar las reservas.', {
              fijos: {
                401: 'Tu sesión expiró. Ingresa nuevamente.',
                403: 'No tienes permisos para consultar las reservas.',
              },
            }),
        );
      },
    });
  }

  protected cambiarVista(vista: Vista): void {
    this.mensaje.set('');
    this.vista.set(vista);
  }

  protected cambiarFiltro(valor: string): void {
    this.filtro.set(valor as FiltroEstado);
  }

  /** El pago simulado fue aprobado y el back confirmó la reserva. */
  protected alCrearReserva(reserva: Reserva): void {
    this.reservas.update((lista) => [reserva, ...lista]);
    this.filtro.set('TODAS');
    this.error.set('');
    this.vista.set('reservas');
    this.mensaje.set(
        `Pago aprobado (simulado) y reserva confirmada. Tu comprobante es ${reserva.comprobante}.`,
    );
  }

  protected verDetalle(reserva: Reserva): void {
    this.mensaje.set('');
    this.seleccionada.set(reserva);
  }

  protected cerrarDetalle(): void {
    this.seleccionada.set(null);
  }

  protected solicitarCancelacion(reserva: Reserva): void {
    this.mensaje.set('');
    this.motivo.reset();
    this.motivoEnviado.set(false);
    this.errorCancelacion.set('');
    this.seleccionada.set(null);
    this.cancelando.set(reserva);
  }

  /** Cierra el diálogo y vuelve al detalle de la reserva. */
  protected cerrarCancelacion(): void {
    const reserva = this.cancelando();
    this.cancelando.set(null);
    this.seleccionada.set(reserva);
  }

  protected motivoInvalido(): boolean {
    return this.motivoEnviado() && this.motivo.value.trim().length === 0;
  }

  protected confirmarCancelacion(): void {
    const reserva = this.cancelando();
    if (!reserva || this.procesando()) return;

    this.motivoEnviado.set(true);
    this.errorCancelacion.set('');

    const texto = this.motivo.value.trim();
    if (!texto) return;

    this.procesando.set(true);

    this.reservasService
        .cancelar(reserva, texto)
        .pipe(finalize(() => this.procesando.set(false)))
        .subscribe({
          next: ({ reserva: actualizada, montoDevolucion }) => {
            this.reemplazar(actualizada);
            this.cancelando.set(null);
            this.seleccionada.set(actualizada);
            this.mensaje.set(
                `La reserva fue cancelada y las fechas quedaron libres. Devolución simulada: ${FORMATO_MONEDA.format(montoDevolucion)}.`,
            );
          },
          error: (e) =>
              this.errorCancelacion.set(
                  mensajeError(e, 'No fue posible cancelar la reserva.', {
                    fijos: { 403: 'No tienes permiso para cancelar esta reserva.' },
                  }),
              ),
        });
  }

  private contar(estado: EstadoReserva): number {
    return this.reservas().filter((reserva) => reserva.estado === estado).length;
  }

  private reemplazar(actualizada: Reserva): void {
    const id = String(actualizada.idReserva);

    this.reservas.update((lista) =>
        lista.map((reserva) => (String(reserva.idReserva) === id ? actualizada : reserva)),
    );
  }
}