import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IMAGENES } from '../../core/config/imagenes';

const DESCRIPCION_CARACTERISTICA =
    'Lugares céntricos o rurales, solo busca según tus preferencias';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
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