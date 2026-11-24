import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import {
    AlojamientoResumen,
    Cotizacion,
    CotizacionSolicitud,
} from '../../models/cotizacion.model';

@Injectable({ providedIn: 'root' })
export class CotizacionesService {
    private readonly http = inject(HttpClient);

    /** Alojamientos activos que puede cotizar el huésped. */
    listarAlojamientos(): Observable<AlojamientoResumen[]> {
        return this.http
            .get<AlojamientoResumen[]>(`${environment.apiUrl}/alojamientos`)
            .pipe(
                map((lista) =>
                    lista.map((a) => ({ ...a, serviciosAdicionales: a.serviciosAdicionales ?? [] })),
                ),
            );
    }

    cotizar(solicitud: CotizacionSolicitud): Observable<Cotizacion> {
        return this.http.post<Cotizacion>(`${environment.apiUrl}/cotizaciones`, solicitud);
    }
}