import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  AuthRespuesta,
  CredencialesLogin,
  MensajeRespuesta,
  RegistroSolicitud,
  RestablecerSolicitud,
} from '../../models/auth.model';
import { Usuario, normalizarRol } from '../../models/usuario.model';
import { TIEMPO_MAXIMO_MS } from '../http/timeout.interceptor';
import { TokenService } from './token.service';


function aMensaje(texto: string): MensajeRespuesta {
  const limpio = (texto ?? '').trim();

  try {
    const valor: unknown = JSON.parse(limpio);

    if (typeof valor === 'string') {
      return { mensaje: valor };
    }

    if (valor && typeof valor === 'object' && 'mensaje' in valor) {
      return { mensaje: String((valor as { mensaje: unknown }).mensaje) };
    }
  } catch {
    /* era texto simple */
  }

  return { mensaje: limpio };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokens = inject(TokenService);

  private readonly api = `${environment.apiUrl}/auth`;
  private readonly _usuario = signal<Usuario | null>(null);

  readonly usuario = this._usuario.asReadonly();
  readonly sesionIniciada = computed(() => !!this.tokens.token());
  readonly rol = computed(() => normalizarRol(this._usuario()?.rol));
  readonly esAdministrador = computed(() => this.rol() === 'ADMINISTRADOR');
  readonly puedeVerReservasYReportes = computed(
      () => this.rol() === 'ADMINISTRADOR' || this.rol() === 'ANFITRION',
  );

  token(): string | null {
    return this.tokens.token();
  }

  login(credenciales: CredencialesLogin): Observable<AuthRespuesta> {
    return this.http
        .post<AuthRespuesta>(`${this.api}/login`, credenciales)
        .pipe(switchMap((respuesta) => this.iniciarSesion(respuesta)));
  }

  reactivar(credenciales: CredencialesLogin): Observable<AuthRespuesta> {
    return this.http
        .post<AuthRespuesta>(`${this.api}/reactivar`, credenciales)
        .pipe(switchMap((respuesta) => this.iniciarSesion(respuesta)));
  }

  registro(datos: RegistroSolicitud): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.api}/registro`, datos);
  }

  /** El envío del correo puede tardar más que una consulta normal, por eso tiene su propio límite. */
  solicitarRecuperacion(correo: string): Observable<MensajeRespuesta> {
    return this.http
        .post(
            `${this.api}/recuperacion`,
            { correo },
            {
              responseType: 'text',
              context: new HttpContext().set(TIEMPO_MAXIMO_MS, environment.tiempoMaximoCorreoMs),
            },
        )
        .pipe(map(aMensaje));
  }

  /** Solo importa que el servidor acepte el código; la respuesta es texto simple. */
  validarCodigoRecuperacion(correo: string, token: string): Observable<void> {
    return this.http
        .post(`${this.api}/restablecer/validar`, { correo, token }, { responseType: 'text' })
        .pipe(map(() => undefined));
  }

  restablecerContrasena(datos: RestablecerSolicitud): Observable<MensajeRespuesta> {
    return this.http
        .post(`${this.api}/restablecer`, datos, { responseType: 'text' })
        .pipe(map(aMensaje));
  }

  cargarPerfil(): Observable<Usuario> {
    return this.http
        .get<Usuario>(`${this.api}/perfil`)
        .pipe(tap((usuario) => this._usuario.set(usuario)));
  }

  /** Usa el perfil en memoria; solo consulta al backend si aún no se ha cargado. */
  asegurarPerfil(): Observable<Usuario> {
    const actual = this._usuario();
    return actual ? of(actual) : this.cargarPerfil();
  }

  establecerUsuario(usuario: Usuario): void {
    this._usuario.set(usuario);
  }

  limpiarSesion(): void {
    this.tokens.limpiar();
    this._usuario.set(null);
  }

  cerrarSesion(): void {
    this.limpiarSesion();
    void this.router.navigate(['/login']);
  }

  /** Guarda el token y carga el perfil completo del usuario autenticado. */
  private iniciarSesion(respuesta: AuthRespuesta): Observable<AuthRespuesta> {
    this.tokens.guardar(respuesta.token);

    return this.cargarPerfil().pipe(
        map(() => respuesta),
        catchError((error) => {
          this.limpiarSesion();
          return throwError(() => error);
        }),
    );
  }
}