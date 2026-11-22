import {
    CancelacionRespuesta,
    PoliticaCancelacion,
    Reserva,
} from '../../models/reserva.model';

/**
 * Datos de ejemplo mientras el backend de reservas no está listo.
 * Se activan con environment.datosDePrueba. Los cambios duran hasta recargar la página.
 */

const DIAS_PLAZO_CANCELACION = 5;

function aFechaIso(fecha: Date): string {
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function desdeHoy(dias: number): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return aFechaIso(fecha);
}

function momentoDesdeHoy(dias: number, hora = 10): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    fecha.setHours(hora, 0, 0, 0);
    return fecha.toISOString();
}

function diasHastaEntrada(fechaEntrada: string): number {
    const [anio, mes, dia] = fechaEntrada.split('-').map(Number);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return Math.round((new Date(anio, mes - 1, dia).getTime() - hoy.getTime()) / 86_400_000);
}

const FLEXIBLE: PoliticaCancelacion = {
    nombre: 'Flexible',
    descripcion: 'Devolución total si cancelas con al menos 5 días de anticipación.',
    porcentajeDevolucion: 100,
};

const MODERADA: PoliticaCancelacion = {
    nombre: 'Moderada',
    descripcion: 'Devolución del 50 % si cancelas con al menos 5 días de anticipación.',
    porcentajeDevolucion: 50,
};

const ESTRICTA: PoliticaCancelacion = {
    nombre: 'Estricta',
    descripcion: 'Devolución del 30 % si cancelas con al menos 5 días de anticipación.',
    porcentajeDevolucion: 30,
};

let reservasHuesped: Reserva[] = [
    {
        idReserva: 101,
        alojamiento: 'Cabaña del Lago',
        huesped: 'Tú',
        fechaEntrada: desdeHoy(20),
        fechaSalida: desdeHoy(24),
        fechaSolicitud: momentoDesdeHoy(-3, 15),
        precioTotal: 1_240_000,
        estado: 'CONFIRMADA',
        politicaCancelacion: FLEXIBLE,
        comprobante: 'CMP-2026-000101',
    },
    {
        idReserva: 102,
        alojamiento: 'Apartamento Chapinero',
        huesped: 'Tú',
        fechaEntrada: desdeHoy(3),
        fechaSalida: desdeHoy(6),
        fechaSolicitud: momentoDesdeHoy(-10, 9),
        precioTotal: 690_000,
        estado: 'CONFIRMADA',
        politicaCancelacion: MODERADA,
        comprobante: 'CMP-2026-000102',
    },
    {
        idReserva: 103,
        alojamiento: 'Finca Cafetera en Salento',
        huesped: 'Tú',
        fechaEntrada: desdeHoy(45),
        fechaSalida: desdeHoy(50),
        fechaSolicitud: momentoDesdeHoy(-1, 11),
        precioTotal: 2_150_000,
        estado: 'CONFIRMADA',
        politicaCancelacion: ESTRICTA,
        comprobante: 'CMP-2026-000103',
    },
    {
        idReserva: 104,
        alojamiento: 'Casa de Campo en Villa de Leyva',
        huesped: 'Tú',
        fechaEntrada: desdeHoy(-40),
        fechaSalida: desdeHoy(-37),
        fechaSolicitud: momentoDesdeHoy(-60, 14),
        precioTotal: 980_000,
        estado: 'FINALIZADA',
        politicaCancelacion: FLEXIBLE,
        comprobante: 'CMP-2026-000104',
    },
    {
        idReserva: 105,
        alojamiento: 'Loft en la Zona T',
        huesped: 'Tú',
        fechaEntrada: desdeHoy(-15),
        fechaSalida: desdeHoy(-12),
        fechaSolicitud: momentoDesdeHoy(-30, 16),
        precioTotal: 540_000,
        estado: 'CANCELADA',
        politicaCancelacion: MODERADA,
        comprobante: 'CMP-2026-000105',
        motivoCancelacion: 'Cambió el plan de viaje.',
        fechaCancelacion: momentoDesdeHoy(-22, 8),
        canceladaPor: 'Huésped',
    },
];

