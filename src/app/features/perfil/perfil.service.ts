import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../environments/environment';
import { ActualizarPerfilSolicitud, EstadoCuentaRespuesta } from '../../models/perfil.model';
import { Usuario } from '../../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class PerfilService {
    private readonly http = inject(HttpClient);
    private readonly auth = inject(AuthService);

    private readonly api = `${environment.apiUrl}/auth`;

    actualizar(datos: ActualizarPerfilSolicitud): Observable<Usuario> {
        return this.http
            .put<Usuario>(`${this.api}/perfil`, datos)
            .pipe(tap((usuario) => this.auth.establecerUsuario(usuario)));
    }

    cambiarEstadoCuenta(activa: boolean): Observable<EstadoCuentaRespuesta> {
        return this.http.patch<EstadoCuentaRespuesta>(`${this.api}/cuenta`, null, {
            params: { activa },
        });
    }
}