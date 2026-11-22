import { Component, input } from '@angular/core';

/**
 * Tarjeta de cristal sobre el fondo del bosque, usada por login, registro,
 * recuperar y reactivar. Recibe dos contenidos: [panel-formulario] y [panel-info].
 */
@Component({
  selector: 'app-auth-tarjeta',
  templateUrl: './auth-tarjeta.html',
  styleUrl: './auth-tarjeta.css',
})
export class AuthTarjeta {
  /** true: panel verde a la izquierda (login). false: a la derecha (registro). */
  readonly formularioIzquierda = input(true);
}