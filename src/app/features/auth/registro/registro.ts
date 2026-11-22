import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { mensajeError } from '../../../core/utils/mensaje-error';
import { RegistroSolicitud } from '../../../models/auth.model';
import { ETIQUETA_ROL, RolRegistrable } from '../../../models/usuario.model';
import { Alerta } from '../../../shared/components/alerta/alerta';
import { AuthTarjeta } from '../../../shared/components/auth-tarjeta/auth-tarjeta';
import {
  camposCoinciden,
  claveSegura,
  correoValido,
} from '../../../shared/validators/form.validators';

type CampoRegistro =
    | 'nombre'
    | 'apellido'
    | 'correo'
    | 'contrasena'
    | 'confirmacion'
    | 'rol'
    | 'aceptaTratamientoDatos';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, AuthTarjeta, Alerta],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);

  protected readonly roles: { valor: RolRegistrable; etiqueta: string }[] = [
    { valor: 'HUESPED', etiqueta: ETIQUETA_ROL.HUESPED },
    { valor: 'ANFITRION', etiqueta: ETIQUETA_ROL.ANFITRION },
  ];

  protected readonly formulario = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.maxLength(100)]],
        apellido: ['', [Validators.required, Validators.maxLength(100)]],
        correo: ['', [Validators.required, correoValido, Validators.maxLength(150)]],
        contrasena: ['', [Validators.required, claveSegura]],
        confirmacion: ['', [Validators.required]],
        rol: ['HUESPED' as RolRegistrable, [Validators.required]],
        aceptaTratamientoDatos: [false, [Validators.requiredTrue]],
      },
      { validators: [camposCoinciden('contrasena', 'confirmacion')] },
  );

  protected readonly cargando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly error = signal('');
  protected readonly ok = signal('');

  protected invalido(campo: CampoRegistro): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || this.enviado());
  }

  protected noCoinciden(): boolean {
    const confirmacion = this.formulario.controls.confirmacion;
    return (
        this.formulario.hasError('noCoinciden') &&
        !confirmacion.hasError('required') &&
        (confirmacion.touched || this.enviado())
    );
  }

  protected crear(): void {
    if (this.cargando()) return;

    this.enviado.set(true);
    this.error.set('');
    this.ok.set('');

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.error.set('Revisa los campos señalados antes de continuar.');
      return;
    }

    const valores = this.formulario.getRawValue();

    const datos: RegistroSolicitud = {
      nombre: valores.nombre.trim(),
      apellido: valores.apellido.trim(),
      correo: valores.correo.trim().toLowerCase(),
      contrasena: valores.contrasena,
      rol: valores.rol,
      aceptaTratamientoDatos: valores.aceptaTratamientoDatos,
    };

    this.cargando.set(true);
    this.formulario.disable();

    this.auth
        .registro(datos)
        .pipe(
            finalize(() => {
              this.cargando.set(false);
              this.formulario.enable();
            }),
        )
        .subscribe({
          next: () => {
            this.ok.set('¡Tu cuenta fue creada correctamente! Ya puedes iniciar sesión.');
            this.formulario.reset();
            this.enviado.set(false);
          },
          error: (e) =>
              this.error.set(
                  mensajeError(e, 'No fue posible crear la cuenta. Inténtalo nuevamente.', {
                    respaldo: {
                      409: 'Este correo electrónico ya está registrado. Inicia sesión o utiliza otro correo.',
                    },
                  }),
              ),
        });
  }
}