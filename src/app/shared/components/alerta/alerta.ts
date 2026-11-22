import { Component, input } from '@angular/core';

@Component({
  selector: 'app-alerta',
  templateUrl: './alerta.html',
  styleUrl: './alerta.css',
})
export class Alerta {
  readonly tipo = input<'error' | 'exito'>('error');
  readonly fondo = input<'oscuro' | 'claro'>('oscuro');
}