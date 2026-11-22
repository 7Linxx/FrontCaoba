import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { TokenService } from './token.service';

const RUTAS_PUBLICAS = [
  '/auth/login',
  '/auth/registro',
  '/auth/reactivar',
  '/auth/recuperacion',
  '/auth/restablecer',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const esPublica = RUTAS_PUBLICAS.some((ruta) => req.url.includes(ruta));
  if (esPublica) {
    return next(req);
  }

  const token = inject(TokenService).token();
  if (!token) {
    return next(req);
  }

  const auth = inject(AuthService);
  const peticion = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(peticion).pipe(
      catchError((error: unknown) => {
        // Token vencido o inválido: se cierra la sesión.
        if (error instanceof HttpErrorResponse && error.status === 401) {
          auth.cerrarSesion();
        }
        return throwError(() => error);
      }),
  );
};