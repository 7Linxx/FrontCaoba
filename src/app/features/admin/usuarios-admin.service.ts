import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Rol, Usuario } from '../../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosAdminService {
    private readonly http = inject(HttpClient);

    private readonly api = `${environment.apiUrl}/admin/usuarios`;

    listar(): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(this.api);
    }

    asignarRol(id: number | string, rol: Rol): Observable<Usuario> {
        return this.http.patch<Usuario>(`${this.api}/${id}/rol`, { rol });
    }

    cambiarEstado(id: number | string, estado: string): Observable<Usuario> {
        return this.http.patch<Usuario>(`${this.api}/${id}/estado`, { estado });
    }
}