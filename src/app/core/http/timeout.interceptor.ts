import { HttpInterceptorFn } from '@angular/common/http';
import { timeout } from 'rxjs';

import { environment } from '../../environments/environment';

export const timeoutInterceptor: HttpInterceptorFn = (req, next) =>
    next(req).pipe(timeout(environment.tiempoMaximoMs));