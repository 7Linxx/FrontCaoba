import { RolRegistrable } from './usuario.model';

export interface CredencialesLogin {
    correo: string;
    contrasena: string;
}

export interface RegistroSolicitud {
    nombre: string;
    apellido: string;
    correo: string;
    contrasena: string;
    rol: RolRegistrable;
    aceptaTratamientoDatos: boolean;
}

export interface AuthRespuesta {
    token: string;
    tipo: string;
    idUsuario: number;
    nombreCompleto: string;
    rol: string;
}

export interface MensajeRespuesta {
    mensaje: string;
}

export interface ValidacionCodigoRespuesta {
    valido: boolean;
}

export interface RestablecerSolicitud {
    correo: string;
    token: string;
    nuevaContrasena: string;
    confirmacionContrasena: string;
}