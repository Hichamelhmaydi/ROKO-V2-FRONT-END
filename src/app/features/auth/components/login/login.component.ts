import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ErrorHandlerService, ErrorMessage } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage: ErrorMessage | null = null;
  loading = false;

  constructor(
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = null;

    // Validation email
    const emailError = this.errorHandler.validateEmail(this.email);
    if (emailError) {
      this.errorMessage = emailError;
      return;
    }

    // Validation password
    if (!this.password) {
      this.errorMessage = this.errorHandler.validateForm(
        () => !!this.password,
        'mot de passe'
      );
      return;
    }

    this.loading = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/client']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = this.errorHandler.handleError(err);
      }
    });
  }
}
