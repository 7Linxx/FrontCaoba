import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { ModoReservas, Reserva, etiquetaEstadoReserva } from '../../../models/reserva.model';

@Component({
  selector: 'app-reservas-tabla',
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './reservas-tabla.html',
  styleUrl: './reservas-tabla.css',
})
export class ReservasTabla {
  readonly reservas = input.required<Reserva[]>();
  readonly modo = input.required<ModoReservas>();

  readonly detalleSolicitado = output<Reserva>();

  protected etiqueta(reserva: Reserva): string {
    return etiquetaEstadoReserva(reserva.estado);
  }

  protected confirmada(reserva: Reserva): boolean {
    return reserva.estado === 'CONFIRMADA';
  }

  protected cancelada(reserva: Reserva): boolean {
    return reserva.estado === 'CANCELADA';
  }
}