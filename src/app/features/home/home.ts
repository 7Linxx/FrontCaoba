import { Component } from '@angular/core';

import { IMAGENES } from '../../core/config/imagenes';

const DESCRIPCION_CARACTERISTICA =
    'Lugares céntricos o rurales, solo busca según tus preferencias';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly imagenes = IMAGENES;

  protected readonly caracteristicas = [
    { titulo: 'Centro', imagen: IMAGENES.centro, descripcion: DESCRIPCION_CARACTERISTICA },
    { titulo: 'Seguro', imagen: IMAGENES.seguro, descripcion: DESCRIPCION_CARACTERISTICA },
    { titulo: 'Privado', imagen: IMAGENES.privado, descripcion: DESCRIPCION_CARACTERISTICA },
  ];
}