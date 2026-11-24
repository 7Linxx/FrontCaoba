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
    nombre: string;
    descripcion: string;
    porcentajeDevolucion: number;
}

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
    precioTotal: number;
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

export interface CancelacionRespuesta {
    reserva: Reserva;
    /** Devolución simulada según la política del alojamiento. */
    montoDevolucion: number;
}