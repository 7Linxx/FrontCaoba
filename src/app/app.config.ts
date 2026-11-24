import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeEsCo from '@angular/common/locales/es-CO';
import {
    ApplicationConfig,
    LOCALE_ID,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { timeoutInterceptor } from './core/http/timeout.interceptor';

registerLocaleData(localeEsCo);

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideHttpClient(withInterceptors([timeoutInterceptor, authInterceptor])),
        { provide: LOCALE_ID, useValue: 'es-CO' },
    ],
};