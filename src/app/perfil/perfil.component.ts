import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuthService, Perfil } from '../core/auth/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `
    <section class="panel wide">

      <p class="eyebrow">MI CUENTA</p>

      <h1>Mi perfil</h1>

      <p class="muted">
        Consulta y administra tu información personal en Caoba.
      </p>

      <div class="error" *ngIf="error" role="alert">
        {{ error }}
      </div>

      <div class="success" *ngIf="mensaje" role="status">
        {{ mensaje }}
      </div>

      <div *ngIf="cargando" class="muted">
        Consultando información del perfil...
      </div>

      <form
        *ngIf="!cargando && d.idUsuario"
        (ngSubmit)="guardar()"
        #perfilForm="ngForm">

        <div class="two">

          <label>
            Nombre
            <input
              type="text"
              name="nombre"
              [(ngModel)]="d.nombre"
              required
              maxlength="100">
          </label>

          <label>
            Apellido
            <input
              type="text"
              name="apellido"
              [(ngModel)]="d.apellido"
              required
              maxlength="100">
          </label>

        </div>

        <label>
          Correo electrónico
          <input
            type="email"
            [value]="d.correo"
            disabled>
        </label>

        <label>
          Teléfono
          <input
            type="tel"
            name="telefono"
            [(ngModel)]="d.telefono"
            maxlength="20">
        </label>

        <p class="muted">
          Rol: {{ d.rol }} · Estado: {{ d.estadoCuenta }}
        </p>

        <button
          type="submit"
          [disabled]="guardando || perfilForm.invalid">
          {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
        </button>

        <button
          *ngIf="d.estadoCuenta === 'ACTIVA'"
          type="button"
          class="secondary"
          (click)="cambiarEstado()"
          [disabled]="guardando">
          Desactivar cuenta
        </button>

      </form>

      <p
        *ngIf="!cargando && !d.idUsuario && !error"
        class="muted">
        No se encontró información del perfil.
      </p>

    </section>
  `
})
export class PerfilComponent implements OnInit {

  d: Perfil = {
    idUsuario: '',
    nombre: '',
    apellido: '',
    correo: '',
    telefono: null,
    rol: '',
    estadoCuenta: ''
  };

  cargando = true;
  guardando = false;
  mensaje = '';
  error = '';

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    this.auth.perfil()
      .pipe(
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (u: Perfil) => {
          console.log('Perfil recibido:', u);

          this.d = {
            idUsuario: String(u.idUsuario ?? ''),
            nombre: u.nombre ?? '',
            apellido: u.apellido ?? '',
            correo: u.correo ?? '',
            telefono: u.telefono ?? null,
            rol: u.rol ?? '',
            estadoCuenta: u.estadoCuenta ?? ''
          };

          if (!this.d.idUsuario) {
            this.error =
              'El servidor no devolvió el identificador del usuario.';
          }
        },

        error: e => {
          console.error('Error cargando perfil:', e);

          this.error =
            e.error?.message ||
            e.error?.detail ||
            'No se pudo cargar la información del perfil.';
        }
      });
  }

  guardar(): void {
    this.error = '';
    this.mensaje = '';

    if (!this.d.nombre.trim() || !this.d.apellido.trim()) {
      this.error = 'El nombre y el apellido son obligatorios.';
      return;
    }

    if (this.guardando) return;

    this.guardando = true;

    const datos = {
      nombre: this.d.nombre.trim(),
      apellido: this.d.apellido.trim(),
      telefono: this.d.telefono?.trim() || null
    };

    this.auth.actualizar(datos)
      .pipe(
        finalize(() => {
          this.guardando = false;
        })
      )
      .subscribe({
        next: u => {
          this.d = {
            ...this.d,
            ...u
          };

          this.mensaje = 'Perfil actualizado correctamente.';
        },

        error: e => {
          console.error('Error actualizando perfil:', e);

          this.error =
            e.error?.message ||
            e.error?.detail ||
            'No fue posible actualizar el perfil.';
        }
      });
  }

  cambiarEstado(): void {
    if (!confirm('¿Deseas desactivar tu cuenta?')) {
      return;
    }

    this.auth.cambiarEstado(false).subscribe({
      next: () => this.auth.logout(),

      error: e => {
        this.error =
          e.error?.message ||
          e.error?.detail ||
          'No se pudo desactivar la cuenta.';
      }
    });
  }
}
