/** Respuesta de GET /api/reporte/usuariosPorRol */
export interface ConteoRol {
    rol: string;
    cantidad: number;
    porcentaje: number;
}

/** Respuesta de GET /api/reporte/usuariosUltimoMes y usuariosUltimoAnio */
export interface ConteoPeriodo {
    /** Formato ISO: "2026-11-15" (día) o "2026-11" (mes). */
    periodo: string;
    /** Texto para la gráfica: "15/11" o "nov. 2026". */
    etiqueta: string;
    cantidad: number;
}

/** Dato genérico que reciben las gráficas. */
export interface ElementoGrafica {
    etiqueta: string;
    valor: number;
}

/** Resumen que arma el front con las reservas recibidas por el anfitrión. */
export interface ResumenReservasAnfitrion {
    total: number;
    ingresosEstimados: number;
    porEstado: ElementoGrafica[];
    porAlojamiento: ElementoGrafica[];
}