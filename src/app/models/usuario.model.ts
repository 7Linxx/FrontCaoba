export type Rol = 'HUESPED' | 'ANFITRION' | 'ADMINISTRADOR';
export type RolRegistrable = Exclude<Rol, 'ADMINISTRADOR'>;

export const ESTADO_ACTIVA = 'ACTIVA';
export const ESTADO_INACTIVA = 'INACTIVA';

export const ETIQUETA_ROL: Record<Rol, string> = {
    HUESPED: 'Huésped',
    ANFITRION: 'Anfitrión',
    ADMINISTRADOR: 'Administrador',
};

export interface Usuario {
    idUsuario: number | string;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string | null;
    rol: string;
    estadoCuenta: string;
    motivoRestriccion?: string | null;
    fechaAceptacionDatos?: string | null;
    fechaRegistro?: string | null;
}

/** Normaliza el rol que llega del backend (sin tildes y en mayúsculas). */
export function normalizarRol(valor: string | null | undefined): Rol | null {
    const limpio = (valor ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toUpperCase();

    return limpio === 'HUESPED' || limpio === 'ANFITRION' || limpio === 'ADMINISTRADOR'
        ? limpio
        : null;
}