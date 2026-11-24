import { Observable, defer, delay, of } from 'rxjs';

/** Devuelve un resultado de ejemplo con una pequeña espera, como si viniera del backend. */
export function simular<T>(generar: () => T, esperaMs = 450): Observable<T> {
    return defer(() => of(generar())).pipe(delay(esperaMs));
}