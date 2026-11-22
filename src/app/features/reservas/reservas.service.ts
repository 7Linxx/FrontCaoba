import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { simular } from '../../core/utils/simular';
import {
    CancelacionRespuesta,
    CancelarReservaSolicitud,
    Reserva,
} from '../../models/reserva.model';
import {
    cancelarReservaDePrueba,
    listarMisReservas,
    listarReservasRecibidas,
} from './reservas.mock';

@Injectable({ providedIn: 'root' })
export class ReservasService {
    private readonly http = inject(HttpClient);

    private readonly api = `${environment.apiUrl}/reservas`;

    /** Historial de reservas del huésped autenticado (RF17). */
    misReservas(): Observable<Reserva[]> {
        return environment.datosDePrueba
            ? simular(listarMisReservas)
            : this.http.get<Reserva[]>(`${this.api}/mis-reservas`);
    }

    /** Reservas recibidas en los alojamientos del anfitrión autenticado (RF18). */
    reservasRecibidas(): Observable<Reserva[]> {
        return environment.datosDePrueba
            ? simular(listarReservasRecibidas)
            : this.http.get<Reserva[]>(`${this.api}/recibidas`);
    }

    /** Cancela una reserva confirmada registrando el motivo (RF20). */
    cancelar(id: number | string, motivo: string): Observable<CancelacionRespuesta> {
        if (environment.datosDePrueba) {
            return simular(() => cancelarReservaDePrueba(id, motivo));
        }

        const cuerpo: CancelarReservaSolicitud = { motivo };
        return this.http.patch<CancelacionRespuesta>(`${this.api}/${id}/cancelar`, cuerpo);
    }
}