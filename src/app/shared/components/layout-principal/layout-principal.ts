import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from '../navbar/navbar';

/** Estructura de las pantallas con sesión iniciada: navbar arriba y contenido debajo. */
@Component({
  selector: 'app-layout-principal',
  imports: [Navbar, RouterOutlet],
  templateUrl: './layout-principal.html',
  styleUrl: './layout-principal.css',
})
export class LayoutPrincipal {}