const reservasRecibidas: Reserva[] = [
    {
        idReserva: 201,
        alojamiento: 'Cabaña del Lago',
        huesped: 'Camila Torres',
        fechaEntrada: desdeHoy(8),
        fechaSalida: desdeHoy(11),
        fechaSolicitud: momentoDesdeHoy(-5, 10),
        precioTotal: 930_000,
        estado: 'CONFIRMADA',
        politicaCancelacion: FLEXIBLE,
        comprobante: 'CMP-2026-000201',
    },
    {
        idReserva: 202,
        alojamiento: 'Cabaña del Lago',
        huesped: 'Andrés Rojas',
        fechaEntrada: desdeHoy(30),
        fechaSalida: desdeHoy(35),
        fechaSolicitud: momentoDesdeHoy(-2, 18),
        precioTotal: 1_550_000,
        estado: 'CONFIRMADA',
        politicaCancelacion: FLEXIBLE,
        comprobante: 'CMP-2026-000202',
    },
    {
        idReserva: 203,
        alojamiento: 'Apartamento Chapinero',
        huesped: 'Valentina Pérez',
        fechaEntrada: desdeHoy(-20),
        fechaSalida: desdeHoy(-17),
        fechaSolicitud: momentoDesdeHoy(-45, 13),
        precioTotal: 690_000,
        estado: 'FINALIZADA',
        politicaCancelacion: MODERADA,
        comprobante: 'CMP-2026-000203',
    },
    {
        idReserva: 204,
        alojamiento: 'Apartamento Chapinero',
        huesped: 'Julián Medina',
        fechaEntrada: desdeHoy(-8),
        fechaSalida: desdeHoy(-5),
        fechaSolicitud: momentoDesdeHoy(-25, 12),
        precioTotal: 690_000,
        estado: 'CANCELADA',
        politicaCancelacion: MODERADA,
        comprobante: 'CMP-2026-000204',
        motivoCancelacion: 'Problemas de salud.',
        fechaCancelacion: momentoDesdeHoy(-15, 9),
        canceladaPor: 'Huésped',
    },
];

export function listarMisReservas(): Reserva[] {
    return reservasHuesped.map((reserva) => ({ ...reserva }));
}

export function listarReservasRecibidas(): Reserva[] {
    return reservasRecibidas.map((reserva) => ({ ...reserva }));
}

/** Imita las reglas del backend: solo cancela reservas confirmadas y calcula la devolución simulada. */
export function cancelarReservaDePrueba(id: number | string, motivo: string): CancelacionRespuesta {
    const indice = reservasHuesped.findIndex((r) => String(r.idReserva) === String(id));

    if (indice < 0) {
        throw { status: 404, error: { message: 'No se encontró la reserva.' } };
    }

    const reserva = reservasHuesped[indice];

    if (reserva.estado !== 'CONFIRMADA') {
        throw { status: 409, error: { message: 'Solo se pueden cancelar reservas confirmadas.' } };
    }

    const dentroDelPlazo = diasHastaEntrada(reserva.fechaEntrada) >= DIAS_PLAZO_CANCELACION;
    const montoDevolucion = dentroDelPlazo
        ? Math.round((reserva.precioTotal * reserva.politicaCancelacion.porcentajeDevolucion) / 100)
        : 0;

    const cancelada: Reserva = {
        ...reserva,
        estado: 'CANCELADA',
        motivoCancelacion: motivo,
        fechaCancelacion: new Date().toISOString(),
        canceladaPor: 'Huésped',
    };

    reservasHuesped = reservasHuesped.map((r, i) => (i === indice ? cancelada : r));

    return { reserva: { ...cancelada }, montoDevolucion };
}