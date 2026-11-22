import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { ROLES_REPORTES, ROLES_RESERVAS } from '../../../core/config/permisos';
import { IMAGENES } from '../../../core/config/imagenes';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected readonly auth = inject(AuthService);

  protected readonly logo = IMAGENES.logo;
  protected readonly menuAbierto = signal(false);

  protected readonly puedeVerReservas = computed(() => {
    const rol = this.auth.rol();
    return rol !== null && ROLES_RESERVAS.includes(rol);
  });
  // tmp
  protected readonly puedeVerReportes = computed(() => {
    const rol = this.auth.rol();
    return rol !== null && ROLES_REPORTES.includes(rol);
  });

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  protected cerrarSesion(): void {
    this.menuAbierto.set(false);
    this.auth.cerrarSesion();
  }
}