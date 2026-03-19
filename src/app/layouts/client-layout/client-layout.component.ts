import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.scss'
})
export class ClientLayoutComponent {
  menuItems = [
    { label: 'Voyages', route: '/client/voyages' },
    { label: 'Activités', route: '/client/activites' },
    { label: 'Mes Réservations', route: '/client/reservations' },
    { label: 'Mes Paiements', route: '/client/paiements' },
    { label: 'Mon Profil', route: '/client/profil' }
  ];

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
