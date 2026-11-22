import { Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { mensajeError } from '../../../core/utils/mensaje-error';
import { ESTADO_ACTIVA, ESTADO_INACTIVA, Rol, Usuario, normalizarRol } from '../../../models/usuario.model';
import { Alerta } from '../../../shared/components/alerta/alerta';
import { DialogoConfirmacion } from '../../../shared/components/dialogo-confirmacion/dialogo-confirmacion';
import { UsuariosAdminService } from '../usuarios-admin.service';
import { UsuariosTabla } from '../usuarios-tabla/usuarios-tabla';

@Component({
  selector: 'app-usuarios',
  imports: [Alerta, DialogoConfirmacion, UsuariosTabla],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
  host: { class: 'pagina' },
})
export class Usuarios {
  private readonly auth = inject(AuthService);
  private readonly usuariosAdmin = inject(UsuariosAdminService);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly mensaje = signal('');
  protected readonly procesandoId = signal<string | null>(null);
  protected readonly pendiente = signal<Usuario | null>(null);

  protected readonly activos = computed(
      () => this.usuarios().filter((u) => u.estadoCuenta === ESTADO_ACTIVA).length,
  );
  protected readonly inactivos = computed(
      () => this.usuarios().filter((u) => u.estadoCuenta !== ESTADO_ACTIVA).length,
  );

  protected readonly idActual = computed(() => {
    const id = this.auth.usuario()?.idUsuario;
    return id == null ? null : String(id);
  });

  protected readonly desactivando = computed(
      () => this.pendiente()?.estadoCuenta === ESTADO_ACTIVA,
  );
  protected readonly tituloDialogo = computed(() =>
      this.desactivando() ? 'Desactivar cuenta' : 'Activar cuenta',
  );
  protected readonly textoDialogo = computed(() => {
    const usuario = this.pendiente();
    if (!usuario) return '';
    const accion = this.desactivando() ? 'desactivar' : 'activar';
    return `¿Deseas ${accion} la cuenta de ${usuario.nombre} ${usuario.apellido}?`;
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    if (this.cargando()) return;

    this.cargando.set(true);
    this.limpiarMensajes();

    this.usuariosAdmin
        .listar()
        .pipe(finalize(() => this.cargando.set(false)))
        .subscribe({
          next: (respuesta) => {
            if (!Array.isArray(respuesta)) {
              this.usuarios.set([]);
              this.error.set('El servidor devolvió un formato inesperado.');
              return;
            }

            this.usuarios.set(respuesta.map((u) => ({ ...u, idUsuario: String(u.idUsuario) })));
          },
          error: (e) => {
            this.usuarios.set([]);
            this.error.set(
                mensajeError(e, 'No fue posible consultar los usuarios.', {
                  fijos: {
                    401: 'Tu sesión expiró. Ingresa nuevamente.',
                    403: 'No tienes permisos de administrador.',
                  },
                }),
            );
          },
        });
  }

  protected cambiarRol({ usuario, rol }: { usuario: Usuario; rol: Rol }): void {
    if (rol === normalizarRol(usuario.rol)) return;

    if (this.esUsuarioActual(usuario)) {
      this.error.set('No puedes modificar tu propio rol.');
      return;
    }

    this.limpiarMensajes();
    this.procesandoId.set(String(usuario.idUsuario));

    this.usuariosAdmin
        .asignarRol(usuario.idUsuario, rol)
        .pipe(finalize(() => this.procesandoId.set(null)))
        .subscribe({
          next: (actualizado) => {
            this.reemplazar(actualizado);
            this.mensaje.set('El rol fue actualizado correctamente.');
          },
          error: (e) => this.error.set(mensajeError(e, 'No fue posible actualizar el rol.')),
        });
  }

  protected solicitarCambioEstado(usuario: Usuario): void {
    if (this.esUsuarioActual(usuario)) {
      this.error.set('No puedes desactivar tu propia cuenta.');
      return;
    }

    this.limpiarMensajes();
    this.pendiente.set(usuario);
  }

  protected confirmarCambioEstado(): void {
    const usuario = this.pendiente();
    if (!usuario) return;

    const nuevoEstado = usuario.estadoCuenta === ESTADO_ACTIVA ? ESTADO_INACTIVA : ESTADO_ACTIVA;

    this.procesandoId.set(String(usuario.idUsuario));

    this.usuariosAdmin
        .cambiarEstado(usuario.idUsuario, nuevoEstado)
        .pipe(
            finalize(() => {
              this.procesandoId.set(null);
              this.pendiente.set(null);
            }),
        )
        .subscribe({
          next: (actualizado) => {
            this.reemplazar(actualizado);
            this.mensaje.set('El estado de la cuenta fue actualizado correctamente.');
          },
          error: (e) =>
              this.error.set(mensajeError(e, 'No fue posible actualizar el estado de la cuenta.')),
        });
  }

  private esUsuarioActual(usuario: Usuario): boolean {
    const actual = this.idActual();
    return actual !== null && actual === String(usuario.idUsuario);
  }

  private reemplazar(actualizado: Usuario): void {
    const id = String(actualizado.idUsuario);

    this.usuarios.update((lista) =>
        lista.map((u) => (String(u.idUsuario) === id ? { ...actualizado, idUsuario: id } : u)),
    );
  }

  private limpiarMensajes(): void {
    this.error.set('');
    this.mensaje.set('');
  }
}