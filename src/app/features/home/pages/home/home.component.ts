import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly authService = inject(AuthService);

  readonly highlights = [
    {
      title: 'Voyages inspires',
      text: 'Explorez des destinations, des activites locales et des circuits adaptes a votre style de voyage.',
      imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80'
    },
    {
      title: 'Reservations simplifiees',
      text: 'Consultez les disponibilites en temps reel, reservez en quelques clics et suivez vos confirmations.',
      imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80'
    },
    {
      title: 'Gestion admin centralisee',
      text: "Les administrateurs pilotent les offres, les activites, les paiements et les statistiques depuis un seul espace.",
      imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80'
    }
  ] as const;

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
