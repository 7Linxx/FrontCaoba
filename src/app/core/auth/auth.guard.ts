import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { Rol, normalizarRol } from '../../models/usuario.model';
import { AuthService } from './auth.service';

/** Exige sesión iniciada. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.token()) {
    return router.createUrlTree(['/login']);
  }

  return auth.asegurarPerfil().pipe(
      map(() => true),
      catchError(() => {
        auth.limpiarSesion();
        return of(router.createUrlTree(['/login']));
      }),
  );
};

/** Exige sesión iniciada y que el rol esté entre los permitidos. */
export const rolGuard =
    (...permitidos: Rol[]): CanActivateFn =>
        () => {
          const auth = inject(AuthService);
          const router = inject(Router);

          if (!auth.token()) {
            return router.createUrlTree(['/login']);
          }

          return auth.asegurarPerfil().pipe(
              map((usuario) => {
                const rol = normalizarRol(usuario.rol);
                return rol !== null && permitidos.includes(rol) ? true : router.createUrlTree(['/inicio']);
              }),
              catchError(() => {
                auth.limpiarSesion();
                return of(router.createUrlTree(['/login']));
              }),
          );
        };

export const adminGuard: CanActivateFn = rolGuard('ADMINISTRADOR');