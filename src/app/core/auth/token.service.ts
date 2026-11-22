import { Injectable, signal } from '@angular/core';

const CLAVE_TOKEN = 'caoba_token';

@Injectable({ providedIn: 'root' })
export class TokenService {
    private readonly _token = signal<string | null>(this.leer());

    readonly token = this._token.asReadonly();

    guardar(token: string): void {
        try {
            localStorage.setItem(CLAVE_TOKEN, token);
        } catch {
            /* el almacenamiento puede no estar disponible */
        }
        this._token.set(token);
    }

    limpiar(): void {
        try {
            localStorage.removeItem(CLAVE_TOKEN);
        } catch {
            /* el almacenamiento puede no estar disponible */
        }
        this._token.set(null);
    }

    private leer(): string | null {
        try {
            return localStorage.getItem(CLAVE_TOKEN);
        } catch {
            return null;
        }
    }
}