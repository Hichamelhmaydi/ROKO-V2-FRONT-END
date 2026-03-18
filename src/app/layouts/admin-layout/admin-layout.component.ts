import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  menuItems = [
    { label: 'Voyages', route: '/admin/voyages' },
    { label: 'Activités', route: '/admin/activites' },
    { label: 'Réservations', route: '/admin/reservations' },
    { label: 'Paiements', route: '/admin/paiements' },
    { label: 'Utilisateurs', route: '/admin/utilisateurs' },
    { label: 'Statistiques', route: '/admin/statistiques' }
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
