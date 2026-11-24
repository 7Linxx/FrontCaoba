import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { timeout } from 'rxjs';

import { environment } from '../../environments/environment';

export const TIEMPO_MAXIMO_MS = new HttpContextToken<number>(
    () => environment.tiempoMaximoMs,
);

export const timeoutInterceptor: HttpInterceptorFn = (req, next) => {
    const tiempo = req.context.get(TIEMPO_MAXIMO_MS);
    return next(req).pipe(timeout(tiempo));
};