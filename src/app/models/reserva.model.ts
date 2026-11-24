export type EstadoReserva = 'CONFIRMADA' | 'CANCELADA' | 'FINALIZADA';

/** Qué vista de reservas corresponde al rol del usuario. */
export type ModoReservas = 'huesped' | 'anfitrion';

export const ETIQUETA_ESTADO_RESERVA: Record<EstadoReserva, string> = {
    CONFIRMADA: 'Confirmada',
    CANCELADA: 'Cancelada',
    FINALIZADA: 'Finalizada',
};

export function etiquetaEstadoReserva(estado: string): string {
    return ETIQUETA_ESTADO_RESERVA[estado as EstadoReserva] ?? estado;
}

export interface PoliticaCancelacion {
    idPolitica?: number;
    nombre: string;
    descripcion: string;
    diasLimiteReembolso: number;
    pctReembolsoEnPlazo: number;
    pctReembolsoFueraPlazo: number;
}

/** Forma que usan las pantallas de reservas. */
export interface Reserva {
    idReserva: number | string;
    alojamiento: string;
    /** Nombre del huésped (lo ve el anfitrión). */
    huesped: string;
    /** Fechas en formato AAAA-MM-DD. */
    fechaEntrada: string;
    fechaSalida: string;
    /** Fecha y hora de la solicitud en formato ISO. */
    fechaSolicitud: string;
    /** Lo que paga el huésped (incluye la tarifa de servicio). */
    precioTotal: number;
    /** Lo que recibe el anfitrión por la reserva. */
    ingresoAnfitrion: number;
    estado: string;
    politicaCancelacion: PoliticaCancelacion;
    comprobante: string;
    motivoCancelacion?: string | null;
    fechaCancelacion?: string | null;
    canceladaPor?: string | null;
}

export interface CancelarReservaSolicitud {
    motivo: string;
}

/** Respuesta del back al cancelar (CancelacionDTO). */
export interface CancelacionDto {
    idCancelacion: number;
    idReserva: number;
    idUsuario: number;
    nombreUsuario: string;
    fechaCancelacion: string;
    motivo: string;
    montoDevolucion: number;
    estadoReserva: string;
}

export interface CancelacionRespuesta {
    reserva: Reserva;
    montoDevolucion: number;
}

/** Forma que entrega el back (ReservaDTO). */
export interface ReservaDto {
    idReserva: number;
    codigoComprobante: string;
    fechaEntrada: string;
    fechaSalida: string;
    fechaSolicitud: string;
    total: number;
    montoTarifaServicio: number;
    estado: string;
    nombreHuesped: string;
    tituloAlojamiento: string;
    politicaCancelacion: PoliticaCancelacion;
    cancelacion?: CancelacionDto | null;
}

export function aReserva(d: ReservaDto): Reserva {
    return {
        idReserva: d.idReserva,
        alojamiento: d.tituloAlojamiento,
        huesped: d.nombreHuesped,
        fechaEntrada: d.fechaEntrada,
        fechaSalida: d.fechaSalida,
        fechaSolicitud: d.fechaSolicitud,
        precioTotal: d.total,
        // Si prefieres mostrar el total completo al anfitrión, cambia esta línea por: d.total
        ingresoAnfitrion: d.total - (d.montoTarifaServicio ?? 0),
        estado: d.estado,
        politicaCancelacion: d.politicaCancelacion,
        comprobante: d.codigoComprobante,
        motivoCancelacion: d.cancelacion?.motivo ?? null,
        fechaCancelacion: d.cancelacion?.fechaCancelacion ?? null,
        canceladaPor: d.cancelacion?.nombreUsuario ?? null,
    };
}