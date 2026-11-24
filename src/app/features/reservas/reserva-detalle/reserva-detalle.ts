import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

import { Reserva, etiquetaEstadoReserva } from '../../../models/reserva.model';

/** Ventana con el detalle de una reserva: fechas, precio, política de cancelación y comprobante. */
@Component({
  selector: 'app-reserva-detalle',
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './reserva-detalle.html',
  styleUrl: './reserva-detalle.css',
  host: { '(document:keydown.escape)': 'cerrar.emit()' },
})
export class ReservaDetalle {
  readonly reserva = input.required<Reserva>();
  readonly puedeCancelar = input(false);
  /** Si es true, muestra el huésped y el dinero que recibe el anfitrión. */
  readonly esAnfitrion = input(false);

  readonly cerrar = output<void>();
  readonly cancelar = output<void>();

  protected readonly etiqueta = computed(() => etiquetaEstadoReserva(this.reserva().estado));
  protected readonly confirmada = computed(() => this.reserva().estado === 'CONFIRMADA');
  protected readonly cancelada = computed(() => this.reserva().estado === 'CANCELADA');
}