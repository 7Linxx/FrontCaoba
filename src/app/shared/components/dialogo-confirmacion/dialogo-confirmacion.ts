import { Component, input, output } from '@angular/core';

/** Ventana de confirmación para acciones delicadas (desactivar cuenta, cambiar estado). */
@Component({
  selector: 'app-dialogo-confirmacion',
  templateUrl: './dialogo-confirmacion.html',
  styleUrl: './dialogo-confirmacion.css',
  host: { '(document:keydown.escape)': 'alCancelar()' },
})
export class DialogoConfirmacion {
  readonly abierto = input.required<boolean>();
  readonly titulo = input.required<string>();
  readonly mensaje = input('');
  readonly textoConfirmar = input('Confirmar');
  readonly peligro = input(false);
  readonly cargando = input(false);

  readonly confirmar = output<void>();
  readonly cancelar = output<void>();

  alCancelar(): void {
    if (this.abierto() && !this.cargando()) {
      this.cancelar.emit();
    }
  }
}