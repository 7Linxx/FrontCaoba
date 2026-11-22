import { Component, input, output } from '@angular/core';

import {
  ESTADO_ACTIVA,
  ETIQUETA_ROL,
  Rol,
  Usuario,
  normalizarRol,
} from '../../../models/usuario.model';

@Component({
  selector: 'app-usuarios-tabla',
  templateUrl: './usuarios-tabla.html',
  styleUrl: './usuarios-tabla.css',
})
export class UsuariosTabla {
  readonly usuarios = input.required<Usuario[]>();
  readonly procesandoId = input<string | null>(null);
  readonly idActual = input<string | null>(null);

  readonly rolCambiado = output<{ usuario: Usuario; rol: Rol }>();
  readonly estadoSolicitado = output<Usuario>();

  protected readonly roles = (Object.keys(ETIQUETA_ROL) as Rol[]).map((valor) => ({
    valor,
    etiqueta: ETIQUETA_ROL[valor],
  }));

  protected esActual(usuario: Usuario): boolean {
    const actual = this.idActual();
    return actual !== null && actual === String(usuario.idUsuario);
  }

  protected bloqueado(usuario: Usuario): boolean {
    return this.procesandoId() === String(usuario.idUsuario) || this.esActual(usuario);
  }

  protected estaActiva(usuario: Usuario): boolean {
    return usuario.estadoCuenta === ESTADO_ACTIVA;
  }

  protected rolActual(usuario: Usuario): Rol | null {
    return normalizarRol(usuario.rol);
  }

  protected etiquetaRol(usuario: Usuario): string {
    const rol = this.rolActual(usuario);
    return rol ? ETIQUETA_ROL[rol] : usuario.rol;
  }

  protected alCambiarRol(usuario: Usuario, evento: Event): void {
    const select = evento.target as HTMLSelectElement;
    const nuevo = normalizarRol(select.value);

    // El select vuelve al rol real; solo cambia cuando el servidor confirma el cambio.
    select.value = this.rolActual(usuario) ?? '';

    if (nuevo && nuevo !== this.rolActual(usuario)) {
      this.rolCambiado.emit({ usuario, rol: nuevo });
    }
  }
}