import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PATRON_CLAVE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;

export function correoValido(control: AbstractControl): ValidationErrors | null {
    const valor = String(control.value ?? '').trim();
    return !valor || PATRON_CORREO.test(valor) ? null : { correoInvalido: true };
}

/** Mínimo 8 caracteres, una mayúscula, una minúscula y un número. */
export function claveSegura(control: AbstractControl): ValidationErrors | null {
    const valor = String(control.value ?? '');
    return !valor || PATRON_CLAVE.test(valor) ? null : { claveInsegura: true };
}

/** Validador de grupo: los dos campos deben tener el mismo valor. */
export function camposCoinciden(campo: string, confirmacion: string): ValidatorFn {
    return (grupo: AbstractControl): ValidationErrors | null => {
        const a = grupo.get(campo)?.value;
        const b = grupo.get(confirmacion)?.value;
        return a === b ? null : { noCoinciden: true };
    };
}