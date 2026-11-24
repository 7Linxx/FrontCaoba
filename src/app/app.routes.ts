import { Routes } from '@angular/router';

import { adminGuard, authGuard, rolGuard } from './core/auth/auth.guard';
import { ROLES_RESERVAS } from './core/config/permisos';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },

  // Pantallas públicas
  {
    path: 'login',
    title: 'Iniciar sesión | CAOBA',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    title: 'Crear cuenta | CAOBA',
    loadComponent: () => import('./features/auth/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'recuperar',
    title: 'Recuperar acceso | CAOBA',
    loadComponent: () =>
        import('./features/auth/recuperar-contrasena/recuperar-contrasena').then(
            (m) => m.RecuperarContrasena,
        ),
  },
  {
    path: 'reactivar',
    title: 'Reactivar cuenta | CAOBA',
    loadComponent: () =>
        import('./features/auth/reactivar-cuenta/reactivar-cuenta').then((m) => m.ReactivarCuenta),
  },

  // Pantallas con sesión iniciada (navbar + contenido)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
        import('./shared/components/layout-principal/layout-principal').then(
            (m) => m.LayoutPrincipal,
        ),
    children: [
      {
        path: 'inicio',
        title: 'Inicio | CAOBA',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'perfil',
        title: 'Mi perfil | CAOBA',
        loadComponent: () => import('./features/perfil/perfil/perfil').then((m) => m.Perfil),
      },
      {
        path: 'administracion/usuarios',
        title: 'Gestión de usuarios | CAOBA',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/usuarios/usuarios').then((m) => m.Usuarios),
      },
      {
        path: 'reservas',
        title: 'Reservas | CAOBA',
        canActivate: [rolGuard(...ROLES_RESERVAS)],
        loadComponent: () =>
            import('./features/reservas/reservas/reservas').then((m) => m.Reservas),
      },
      // reportes
    ],
  },

  { path: '**', redirectTo: 'inicio' },
];