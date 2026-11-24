import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Rol, Usuario } from '../../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosAdminService {
    private readonly http = inject(HttpClient);

    private readonly api = `${environment.apiUrl}/admin`;

    listar(): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(this.api);
    }

    asignarRol(id: number | string, rol: Rol): Observable<Usuario> {
        return this.http.patch<Usuario>(`${this.api}/rol/${id}`, { nombre: rol });
    }

    cambiarEstado(id: number | string, estado: string, motivo?: string): Observable<Usuario> {
        const cuerpo: { estado: string; motivo?: string } = { estado };

        if (motivo) {
            cuerpo.motivo = motivo;
        }

        return this.http.patch<Usuario>(`${this.api}/estado/${id}`, cuerpo);
    }
}