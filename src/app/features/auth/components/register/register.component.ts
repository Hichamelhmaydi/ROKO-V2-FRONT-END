import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ErrorHandlerService, ErrorMessage } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  nom = '';
  prenom = '';
  email = '';
  password = '';
  confirmPassword = '';
  telephone = '';
  idNational = '';
  dateExpiration = '';
  errorMessage: ErrorMessage | null = null;
  loading = false;
  readonly minDateExpiration: string = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  constructor(
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = null;

    // Validation prenom
    let validation = this.errorHandler.validateTextLength(this.prenom, 2, 50, 'Prénom');
    if (validation) {
      this.errorMessage = validation;
      return;
    }

    // Validation nom
    validation = this.errorHandler.validateTextLength(this.nom, 2, 50, 'Nom');
    if (validation) {
      this.errorMessage = validation;
      return;
    }

    // Validation email
    validation = this.errorHandler.validateEmail(this.email);
    if (validation) {
      this.errorMessage = validation;
      return;
    }

    // Validation password
    validation = this.errorHandler.validateTextLength(this.password, 6, 50, 'Mot de passe');
    if (validation) {
      this.errorMessage = validation;
      return;
    }

    // Validation password match
    if (this.password !== this.confirmPassword) {
      this.errorMessage = {
        title: 'Mots de passe incompatibles',
        message: 'Les mots de passe ne correspondent pas. Veuillez les saisir à nouveau.',
        type: 'validation'
      };
      return;
    }

    // Validation telephone
    validation = this.errorHandler.validateTextLength(this.telephone, 10, 20, 'Téléphone');
    if (validation) {
      this.errorMessage = validation;
      return;
    }

    // Validation idNational
    validation = this.errorHandler.validateTextLength(this.idNational, 5, 20, 'Numéro d\'identité');
    if (validation) {
      this.errorMessage = validation;
      return;
    }

    // Validation dateExpiration
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(this.dateExpiration);
    if (isNaN(expDate.getTime()) || expDate <= today) {
      this.errorMessage = {
        title: 'Date d\'expiration invalide',
        message: 'La date d\'expiration du document d\'identité doit être dans le futur.',
        type: 'validation'
      };
      return;
    }

    this.loading = true;

    this.authService.register({
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      password: this.password,
      telephone: this.telephone,
      idNational: this.idNational,
      dateExpiration: this.dateExpiration
    }).subscribe({
      next: () => {
        this.router.navigate(['/client']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = this.errorHandler.handleError(err);
      }
    });
  }
}
