import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ReservationService } from '../../../../core/services/reservation.service';
import { VoyageurService } from '../../../../core/services/voyageur.service';
import { Notification } from '../../../../core/models/notification.model';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-client-profil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page" *ngIf="profile">
      <div class="page-header">
        <div>
          <h1>Mon profil</h1>
          <p>Informations personnelles, notifications et activité récente.</p>
        </div>
        <button type="button" (click)="loadProfile()">Actualiser</button>
      </div>

      <div class="grid">
        <section class="card">
          <h2>Informations personnelles</h2>

          <label>Prénom <input [(ngModel)]="profile.prenom" name="prenom"></label>
          <label>Nom <input [(ngModel)]="profile.nom" name="nom"></label>
          <label>Email <input [(ngModel)]="profile.email" name="email"></label>
          <label>Téléphone <input [(ngModel)]="profile.telephone" name="telephone"></label>

          <div class="meta">
            <span>Statut: {{ profile.status || 'N/A' }}</span>
            <span>Réservations: {{ reservationCount }}</span>
            <span>Notifications non lues: {{ unreadCount }}</span>
          </div>

          <div class="actions">
            <button type="button" (click)="saveProfile()">Enregistrer</button>
          </div>

          <div class="message success" *ngIf="successMessage">{{ successMessage }}</div>
          <div class="message error" *ngIf="error">{{ error }}</div>
        </section>

        <section class="card">
          <h2>Notifications</h2>

          <article class="notification" *ngFor="let notification of notifications">
            <div>
              <strong>{{ notification.titre }}</strong>
              <p>{{ notification.message }}</p>
              <small>{{ notification.dateCreation | date:'dd/MM/yyyy HH:mm' }}</small>
            </div>

            <button type="button" *ngIf="!notification.lu" (click)="markAsRead(notification)">Marquer comme lu</button>
          </article>

          <div class="empty" *ngIf="notifications.length === 0">Aucune notification pour le moment.</div>
        </section>
      </div>
    </section>
  `,
  styles: [`
    .page, .grid { display: grid; gap: 1rem; }
    .page-header, .actions, .notification { display: flex; gap: 0.75rem; justify-content: space-between; align-items: center; flex-wrap: wrap; }
    .grid { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
    .card { background: #fff; border-radius: 16px; padding: 1rem; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); display: grid; gap: 0.75rem; }
    label { display: grid; gap: 0.35rem; color: #334155; font-weight: 600; }
    input, button { border: 1px solid #cbd5e1; border-radius: 10px; padding: 0.6rem 0.85rem; background: #fff; }
    .meta { display: grid; gap: 0.35rem; color: #475569; }
    .notification { padding: 0.75rem 0; border-bottom: 1px solid #e2e8f0; }
    .notification:last-child { border-bottom: none; }
    .message.success { color: #166534; }
    .message.error { color: #b91c1c; }
  `]
})
export class ClientProfilComponent implements OnInit {
  profile: User | null = null;
  notifications: Notification[] = [];
  unreadCount = 0;
  reservationCount = 0;
  error = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private voyageurService: VoyageurService,
    private notificationService: NotificationService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadNotifications();
  }

  loadProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return;
    }

    this.voyageurService.getById(currentUser.id).subscribe({
      next: (profile) => {
        this.profile = { ...currentUser, ...profile };
      },
      error: () => {
        this.profile = currentUser;
      }
    });

    this.reservationService.countMine().subscribe({ next: (response) => { this.reservationCount = response.count; } });
  }

  loadNotifications(): void {
    this.notificationService.getMine().subscribe({ next: (notifications) => { this.notifications = notifications; } });
    this.notificationService.getUnreadCount().subscribe({ next: (response) => { this.unreadCount = response.count; } });
  }

  saveProfile(): void {
    if (!this.profile) {
      return;
    }

    this.error = '';
    this.successMessage = '';
    this.voyageurService.update(this.profile.id, this.profile).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.successMessage = 'Profil mis à jour.';
      },
      error: (err) => {
        this.error = err.error?.message || 'Impossible de mettre à jour le profil.';
      }
    });
  }

  markAsRead(notification: Notification): void {
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.lu = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    });
  }
}
