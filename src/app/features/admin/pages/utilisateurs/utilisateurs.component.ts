import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { VoyageurService } from '../../../../core/services/voyageur.service';
import { User } from '../../../../core/models/user.model';
import { PopupService } from '../../../../core/services/popup.service';

@Component({
  selector: 'app-admin-utilisateurs',
  standalone: true,
  imports: [FormsModule],
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
    
      @if (loading) {
        <div class="state">Chargement des utilisateurs...</div>
      }
      @if (!loading && error) {
        <div class="state error">{{ error }}</div>
      }
    
      @if (!loading && !error) {
        <div class="grid">
          @for (user of pagedVoyageurs; track user) {
            <article class="card">
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
                @if (user.idNational) {
                  <span>CIN: {{ user.idNational }}</span>
                }
                @if (user.dateExpiration) {
                  <span>Expiration: {{ user.dateExpiration }}</span>
                }
              </div>
              <div class="actions">
                @if (user.status === 'ACTIVER') {
                  <button type="button" (click)="blockUser(user)">Bloquer</button>
                }
                @if (user.status !== 'ACTIVER') {
                  <button type="button" (click)="unblockUser(user)">Débloquer</button>
                }
                <button type="button" class="ghost" (click)="refreshUser(user)">Rafraîchir</button>
              </div>
            </article>
          }
          @if (voyageurs.length === 0) {
            <div class="empty">Aucun voyageur trouvé.</div>
          }
        </div>

        @if (voyageurs.length > pageSize) {
          <div class="pagination">
            <button type="button" [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">Precedent</button>
            <span>Page {{ currentPage }} / {{ totalPages }}</span>
            <button type="button" [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)">Suivant</button>
          </div>
        }
      }
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
    .pagination { display: flex; justify-content: center; align-items: center; gap: 0.75rem; }
  `]
})
export class AdminUtilisateursComponent implements OnInit {
  voyageurs: User[] = [];
  query = '';
  loading = true;
  error = '';
  currentPage = 1;
  readonly pageSize = 9;

  constructor(
    private voyageurService: VoyageurService,
    private popupService: PopupService
  ) {}

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
        this.currentPage = 1;
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

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.voyageurs.length / this.pageSize));
  }

  get pagedVoyageurs(): User[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.voyageurs.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
  }

  async blockUser(user: User): Promise<void> {
    const confirmed = await this.popupService.confirm({
      title: `Bloquer ${user.prenom} ${user.nom} ?`,
      text: 'Le compte sera desactive temporairement.',
      icon: 'warning',
      confirmText: 'Bloquer'
    });

    if (!confirmed) {
      return;
    }

    this.voyageurService.block(user.id).subscribe({ next: () => this.loadVoyageurs() });
  }

  async unblockUser(user: User): Promise<void> {
    const confirmed = await this.popupService.confirm({
      title: `Debloquer ${user.prenom} ${user.nom} ?`,
      icon: 'question',
      confirmText: 'Debloquer'
    });

    if (!confirmed) {
      return;
    }

    this.voyageurService.unblock(user.id).subscribe({ next: () => this.loadVoyageurs() });
  }
}
