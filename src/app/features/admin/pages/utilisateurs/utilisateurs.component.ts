import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoyageurService } from '../../../../core/services/voyageur.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-admin-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page">
      <div class="page-header">
        <div>
          <h1>Gestion des voyageurs</h1>
          <p>Recherche, consultation et blocage des comptes.</p>
        </div>

        <div class="toolbar">
          <input [(ngModel)]="query" (keyup.enter)="loadVoyageurs()" placeholder="Nom, prénom, email...">
          <button type="button" (click)="loadVoyageurs()">Rechercher</button>
        </div>
      </div>

      <div class="state" *ngIf="loading">Chargement des utilisateurs...</div>
      <div class="state error" *ngIf="!loading && error">{{ error }}</div>

      <div class="grid" *ngIf="!loading && !error">
        <article class="card" *ngFor="let user of voyageurs">
          <div class="card-top">
            <div>
              <h3>{{ user.prenom }} {{ user.nom }}</h3>
              <p>{{ user.email }}</p>
              <p>{{ user.telephone || 'Téléphone non renseigné' }}</p>
            </div>
            <span class="badge" [class.badge-off]="user.status !== 'ACTIVER'">{{ user.status || 'INCONNU' }}</span>
          </div>

          <div class="meta">
            <span>ID #{{ user.id }}</span>
            <span *ngIf="user.idNational">CIN: {{ user.idNational }}</span>
            <span *ngIf="user.dateExpiration">Expiration: {{ user.dateExpiration }}</span>
          </div>

          <div class="actions">
            <button type="button" *ngIf="user.status === 'ACTIVER'" (click)="blockUser(user)">Bloquer</button>
            <button type="button" *ngIf="user.status !== 'ACTIVER'" (click)="unblockUser(user)">Débloquer</button>
            <button type="button" class="ghost" (click)="refreshUser(user)">Rafraîchir</button>
          </div>
        </article>

        <div class="empty" *ngIf="voyageurs.length === 0">Aucun voyageur trouvé.</div>
      </div>
    </section>
  `,
  styles: [`
    .page { display: grid; gap: 1rem; }
    .page-header, .toolbar, .card-top, .actions { display: flex; gap: 0.75rem; align-items: center; }
    .page-header { justify-content: space-between; flex-wrap: wrap; }
    .toolbar input { min-width: 260px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }
    .card, .state, .empty { background: #fff; border-radius: 16px; padding: 1rem; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); }
    .card-top { justify-content: space-between; align-items: flex-start; }
    .meta { display: grid; gap: 0.35rem; color: #475569; margin: 1rem 0; }
    .badge { background: #dcfce7; color: #166534; padding: 0.3rem 0.65rem; border-radius: 999px; font-weight: 700; }
    .badge-off { background: #fee2e2; color: #991b1b; }
    input, button { border: 1px solid #cbd5e1; border-radius: 10px; padding: 0.6rem 0.85rem; background: #fff; }
    .ghost { color: #334155; }
    .error { color: #b91c1c; }
  `]
})
export class AdminUtilisateursComponent implements OnInit {
  voyageurs: User[] = [];
  query = '';
  loading = true;
  error = '';

  constructor(private voyageurService: VoyageurService) {}

  ngOnInit(): void {
    this.loadVoyageurs();
  }

  loadVoyageurs(): void {
    this.loading = true;
    this.error = '';

    const request = this.query.trim()
      ? this.voyageurService.search(this.query.trim())
      : this.voyageurService.getAll();

    request.subscribe({
      next: (users) => {
        this.voyageurs = users;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Impossible de charger les voyageurs';
        this.loading = false;
      }
    });
  }

  refreshUser(user: User): void {
    this.voyageurService.getById(user.id).subscribe({
      next: (fresh) => {
        this.voyageurs = this.voyageurs.map(item => item.id === fresh.id ? fresh : item);
      }
    });
  }

  blockUser(user: User): void {
    this.voyageurService.block(user.id).subscribe({ next: () => this.loadVoyageurs() });
  }

  unblockUser(user: User): void {
    this.voyageurService.unblock(user.id).subscribe({ next: () => this.loadVoyageurs() });
  }
}
