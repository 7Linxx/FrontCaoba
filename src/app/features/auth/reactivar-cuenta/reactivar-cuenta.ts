import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { mensajeError } from '../../../core/utils/mensaje-error';
import { Alerta } from '../../../shared/components/alerta/alerta';
import { AuthTarjeta } from '../../../shared/components/auth-tarjeta/auth-tarjeta';
import { correoValido } from '../../../shared/validators/form.validators';

type CampoReactivar = 'correo' | 'contrasena';

@Component({
  selector: 'app-reactivar-cuenta',
  imports: [ReactiveFormsModule, RouterLink, AuthTarjeta, Alerta],
  templateUrl: './reactivar-cuenta.html',
  styleUrl: './reactivar-cuenta.css',
})
export class ReactivarCuenta {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly formulario = this.fb.group({
    correo: ['', [Validators.required, correoValido]],
    contrasena: ['', [Validators.required]],
  });

  protected readonly cargando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly error = signal('');

  protected invalido(campo: CampoReactivar): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || this.enviado());
  }

  protected reactivar(): void {
    if (this.cargando()) return;

    this.enviado.set(true);
    this.error.set('');

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { correo, contrasena } = this.formulario.getRawValue();

    this.cargando.set(true);
    this.formulario.disable();

    this.auth
        .reactivar({ correo: correo.trim().toLowerCase(), contrasena })
        .pipe(
            finalize(() => {
              this.cargando.set(false);
              this.formulario.enable();
            }),
        )
        .subscribe({
          next: (respuesta) => {
            if (!respuesta?.token) {
              this.error.set('No se recibió la información de la cuenta.');
              return;
            }
            void this.router.navigateByUrl('/inicio');
          },
          error: (e) =>
              this.error.set(
                  mensajeError(e, 'Ocurrió un error inesperado. Inténtalo nuevamente.', {
                    fijos: {
                      401: 'No fue posible reactivar la cuenta. Verifica tu correo y contraseña.',
                      403: 'Tu cuenta no tiene autorización para realizar esta acción.',
                      404: 'No se encontró una cuenta con ese correo electrónico.',
                      409: 'Existe un conflicto con el estado de la cuenta.',
                    },
                  }),
              ),
        });
  }
}