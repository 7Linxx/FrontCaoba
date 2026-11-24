import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { ElementoGrafica } from '../../../models/reporte.model';

const COLORES = ['var(--color-verde)', 'var(--color-tan)', 'var(--color-cafe)', '#b8b8ad', '#6f8a78'];
const RADIO = 70;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

@Component({
  selector: 'app-grafica-dona',
  imports: [DecimalPipe],
  templateUrl: './grafica-dona.html',
  styleUrl: './grafica-dona.css',
})
export class GraficaDona {
  readonly datos = input.required<ElementoGrafica[]>();
  readonly descripcion = input('Distribución');
  /** Texto bajo el total, en el centro (por ejemplo "usuarios"). */
  readonly unidad = input('');

  protected readonly radio = RADIO;
  protected readonly circunferencia = CIRCUNFERENCIA;

  protected readonly total = computed(() =>
      this.datos().reduce((suma, dato) => suma + dato.valor, 0),
  );

  protected readonly segmentos = computed(() => {
    const total = this.total();
    let acumulado = 0;

    return this.datos().map((dato, indice) => {
      const fraccion = total > 0 ? dato.valor / total : 0;
      const largo = fraccion * CIRCUNFERENCIA;

      const segmento = {
        etiqueta: dato.etiqueta,
        valor: dato.valor,
        porcentaje: fraccion * 100,
        color: COLORES[indice % COLORES.length],
        largo,
        desplazamiento: -acumulado,
      };

      acumulado += largo;
      return segmento;
    });
  });
}