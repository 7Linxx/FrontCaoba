import { Component, computed, input } from '@angular/core';

import { ElementoGrafica } from '../../../models/reporte.model';

const ANCHO = 640;
const ALTO = 260;
const MARGEN_IZQ = 40;
const MARGEN_DER = 10;
const MARGEN_SUP = 12;
const MARGEN_INF = 36;
const ALTURA_UTIL = ALTO - MARGEN_SUP - MARGEN_INF;
const ANCHO_UTIL = ANCHO - MARGEN_IZQ - MARGEN_DER;

@Component({
  selector: 'app-grafica-barras',
  templateUrl: './grafica-barras.html',
  styleUrl: './grafica-barras.css',
})
export class GraficaBarras {
  readonly datos = input.required<ElementoGrafica[]>();
  readonly descripcion = input('Cantidad por periodo');

  protected readonly anchoVista = ANCHO;
  protected readonly altoVista = ALTO;
  protected readonly margenIzq = MARGEN_IZQ;
  protected readonly margenDer = MARGEN_DER;
  protected readonly yEtiqueta = ALTO - 12;

  private readonly maximo = computed(() =>
      Math.max(1, ...this.datos().map((dato) => dato.valor)),
  );

  protected readonly lineas = computed(() => {
    const maximo = this.maximo();
    const valores = [...new Set([0, Math.round(maximo / 2), maximo])];

    return valores.map((valor) => ({
      valor,
      y: MARGEN_SUP + ALTURA_UTIL * (1 - valor / maximo),
    }));
  });

  protected readonly barras = computed(() => {
    const datos = this.datos();
    const cantidad = datos.length;
    if (cantidad === 0) return [];

    const maximo = this.maximo();
    const ranura = ANCHO_UTIL / cantidad;
    const ancho = Math.min(ranura * 0.66, 36);
    // Con muchas barras solo se muestra una de cada N etiquetas para que no se amontonen.
    const cadaN = Math.ceil(cantidad / 10);

    return datos.map((dato, indice) => {
      const alto = (dato.valor / maximo) * ALTURA_UTIL;

      return {
        etiqueta: dato.etiqueta,
        valor: dato.valor,
        x: MARGEN_IZQ + ranura * indice + (ranura - ancho) / 2,
        y: MARGEN_SUP + ALTURA_UTIL - alto,
        ancho,
        alto,
        xEtiqueta: MARGEN_IZQ + ranura * indice + ranura / 2,
        mostrarEtiqueta: indice % cadaN === 0,
      };
    });
  });
}