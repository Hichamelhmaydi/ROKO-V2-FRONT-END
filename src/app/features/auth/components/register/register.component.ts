import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

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
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.nom || !this.prenom || !this.email || !this.password || !this.telephone) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register({
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      password: this.password,
      telephone: this.telephone
    }).subscribe({
      next: () => {
        this.router.navigate(['/client']);
      },
      error: (err) => {
        this.loading = false;
        this.error = this.resolveRegisterError(err);
      }
    });
  }

  private resolveRegisterError(err: any): string {
    if (err?.status === 0) {
      return 'Serveur indisponible. Vérifiez que le backend (8080) est démarré.';
    }

    if (typeof err?.error === 'string' && err.error.trim().length > 0) {
      return err.error;
    }

    return err?.error?.message || err?.message || 'Erreur lors de l\'inscription';
  }
}
