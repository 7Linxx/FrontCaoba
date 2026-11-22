interface ErrorHttp {
  name?: string;
  status?: number;
  error?: {
    message?: string;
    detail?: string;
    fieldErrors?: Record<string, string>;
  } | null;
}

export interface OpcionesMensajeError {
  /** Mensajes que reemplazan siempre al del servidor para ese código HTTP. */
  fijos?: Record<number, string>;
  /** Mensajes usados cuando el servidor no envía uno propio. */
  respaldo?: Record<number, string>;
}

const RESPALDO_GENERAL: Record<number, string> = {
  400: 'Los datos enviados no son válidos. Revisa la información.',
  401: 'No tienes autorización para realizar esta operación.',
  403: 'No tienes permiso para realizar esta operación.',
  404: 'No se encontró el recurso solicitado.',
  409: 'Existe un conflicto con los datos enviados.',
  422: 'No fue posible procesar los datos enviados. Revisa la información.',
};

/** Único punto donde se traducen los errores HTTP a mensajes para el usuario. */
export function mensajeError(
    e: unknown,
    porDefecto: string,
    opciones: OpcionesMensajeError = {},
): string {
  const error = (e ?? {}) as ErrorHttp;

  if (error.name === 'TimeoutError') {
    return 'El servidor está tardando demasiado en responder. Inténtalo nuevamente.';
  }

  const estado = error.status ?? -1;

  if (estado === 0) {
    return 'No fue posible conectar con el servidor. Comprueba que el backend esté activo.';
  }

  const fijo = opciones.fijos?.[estado];
  if (fijo) return fijo;

  const cuerpo = typeof error.error === 'object' ? error.error : null;

  const campos = cuerpo?.fieldErrors;
  if (campos && Object.keys(campos).length > 0) {
    return Object.values(campos).join(' ');
  }

  const delServidor = cuerpo?.message ?? cuerpo?.detail;
  if (delServidor) return delServidor;

  const respaldo = opciones.respaldo?.[estado] ?? RESPALDO_GENERAL[estado];
  if (respaldo) return respaldo;

  if (estado >= 500) {
    return 'Ocurrió un error interno en el servidor. Inténtalo más tarde.';
  }

  return porDefecto;
}