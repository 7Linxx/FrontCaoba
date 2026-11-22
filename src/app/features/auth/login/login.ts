import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { mensajeError } from '../../../core/utils/mensaje-error';
import { Alerta } from '../../../shared/components/alerta/alerta';
import { AuthTarjeta } from '../../../shared/components/auth-tarjeta/auth-tarjeta';
import { correoValido } from '../../../shared/validators/form.validators';

/** Pantalla a la que se llega después de iniciar sesión. */
const RUTA_DESPUES_DE_LOGIN = '/inicio';

type CampoLogin = 'correo' | 'contrasena';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AuthTarjeta, Alerta],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
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

  protected invalido(campo: CampoLogin): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || this.enviado());
  }

  protected entrar(): void {
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
        .login({ correo: correo.trim().toLowerCase(), contrasena })
        .pipe(
            finalize(() => {
              this.cargando.set(false);
              this.formulario.enable();
            }),
        )
        .subscribe({
          next: (respuesta) => {
            if (!respuesta?.rol) {
              this.error.set('El servidor no devolvió la información del usuario.');
              return;
            }
            void this.router.navigateByUrl(RUTA_DESPUES_DE_LOGIN);
          },
          error: (e) =>
              this.error.set(
                  mensajeError(e, 'Ocurrió un error inesperado. Inténtalo nuevamente.', {
                    fijos: {
                      401: 'El correo electrónico o la contraseña son incorrectos.',
                      403: 'Tu cuenta no tiene autorización para realizar esta acción.',
                      404: 'No se encontró una cuenta con ese correo electrónico.',
                      409: 'Existe un conflicto con el estado de la cuenta.',
                    },
                  }),
              ),
        });
  }
}