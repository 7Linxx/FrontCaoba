import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService, Perfil } from '../core/auth/auth.service';

@Component({
  selector: 'app-usuarios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="admin-content">

      <div class="heading">
        <div>
          <p class="eyebrow">ADMINISTRACIÓN DE CUENTAS</p>
          <h1>Gestión de usuarios</h1>
          <p class="muted">
            Consulta las cuentas de Caoba y administra sus roles y estados.
          </p>
        </div>
      </div>

      <div class="error" *ngIf="error" role="alert">
        {{ error }}
      </div>

      <div class="success" *ngIf="mensaje" role="status">
        {{ mensaje }}
      </div>

      <div class="stats">
        <article class="stat">
          <span>Usuarios registrados</span>
          <strong>{{ usuarios.length }}</strong>
        </article>

        <article class="stat">
          <span>Cuentas activas</span>
          <strong>{{ activos }}</strong>
        </article>

        <article class="stat">
          <span>Cuentas inactivas</span>
          <strong>{{ inactivos }}</strong>
        </article>
      </div>

      <section class="table-card">
        <h2>Usuarios registrados</h2>

        <div *ngIf="cargando" class="loading">
          Consultando usuarios...
        </div>

        <div
          *ngIf="!cargando && error && usuarios.length === 0"
          class="empty">
          No fue posible cargar los usuarios.
        </div>

        <div
          *ngIf="!cargando && !error && usuarios.length === 0"
          class="empty">
          No hay usuarios registrados.
        </div>

        <div
          class="table-wrap"
          *ngIf="!cargando && usuarios.length > 0">

          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol actual</th>
                <th>Estado</th>
                <th>Actualizar rol</th>
                <th>Actualizar estado</th>
              </tr>
            </thead>

            <tbody>
              <tr
                *ngFor="let usuario of usuarios; trackBy: trackById">

                <td>
                  <strong>
                    {{ usuario.nombre }} {{ usuario.apellido }}
                  </strong>
                </td>

                <td>{{ usuario.correo }}</td>

                <td>{{ usuario.rol }}</td>

                <td>
                  <span
                    class="status"
                    [class.active]="usuario.estadoCuenta === 'ACTIVA'"
                    [class.inactive]="usuario.estadoCuenta !== 'ACTIVA'">
                    {{ usuario.estadoCuenta }}
                  </span>
                </td>

                <td>
                  <select
                    [ngModel]="usuario.rol"
                    (ngModelChange)="cambiarRol(usuario, $event)"
                    [disabled]="procesandoId === usuario.idUsuario ||
                                esAdministradorActual(usuario)">

                    <option value="HUESPED">Huésped</option>
                    <option value="ANFITRION">Anfitrión</option>
                    <option value="ADMINISTRADOR">Administrador</option>
                  </select>
                </td>

                <td>
                  <button
                    type="button"
                    class="small"
                    [class.danger]="usuario.estadoCuenta === 'ACTIVA'"
                    [disabled]="procesandoId === usuario.idUsuario ||
                                esAdministradorActual(usuario)"
                    (click)="cambiarEstado(usuario)">

                    {{ usuario.estadoCuenta === 'ACTIVA'
                      ? 'Desactivar'
                      : 'Activar' }}
                  </button>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `,
  styles: [`
    .admin-content {
      width: 100%;
    }

    .heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      margin-bottom: 24px;
    }

    h1 {
      margin: 8px 0;
    }

    .eyebrow {
      color: #82937f;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .muted {
      color: #7c8980;
      font-size: 13px;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 24px 0;
    }

    .stat {
      background: white;
      padding: 22px;
      border-radius: 14px;
    }

    .stat span {
      display: block;
      color: #7c8980;
      font-size: 13px;
    }

    .stat strong {
      display: block;
      font-size: 28px;
      color: #285b45;
      margin-top: 8px;
    }

    .table-card {
      background: white;
      border-radius: 14px;
      padding: 24px;
      min-height: 180px;
    }

    .table-card h2 {
      font-size: 19px;
      margin-top: 0;
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    th, td {
      padding: 14px 12px;
      text-align: left;
      border-bottom: 1px solid #e6ebe6;
      vertical-align: middle;
    }

    th {
      color: #607367;
      font-size: 11px;
      text-transform: uppercase;
    }

    td select {
      min-width: 140px;
    }

    .status {
      font-size: 12px;
      font-weight: 700;
    }

    .active {
      color: #26704a;
    }

    .inactive {
      color: #b13d3d;
    }

    .loading, .empty {
      padding: 35px;
      text-align: center;
      color: #7c8980;
    }

    .error {
      color: #b42318;
      margin: 15px 0;
      font-size: 14px;
    }

    .success {
      color: #26704a;
      margin: 15px 0;
      font-size: 14px;
    }

    .small {
      padding: 9px 12px;
      margin: 0;
      font-size: 12px;
    }

    .danger {
      background: #a94442;
    }

    button:disabled, select:disabled {
      opacity: .6;
      cursor: wait;
    }

    @media(max-width: 750px) {
      .stats {
        grid-template-columns: 1fr;
      }

      .heading {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `]
})
export class UsuariosAdminComponent implements OnInit {

  usuarios: Perfil[] = [];
  cargando = false;
  error = '';
  mensaje = '';
  procesandoId: number | string | null = null;

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  get activos(): number {
    return this.usuarios.filter(
      usuario => usuario.estadoCuenta === 'ACTIVA'
    ).length;
  }

  get inactivos(): number {
    return this.usuarios.filter(
      usuario => usuario.estadoCuenta !== 'ACTIVA'
    ).length;
  }

  trackById(index: number, usuario: Perfil): string {
    return String(usuario.idUsuario);
  }

  cargarUsuarios(): void {
    if (this.cargando) return;

    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    this.cdr.markForCheck();

    console.log('Consultando usuarios...');

    this.auth.listarUsuarios()
      .pipe(
        finalize(() => {
          this.cargando = false;

          console.log('Consulta finalizada.');
          console.log('Usuarios visibles:', this.usuarios.length);

          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (respuesta: Perfil[]) => {

          console.log('Respuesta del backend:', respuesta);

          if (!Array.isArray(respuesta)) {
            this.usuarios = [];
            this.error = 'El servidor devolvió un formato inesperado.';
            this.cdr.markForCheck();
            return;
          }

          this.usuarios = respuesta.map(usuario => ({
            ...usuario,
            idUsuario: String(usuario.idUsuario)
          }));

          console.log('Usuarios cargados:', this.usuarios);
          console.log('Total:', this.usuarios.length);

          this.cdr.markForCheck();
        },

        error: (e) => {
          console.error('Error consultando usuarios:', e);

          this.usuarios = [];

          if (e.status === 401) {
            this.error = 'Tu sesión expiró. Ingresa nuevamente.';
          } else if (e.status === 403) {
            this.error = 'No tienes permisos de administrador.';
          } else if (e.status === 0) {
            this.error = 'No fue posible conectar con el backend.';
          } else {
            this.error =
              e.error?.message ||
              e.error?.detail ||
              'No fue posible consultar los usuarios.';
          }

          this.cdr.markForCheck();
        }
      });
  }

  esAdministradorActual(usuario: Perfil): boolean {
    const actual = this.auth.usuario();

    return actual?.idUsuario != null &&
      String(actual.idUsuario) === String(usuario.idUsuario);
  }

  cambiarRol(usuario: Perfil, nuevoRol: string): void {

    if (nuevoRol === usuario.rol) return;

    if (this.esAdministradorActual(usuario)) {
      this.error = 'No puedes modificar tu propio rol.';
      this.cdr.markForCheck();
      return;
    }

    const rolAnterior = usuario.rol;

    this.procesandoId = usuario.idUsuario;
    this.error = '';
    this.mensaje = '';

    this.auth.asignarRol(usuario.idUsuario, nuevoRol)
      .pipe(
        finalize(() => {
          this.procesandoId = null;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (actualizado) => {
          this.reemplazarUsuario(actualizado);
          this.mensaje = 'El rol fue actualizado correctamente.';
          this.cdr.markForCheck();
        },

        error: (e) => {
          usuario.rol = rolAnterior;

          this.error =
            e.error?.message ||
            e.error?.detail ||
            'No fue posible actualizar el rol.';

          this.cdr.markForCheck();
        }
      });
  }

  cambiarEstado(usuario: Perfil): void {

    if (this.esAdministradorActual(usuario)) {
      this.error = 'No puedes desactivar tu propia cuenta.';
      this.cdr.markForCheck();
      return;
    }

    const nuevoEstado =
      usuario.estadoCuenta === 'ACTIVA'
        ? 'INACTIVA'
        : 'ACTIVA';

    const accion = nuevoEstado === 'ACTIVA'
      ? 'activar'
      : 'desactivar';

    if (!confirm(
      `¿Deseas ${accion} la cuenta de ${usuario.nombre} ${usuario.apellido}?`
    )) {
      return;
    }

    this.procesandoId = usuario.idUsuario;
    this.error = '';
    this.mensaje = '';

    this.auth.cambiarEstadoUsuario(
      usuario.idUsuario,
      nuevoEstado
    )
      .pipe(
        finalize(() => {
          this.procesandoId = null;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (actualizado) => {
          this.reemplazarUsuario(actualizado);
          this.mensaje = 'El estado de la cuenta fue actualizado correctamente.';
          this.cdr.markForCheck();
        },

        error: (e) => {
          this.error =
            e.error?.message ||
            e.error?.detail ||
            'No fue posible actualizar el estado de la cuenta.';

          this.cdr.markForCheck();
        }
      });
  }

  private reemplazarUsuario(actualizado: Perfil): void {
    this.usuarios = this.usuarios.map(usuario =>
      String(usuario.idUsuario) === String(actualizado.idUsuario)
        ? {
            ...actualizado,
            idUsuario: String(actualizado.idUsuario)
          }
        : usuario
    );

    this.cdr.markForCheck();
  }
}
