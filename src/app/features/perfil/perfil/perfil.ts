import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { mensajeError } from '../../../core/utils/mensaje-error';
import {
  ESTADO_ACTIVA,
  ETIQUETA_ROL,
  Usuario,
  normalizarRol,
} from '../../../models/usuario.model';
import { Alerta } from '../../../shared/components/alerta/alerta';
import { DialogoConfirmacion } from '../../../shared/components/dialogo-confirmacion/dialogo-confirmacion';
import { PerfilService } from '../perfil.service';

type CampoPerfil = 'nombre' | 'apellido' | 'telefono';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, Alerta, DialogoConfirmacion],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
  host: { class: 'pagina' },
})
export class Perfil {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly perfilService = inject(PerfilService);

  protected readonly formulario = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.maxLength(100)]],
    telefono: ['', [Validators.maxLength(20)]],
  });

  protected readonly usuario = signal<Usuario | null>(null);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly confirmandoDesactivar = signal(false);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');

  protected readonly estaActiva = computed(() => this.usuario()?.estadoCuenta === ESTADO_ACTIVA);

  protected readonly etiquetaRol = computed(() => {
    const rol = normalizarRol(this.usuario()?.rol);
    return rol ? ETIQUETA_ROL[rol] : (this.usuario()?.rol ?? '');
  });

  constructor() {
    this.cargarPerfil();
  }

  protected invalido(campo: CampoPerfil): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || this.enviado());
  }

  protected guardar(): void {
    if (this.guardando()) return;

    this.enviado.set(true);
    this.limpiarMensajes();

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { nombre, apellido, telefono } = this.formulario.getRawValue();

    this.guardando.set(true);
    this.formulario.disable();

    this.perfilService
        .actualizar({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          telefono: telefono.trim() || null,
        })
        .pipe(
            finalize(() => {
              this.guardando.set(false);
              this.formulario.enable();
            }),
        )
        .subscribe({
          next: (actualizado) => {
            const actual = this.usuario();
            this.aplicar(actual ? { ...actual, ...actualizado } : actualizado);
            this.enviado.set(false);
            this.mensaje.set('Perfil actualizado correctamente.');
          },
          error: (e) => this.error.set(mensajeError(e, 'No fue posible actualizar el perfil.')),
        });
  }

  protected desactivar(): void {
    if (this.guardando()) return;

    this.limpiarMensajes();
    this.guardando.set(true);

    this.perfilService
        .cambiarEstadoCuenta(false)
        .pipe(
            finalize(() => {
              this.guardando.set(false);
              this.confirmandoDesactivar.set(false);
            }),
        )
        .subscribe({
          next: () => this.auth.cerrarSesion(),
          error: (e) => this.error.set(mensajeError(e, 'No se pudo desactivar la cuenta.')),
        });
  }

  private cargarPerfil(): void {
    this.cargando.set(true);
    this.limpiarMensajes();

    this.auth
        .cargarPerfil()
        .pipe(finalize(() => this.cargando.set(false)))
        .subscribe({
          next: (usuario) => {
            this.aplicar(usuario);

            if (!usuario.idUsuario) {
              this.error.set('El servidor no devolvió el identificador del usuario.');
            }
          },
          error: (e) =>
              this.error.set(mensajeError(e, 'No se pudo cargar la información del perfil.')),
        });
  }

  private aplicar(usuario: Usuario): void {
    this.usuario.set(usuario);
    this.formulario.reset({
      nombre: usuario.nombre ?? '',
      apellido: usuario.apellido ?? '',
      telefono: usuario.telefono ?? '',
    });
  }

  private limpiarMensajes(): void {
    this.mensaje.set('');
    this.error.set('');
  }
}