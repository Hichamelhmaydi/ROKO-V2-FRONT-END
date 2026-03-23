import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private readonly defaultConfirmButtonColor = '#0f766e';
  private readonly defaultCancelButtonColor = '#a6403b';

  async confirm(options: {
    title: string;
    text?: string;
    confirmText?: string;
    cancelText?: string;
    icon?: SweetAlertIcon;
  }): Promise<boolean> {
    const result = await Swal.fire({
      title: options.title,
      text: options.text,
      icon: options.icon ?? 'question',
      showCancelButton: true,
      confirmButtonText: options.confirmText ?? 'Confirmer',
      cancelButtonText: options.cancelText ?? 'Annuler',
      confirmButtonColor: this.defaultConfirmButtonColor,
      cancelButtonColor: this.defaultCancelButtonColor,
      reverseButtons: true,
      focusCancel: true
    });

    return result.isConfirmed;
  }

  async promptText(options: {
    title: string;
    label?: string;
    initialValue?: string;
    placeholder?: string;
    required?: boolean;
    confirmText?: string;
  }): Promise<string | null> {
    const result = await Swal.fire({
      title: options.title,
      input: 'text',
      inputLabel: options.label,
      inputValue: options.initialValue ?? '',
      inputPlaceholder: options.placeholder,
      showCancelButton: true,
      confirmButtonText: options.confirmText ?? 'Valider',
      cancelButtonText: 'Annuler',
      confirmButtonColor: this.defaultConfirmButtonColor,
      cancelButtonColor: this.defaultCancelButtonColor,
      reverseButtons: true,
      inputValidator: options.required
        ? (value) => value.trim() ? null : 'Ce champ est obligatoire.'
        : undefined
    });

    if (!result.isConfirmed) {
      return null;
    }

    return (result.value ?? '').toString();
  }

  async promptNumber(options: {
    title: string;
    label?: string;
    initialValue?: number;
    placeholder?: string;
    allowEmpty?: boolean;
    confirmText?: string;
  }): Promise<number | null> {
    const result = await Swal.fire({
      title: options.title,
      input: 'number',
      inputLabel: options.label,
      inputValue: options.initialValue ?? undefined,
      inputPlaceholder: options.placeholder,
      showCancelButton: true,
      confirmButtonText: options.confirmText ?? 'Valider',
      cancelButtonText: 'Annuler',
      confirmButtonColor: this.defaultConfirmButtonColor,
      cancelButtonColor: this.defaultCancelButtonColor,
      reverseButtons: true,
      inputValidator: (value) => {
        if (!value && options.allowEmpty) {
          return null;
        }

        if (!value) {
          return 'Veuillez renseigner une valeur.';
        }

        return Number(value) >= 0 ? null : 'La valeur doit etre positive.';
      }
    });

    if (!result.isConfirmed) {
      return null;
    }

    if (!result.value && options.allowEmpty) {
      return null;
    }

    return Number(result.value);
  }

  async success(title: string, text?: string): Promise<void> {
    await Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonColor: this.defaultConfirmButtonColor
    });
  }

  async error(title: string, text?: string): Promise<void> {
    await Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: this.defaultConfirmButtonColor
    });
  }
}
