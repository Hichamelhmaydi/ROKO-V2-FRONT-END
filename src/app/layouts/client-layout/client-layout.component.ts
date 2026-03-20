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
  private menuItems = [
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

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get visibleMenuItems() {
    if (!this.isLoggedIn) {
      return this.menuItems.filter(item => item.route === '/client/voyages');
    }
    return this.menuItems;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
