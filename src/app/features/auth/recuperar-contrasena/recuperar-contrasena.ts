import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { mensajeError } from '../../../core/utils/mensaje-error';
import { Alerta } from '../../../shared/components/alerta/alerta';
import { AuthTarjeta } from '../../../shared/components/auth-tarjeta/auth-tarjeta';
import {
  camposCoinciden,
  claveSegura,
  correoValido,
} from '../../../shared/validators/form.validators';

type Paso = 'correo' | 'enviado' | 'codigo' | 'clave' | 'listo';

const SEGUNDOS_ESPERA = 60;
const MS_ANTES_DE_REDIRIGIR = 3500;

@Component({
  selector: 'app-recuperar-contrasena',
  imports: [ReactiveFormsModule, RouterLink, AuthTarjeta, Alerta],
  templateUrl: './recuperar-contrasena.html',
  styleUrl: './recuperar-contrasena.css',
})
export class RecuperarContrasena {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private temporizador?: ReturnType<typeof setInterval>;
  private redireccion?: ReturnType<typeof setTimeout>;

  protected readonly formCorreo = this.fb.group({
    correo: ['', [Validators.required, correoValido, Validators.maxLength(150)]],
  });

  protected readonly formCodigo = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
  });

  protected readonly formClave = this.fb.group(
      {
        clave: ['', [Validators.required, claveSegura]],
        confirmacion: ['', [Validators.required]],
      },
      { validators: [camposCoinciden('clave', 'confirmacion')] },
  );

  protected readonly paso = signal<Paso>('correo');
  protected readonly correo = signal('');
  protected readonly cargando = signal(false);
  protected readonly enviadoCorreo = signal(false);
  protected readonly enviadoCodigo = signal(false);
  protected readonly enviadoClave = signal(false);
  protected readonly espera = signal(0);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');

  protected readonly textoReenviar = computed(() => {
    if (this.cargando() && this.paso() !== 'codigo') return 'Reenviando…';
    return this.espera() > 0 ? `Reenviar correo (${this.espera()} s)` : 'Reenviar correo';
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.detenerEspera();
      clearTimeout(this.redireccion);
    });
  }

  protected enviarCodigo(): void {
    this.enviadoCorreo.set(true);
    this.limpiarMensajes();

    if (this.formCorreo.invalid || this.cargando()) return;

    this.correo.set(this.formCorreo.getRawValue().correo.trim().toLowerCase());
    this.solicitar();
  }

  protected reenviar(): void {
    if (this.cargando() || this.espera() > 0) return;

    this.limpiarMensajes();
    this.formCodigo.reset();
    this.enviadoCodigo.set(false);
    this.solicitar();
  }

  protected irACodigo(): void {
    this.limpiarMensajes();
    this.paso.set('codigo');
  }

  protected cambiarCorreo(): void {
    this.limpiarMensajes();
    this.detenerEspera();
    this.enviadoCorreo.set(false);
    this.paso.set('correo');
  }

  protected validarCodigo(): void {
    this.enviadoCodigo.set(true);
    this.limpiarMensajes();

    if (this.formCodigo.invalid || this.cargando()) return;

    this.cargando.set(true);

    this.auth
        .validarCodigoRecuperacion(this.correo(), this.formCodigo.getRawValue().codigo.trim())
        .pipe(finalize(() => this.cargando.set(false)))
        .subscribe({
          next: () => {
            this.mensaje.set('');
            this.paso.set('clave');
          },
          error: (e) => this.error.set(mensajeError(e, 'El código no es válido.')),
        });
  }

  protected actualizarClave(): void {
    this.enviadoClave.set(true);
    this.limpiarMensajes();

    if (this.formClave.invalid || this.cargando()) return;

    const { clave, confirmacion } = this.formClave.getRawValue();

    this.cargando.set(true);

    this.auth
        .restablecerContrasena({
          correo: this.correo(),
          token: this.formCodigo.getRawValue().codigo.trim(),
          nuevaContrasena: clave,
          confirmacionContrasena: confirmacion,
        })
        .pipe(finalize(() => this.cargando.set(false)))
        .subscribe({
          next: (respuesta) => {
            this.mensaje.set(respuesta.mensaje);
            this.paso.set('listo');
            this.redireccion = setTimeout(
                () => void this.router.navigate(['/login']),
                MS_ANTES_DE_REDIRIGIR,
            );
          },
          error: (e) => {
            const texto = mensajeError(e, 'No fue posible actualizar la contraseña.');
            this.error.set(texto);

            // Si el problema es el código, se vuelve al paso del código.
            if (/código/i.test(texto)) {
              this.formCodigo.reset();
              this.formClave.reset();
              this.enviadoCodigo.set(false);
              this.enviadoClave.set(false);
              this.paso.set('codigo');
            }
          },
        });
  }

  private solicitar(): void {
    this.cargando.set(true);

    this.auth
        .solicitarRecuperacion(this.correo())
        .pipe(finalize(() => this.cargando.set(false)))
        .subscribe({
          next: (respuesta) => {
            this.mensaje.set(respuesta.mensaje);
            if (this.paso() === 'correo') {
              this.paso.set('enviado');
            }
            this.iniciarEspera(SEGUNDOS_ESPERA);
          },
          error: (e) => {
            this.error.set(
                mensajeError(e, 'No fue posible enviar el código de recuperación.', {
                  respaldo: {
                    429: 'Has solicitado demasiados códigos. Espera un momento antes de intentarlo de nuevo.',
                  },
                }),
            );

            if ((e as { status?: number })?.status === 429) {
              this.iniciarEspera(SEGUNDOS_ESPERA);
              if (this.paso() === 'correo') {
                this.paso.set('enviado');
              }
            }
          },
        });
  }

  private iniciarEspera(segundos: number): void {
    this.detenerEspera();
    this.espera.set(segundos);

    this.temporizador = setInterval(() => {
      const restante = this.espera() - 1;
      this.espera.set(Math.max(restante, 0));
      if (restante <= 0) {
        this.pararTemporizador();
      }
    }, 1000);
  }

  private pararTemporizador(): void {
    clearInterval(this.temporizador);
    this.temporizador = undefined;
  }

  private detenerEspera(): void {
    this.pararTemporizador();
    this.espera.set(0);
  }

  private limpiarMensajes(): void {
    this.mensaje.set('');
    this.error.set('');
  }
}