import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { ReservaSolicitud } from '../../models/cotizacion.model';
import {
    CancelacionDto,
    CancelacionRespuesta,
    CancelarReservaSolicitud,
    Reserva,
    ReservaDto,
    aReserva,
} from '../../models/reserva.model';

@Injectable({ providedIn: 'root' })
export class ReservasService {
    private readonly http = inject(HttpClient);

    private readonly api = `${environment.apiUrl}/reservas`;

    /** Historial de reservas del huésped autenticado (RF17). */
    misReservas(): Observable<Reserva[]> {
        return this.http
            .get<ReservaDto[]>(`${this.api}/mias`)
            .pipe(map((lista) => lista.map(aReserva)));
    }

    /** Reservas recibidas en los alojamientos del anfitrión autenticado (RF18). */
    reservasRecibidas(): Observable<Reserva[]> {
        return this.http
            .get<ReservaDto[]>(`${this.api}/anfitrion`)
            .pipe(map((lista) => lista.map(aReserva)));
    }

    /** Confirma una reserva. La clave de idempotencia evita duplicados (RF16). */
    crear(solicitud: ReservaSolicitud): Observable<Reserva> {
        return this.http.post<ReservaDto>(this.api, solicitud).pipe(map(aReserva));
    }

    /** Cancela una reserva confirmada registrando el motivo (RF20). */
    cancelar(reserva: Reserva, motivo: string): Observable<CancelacionRespuesta> {
        const cuerpo: CancelarReservaSolicitud = { motivo };

        return this.http
            .post<CancelacionDto>(`${this.api}/${reserva.idReserva}/cancelar`, cuerpo)
            .pipe(
                map((c) => ({
                    reserva: {
                        ...reserva,
                        estado: c.estadoReserva,
                        motivoCancelacion: c.motivo,
                        fechaCancelacion: c.fechaCancelacion,
                        canceladaPor: c.nombreUsuario,
                    },
                    montoDevolucion: c.montoDevolucion,
                })),
            );
    }
}