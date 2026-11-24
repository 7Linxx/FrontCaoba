import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { ConteoPeriodo, ConteoRol, ResumenReservasAnfitrion } from '../../models/reporte.model';
import {
    ETIQUETA_ESTADO_RESERVA,
    EstadoReserva,
    Reserva,
} from '../../models/reserva.model';
import { ReservasService } from '../reservas/reservas.service';

const ESTADOS: EstadoReserva[] = ['CONFIRMADA', 'FINALIZADA', 'CANCELADA'];

export type FormatoReporte = 'pdf' | 'excel';

@Injectable({ providedIn: 'root' })
export class ReportesService {
    private readonly http = inject(HttpClient);
    private readonly reservas = inject(ReservasService);

    private readonly api = `${environment.apiUrl}/reporte`;

    usuariosPorRol(): Observable<ConteoRol[]> {
        return this.http.get<ConteoRol[]>(`${this.api}/usuariosPorRol`);
    }

    usuariosUltimoMes(): Observable<ConteoPeriodo[]> {
        return this.http.get<ConteoPeriodo[]>(`${this.api}/usuariosUltimoMes`);
    }

    usuariosUltimoAnio(): Observable<ConteoPeriodo[]> {
        return this.http.get<ConteoPeriodo[]>(`${this.api}/usuariosUltimoAnio`);
    }

    /** Resumen del anfitrión, calculado con las reservas que ha recibido. */
    resumenReservasAnfitrion(): Observable<ResumenReservasAnfitrion> {
        return this.reservas.reservasRecibidas().pipe(map(resumir));
    }

    /** Descarga el reporte como archivo: GET /api/reporte/{reporte}/pdf|excel */
    descargar(reporte: string, formato: FormatoReporte): Observable<Blob> {
        return this.http.get(`${this.api}/${reporte}/${formato}`, { responseType: 'blob' });
    }
}

function resumir(reservas: Reserva[]): ResumenReservasAnfitrion {
    const vigentes = reservas.filter((reserva) => reserva.estado !== 'CANCELADA');
    const porAlojamiento = new Map<string, number>();

    for (const reserva of vigentes) {
        porAlojamiento.set(reserva.alojamiento, (porAlojamiento.get(reserva.alojamiento) ?? 0) + 1);
    }

    return {
        total: reservas.length,
        ingresosEstimados: vigentes.reduce((suma, reserva) => suma + reserva.precioTotal, 0),
        porEstado: ESTADOS.map((estado) => ({
            etiqueta: ETIQUETA_ESTADO_RESERVA[estado],
            valor: reservas.filter((reserva) => reserva.estado === estado).length,
        })),
        porAlojamiento: [...porAlojamiento]
            .map(([etiqueta, valor]) => ({ etiqueta, valor }))
            .sort((a, b) => b.valor - a.valor),
    };
}