import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { mensajeError } from '../../../core/utils/mensaje-error';
import {
  ConteoPeriodo,
  ConteoRol,
  ElementoGrafica,
  ResumenReservasAnfitrion,
} from '../../../models/reporte.model';
import { ETIQUETA_ROL, normalizarRol } from '../../../models/usuario.model';
import { Alerta } from '../../../shared/components/alerta/alerta';
import { GraficaBarras } from '../../../shared/components/grafica-barras/grafica-barras';
import { GraficaDona } from '../../../shared/components/grafica-dona/grafica-dona';
import { FormatoReporte, ReportesService } from '../reportes.service';

type ModoReportes = 'administrador' | 'anfitrion';

interface ReporteDescargable {
  /** Nombre del reporte; también es el nombre del archivo descargado. */
  id: string;
  /** Ruta en el back, después de /api/reporte */
  ruta: string;
  etiqueta: string;
}

/** Reportes que el back sabe exportar, según el rol. */
const DESCARGAS_ADMINISTRADOR: ReporteDescargable[] = [
  { id: 'usuariosPorRol', ruta: 'usuariosPorRol', etiqueta: 'Usuarios por rol' },
  { id: 'usuariosUltimoMes', ruta: 'usuariosUltimoMes', etiqueta: 'Registros del último mes' },
  { id: 'usuariosUltimoAnio', ruta: 'usuariosUltimoAnio', etiqueta: 'Registros del último año' },
];

const DESCARGAS_ANFITRION: ReporteDescargable[] = [
  {
    id: 'misReservasPorEstado',
    ruta: 'anfitrion/misReservasPorEstado',
    etiqueta: 'Mis reservas por estado',
  },
];

function suma(valores: number[]): number {
  return valores.reduce((total, valor) => total + valor, 0);
}

function etiquetaRol(rol: string): string {
  const normalizado = normalizarRol(rol);
  return normalizado ? ETIQUETA_ROL[normalizado] : rol;
}

@Component({
  selector: 'app-reportes',
  imports: [CurrencyPipe, Alerta, GraficaDona, GraficaBarras],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
  host: { class: 'pagina' },
})
export class Reportes {
  private readonly auth = inject(AuthService);
  private readonly reportes = inject(ReportesService);

  /** El administrador ve reportes de usuarios; el anfitrión, de sus reservas. */
  protected readonly modo = computed<ModoReportes | null>(() => {
    const rol = this.auth.rol();
    if (rol === 'ADMINISTRADOR') return 'administrador';
    if (rol === 'ANFITRION') return 'anfitrion';
    return null;
  });

  protected readonly cargando = signal(false);
  protected readonly error = signal('');

  // Administrador
  protected readonly roles = signal<ConteoRol[]>([]);
  protected readonly ultimoMes = signal<ConteoPeriodo[]>([]);
  protected readonly ultimoAnio = signal<ConteoPeriodo[]>([]);

  // Anfitrión
  protected readonly resumen = signal<ResumenReservasAnfitrion | null>(null);

  // Descargas
  protected readonly reportesDescargables = computed<ReporteDescargable[]>(() =>
      this.modo() === 'anfitrion' ? DESCARGAS_ANFITRION : DESCARGAS_ADMINISTRADOR,
  );
  private readonly idReporteElegido = signal('');
  protected readonly reporteElegido = computed<ReporteDescargable>(() => {
    const lista = this.reportesDescargables();
    return lista.find((r) => r.id === this.idReporteElegido()) ?? lista[0];
  });
  protected readonly descargando = signal<FormatoReporte | null>(null);
  protected readonly errorDescarga = signal('');

  protected readonly totalUsuarios = computed(() => suma(this.roles().map((r) => r.cantidad)));
  protected readonly nuevosMes = computed(() => suma(this.ultimoMes().map((p) => p.cantidad)));
  protected readonly nuevosAnio = computed(() => suma(this.ultimoAnio().map((p) => p.cantidad)));

  protected readonly datosRoles = computed<ElementoGrafica[]>(() =>
      this.roles().map((r) => ({ etiqueta: etiquetaRol(r.rol), valor: r.cantidad })),
  );
  protected readonly datosMes = computed<ElementoGrafica[]>(() =>
      this.ultimoMes().map((p) => ({ etiqueta: p.etiqueta, valor: p.cantidad })),
  );
  protected readonly datosAnio = computed<ElementoGrafica[]>(() =>
      this.ultimoAnio().map((p) => ({ etiqueta: p.etiqueta, valor: p.cantidad })),
  );

  protected readonly maximoAlojamiento = computed(() =>
      Math.max(1, ...(this.resumen()?.porAlojamiento.map((a) => a.valor) ?? [])),
  );

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    const modo = this.modo();
    if (!modo || this.cargando()) return;

    this.cargando.set(true);
    this.error.set('');

    if (modo === 'administrador') {
      forkJoin({
        roles: this.reportes.usuariosPorRol(),
        mes: this.reportes.usuariosUltimoMes(),
        anio: this.reportes.usuariosUltimoAnio(),
      })
          .pipe(finalize(() => this.cargando.set(false)))
          .subscribe({
            next: ({ roles, mes, anio }) => {
              this.roles.set(roles);
              this.ultimoMes.set(mes);
              this.ultimoAnio.set(anio);
            },
            error: (e) => this.fallar(e),
          });
      return;
    }

    this.reportes
        .resumenReservasAnfitrion()
        .pipe(finalize(() => this.cargando.set(false)))
        .subscribe({
          next: (resumen) => this.resumen.set(resumen),
          error: (e) => this.fallar(e),
        });
  }

  protected elegirReporte(evento: Event): void {
    this.idReporteElegido.set((evento.target as HTMLSelectElement).value);
  }

  protected descargar(formato: FormatoReporte): void {
    if (this.descargando()) return;

    const reporte = this.reporteElegido();
    this.descargando.set(formato);
    this.errorDescarga.set('');

    this.reportes
        .descargar(reporte.ruta, formato)
        .pipe(finalize(() => this.descargando.set(null)))
        .subscribe({
          next: (archivo) =>
              this.guardarArchivo(archivo, `${reporte.id}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`),
          error: (e) =>
              this.errorDescarga.set(
                  mensajeError(e, 'No fue posible descargar el reporte. Inténtalo de nuevo.', {
                    fijos: {
                      401: 'Tu sesión expiró. Ingresa nuevamente.',
                      403: 'No tienes permisos para descargar este reporte.',
                      404: 'Este reporte no está disponible para descargar.',
                    },
                  }),
              ),
        });
  }

  protected porcentajeAlojamiento(valor: number): number {
    return (valor / this.maximoAlojamiento()) * 100;
  }

  /** Dispara la descarga en el navegador a partir del archivo recibido. */
  private guardarArchivo(archivo: Blob, nombre: string): void {
    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  }

  private fallar(e: unknown): void {
    this.roles.set([]);
    this.ultimoMes.set([]);
    this.ultimoAnio.set([]);
    this.resumen.set(null);

    this.error.set(
        mensajeError(e, 'No fue posible consultar los reportes.', {
          fijos: {
            401: 'Tu sesión expiró. Ingresa nuevamente.',
            403: 'No tienes permisos para consultar los reportes.',
          },
        }),
    );
  }
}