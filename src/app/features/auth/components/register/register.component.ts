import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
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
  error = '';
  loading = false;
  readonly minDateExpiration: string = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.nom || !this.prenom || !this.email || !this.password || !this.telephone || !this.idNational || !this.dateExpiration) {
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


      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expDate = new Date(this.dateExpiration);
      if (isNaN(expDate.getTime()) || expDate <= today) {
        this.error = "La date d'expiration de la pièce d'identité doit être dans le futur";
        return;
      }

    this.loading = true;
    this.error = '';

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
