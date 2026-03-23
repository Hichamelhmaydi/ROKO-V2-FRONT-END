import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../../../core/services/reservation.service';
import { PageResponse } from '../../../../core/models/common.model';
import { Reservation } from '../../../../core/models/reservation.model';
import { PopupService } from '../../../../core/services/popup.service';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="page">
      <div class="page-header">
        <div>
          <h1>Gestion des réservations</h1>
          <p>Supervision des réservations, confirmations et clôtures.</p>
        </div>
    
        <div class="toolbar">
          <select [(ngModel)]="selectedStatus" (change)="loadReservations()">
            <option value="">Tous les statuts</option>
            @for (status of statuses; track status) {
              <option [value]="status">{{ status }}</option>
            }
          </select>
    
          <button type="button" (click)="loadReservations()">Actualiser</button>
        </div>
      </div>
    
      @if (loading) {
        <div class="state">Chargement des réservations...</div>
      }
      @if (!loading && error) {
        <div class="state error">{{ error }}</div>
      }
    
      @if (!loading && !error) {
        <div class="table-card">
          @if (reservations.length) {
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Voyage</th>
                  <th>Voyageur</th>
                  <th>Personnes</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Paiement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (reservation of displayedReservations; track reservation) {
                  <tr>
                    <td>#{{ reservation.id }}</td>
                    <td>
                      <strong>{{ reservation.voyageNom }}</strong>
                      <div>{{ reservation.voyageDestination }}</div>
                    </td>
                    <td>
                      {{ reservation.userPrenom }} {{ reservation.userNom }}
                      <div>{{ reservation.userEmail }}</div>
                    </td>
                    <td>{{ reservation.nombrePersonnes }}</td>
                    <td>{{ reservation.montantTotal || reservation.prixBase || 0 }} MAD</td>
                    <td><span class="badge">{{ reservation.statut }}</span></td>
                    <td>{{ reservation.paiementEffectue ? 'Payé' : 'En attente' }}</td>
                    <td>
                      <div class="actions">
                        @if (reservation.statut === 'EN_ATTENTE' || reservation.statut === 'CREE') {
                          <button type="button" (click)="confirmer(reservation)">Confirmer</button>
                        }
                        @if (reservation.statut === 'CONFIRMEE' || reservation.statut === 'PAYEE') {
                          <button type="button" (click)="completer(reservation)">Compléter</button>
                        }
                        @if (reservation.statut !== 'ANNULEE' && reservation.statut !== 'COMPLETEE') {
                          <button type="button" (click)="annuler(reservation)">Annuler</button>
                        }
                        <button type="button" class="danger" (click)="supprimer(reservation)">Supprimer</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <div class="empty">Aucune réservation à afficher.</div>
          }
          @if (selectedStatus && filteredTotalPages > 1) {
            <div class="pagination">
              <button type="button" [disabled]="statusPage === 1" (click)="changePage(statusPage - 1)">Précédent</button>
              <span>Page {{ statusPage }} / {{ filteredTotalPages }}</span>
              <button type="button" [disabled]="statusPage >= filteredTotalPages" (click)="changePage(statusPage + 1)">Suivant</button>
            </div>
          }
          @if (!selectedStatus && totalPages > 1) {
            <div class="pagination">
              <button type="button" [disabled]="page === 0" (click)="changePage(page - 1)">Précédent</button>
              <span>Page {{ page + 1 }} / {{ totalPages }}</span>
              <button type="button" [disabled]="page + 1 >= totalPages" (click)="changePage(page + 1)">Suivant</button>
            </div>
          }
        </div>
      }
    </section>
    `,
  styles: [`
    .page { display: grid; gap: 1rem; }
    .page-header, .toolbar, .actions, .pagination { display: flex; gap: 0.75rem; align-items: center; }
    .page-header { justify-content: space-between; flex-wrap: wrap; }
    .table-card { background: #fff; border-radius: 16px; padding: 1rem; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); overflow: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.85rem; text-align: left; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    .badge { display: inline-block; padding: 0.3rem 0.6rem; border-radius: 999px; background: #e0f2fe; color: #075985; font-weight: 600; }
    .actions { flex-wrap: wrap; }
    button, select { border: 1px solid #cbd5e1; border-radius: 10px; padding: 0.55rem 0.85rem; background: #fff; }
    button.danger { color: #b91c1c; }
    .state, .empty { background: #fff; padding: 1rem; border-radius: 14px; }
    .state.error { color: #b91c1c; }
  `]
})
export class AdminReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  loading = true;
  error = '';
  page = 0;
  totalPages = 0;
  statusPage = 1;
  readonly pageSize = 10;
  readonly statuses = ['CREE', 'EN_ATTENTE', 'EN_ATTENTE_PAIEMENT', 'CONFIRMEE', 'PAYEE', 'COMPLETEE', 'ANNULEE', 'ECHEC'];
  selectedStatus = '';

  constructor(
    private reservationService: ReservationService,
    private popupService: PopupService
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.error = '';

    if (this.selectedStatus) {
      this.reservationService.getByStatut(this.selectedStatus).subscribe({
        next: (reservations: Reservation[]) => {
          this.reservations = reservations;
          this.statusPage = 1;
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Impossible de charger les réservations';
          this.loading = false;
        }
      });
      return;
    }

    this.reservationService.getAll(this.page, 10).subscribe({
      next: (pageResponse: PageResponse<Reservation>) => {
          this.reservations = pageResponse.content;
          this.totalPages = pageResponse.totalPages;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Impossible de charger les réservations';
        this.loading = false;
      }
    });
  }

  get filteredTotalPages(): number {
    return Math.max(1, Math.ceil(this.reservations.length / this.pageSize));
  }

  get displayedReservations(): Reservation[] {
    if (!this.selectedStatus) {
      return this.reservations;
    }

    const start = (this.statusPage - 1) * this.pageSize;
    return this.reservations.slice(start, start + this.pageSize);
  }

  changePage(page: number): void {
    if (this.selectedStatus) {
      this.statusPage = Math.min(Math.max(page, 1), this.filteredTotalPages);
      return;
    }

    this.page = page;
    this.loadReservations();
  }

  confirmer(reservation: Reservation): void {
    this.reservationService.confirmer(reservation.id).subscribe({ next: () => this.loadReservations() });
  }

  completer(reservation: Reservation): void {
    this.reservationService.completer(reservation.id).subscribe({ next: () => this.loadReservations() });
  }

  async annuler(reservation: Reservation): Promise<void> {
    const motif = await this.popupService.promptText({
      title: 'Motif d\'annulation',
      label: `Reservation #${reservation.id}`,
      initialValue: reservation.motifAnnulation || '',
      placeholder: 'Ex: indisponibilite client',
      confirmText: 'Confirmer'
    });

    if (motif === null) {
      return;
    }

    this.reservationService.annuler(reservation.id, motif).subscribe({ next: () => this.loadReservations() });
  }

  async supprimer(reservation: Reservation): Promise<void> {
    const confirmed = await this.popupService.confirm({
      title: `Supprimer la reservation #${reservation.id} ?`,
      text: 'Cette action est definitive.',
      icon: 'warning',
      confirmText: 'Oui, supprimer'
    });

    if (!confirmed) {
      return;
    }

    this.reservationService.delete(reservation.id).subscribe({ next: () => this.loadReservations() });
  }
}

