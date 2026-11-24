import { PoliticaCancelacion } from './reserva.model';

export interface ServicioAdicional {
    idServicioAdicional: number;
    nombre: string;
    costo: number;
}

export interface AlojamientoResumen {
    idAlojamiento: number;
    titulo: string;
    ciudad: string;
    capacidad: number;
    precioNoche: number;
    politicaCancelacion: PoliticaCancelacion;
    serviciosAdicionales: ServicioAdicional[];
}

export interface CotizacionSolicitud {
    idAlojamiento: number;
    fechaEntrada: string;
    fechaSalida: string;
    numeroHuespedes: number;
    idsServiciosAdicionales: number[];
}

export interface Cotizacion {
    numeroNoches: number;
    precioNoche: number;
    precioBaseTotal: number;
    pctTarifaLimpieza: number;
    montoLimpieza: number;
    pctDescuento: number;
    montoDescuento: number;
    montoServAdicionales: number;
    pctTarifaServicio: number;
    montoTarifaServicio: number;
    total: number;
}

export interface ReservaSolicitud extends CotizacionSolicitud {
    claveIdempotencia: string;
}