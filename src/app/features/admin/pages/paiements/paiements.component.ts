import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../../core/services/payment.service';
import { Payment } from '../../../../core/models/payment.model';
import { PopupService } from '../../../../core/services/popup.service';

@Component({
  selector: 'app-admin-paiements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page">
      <div class="page-header">
        <div>
          <h1>Gestion des paiements</h1>
          <p>Suivi des transactions Stripe et remboursements.</p>
        </div>
    
        <div class="toolbar">
          <select [(ngModel)]="selectedStatus" (change)="loadPayments()">
            <option value="">Tous les statuts</option>
            @for (status of statuses; track status) {
              <option [value]="status">{{ status }}</option>
            }
          </select>
          <button type="button" (click)="loadPayments()">Actualiser</button>
        </div>
      </div>
    
      @if (!loading && !error) {
        <div class="summary-card">
          <strong>Chiffre d'affaires total</strong>
          <span>{{ revenueTotal | number:'1.2-2' }} MAD</span>
        </div>
      }
    
      @if (loading) {
        <div class="state">Chargement des paiements...</div>
      }
      @if (!loading && error) {
        <div class="state error">{{ error }}</div>
      }
    
      @if (!loading && !error) {
        <div class="table-card">
          @if (payments.length) {
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Réservation</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Création</th>
                  <th>Paiement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (payment of pagedPayments; track payment) {
                  <tr>
                    <td>#{{ payment.id }}</td>
                    <td>#{{ payment.reservationId }}</td>
                    <td>{{ payment.amount | number:'1.2-2' }} MAD</td>
                    <td><span class="badge">{{ payment.status }}</span></td>
                    <td>{{ payment.dateCreation | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td>{{ payment.datePaiement ? (payment.datePaiement | date:'dd/MM/yyyy HH:mm') : 'Non payé' }}</td>
                    <td>
                      <div class="actions">
                        @if (payment.status === 'EN_ATTENTE' || payment.status === 'EN_COURS') {
                          <button type="button" (click)="cancelPayment(payment)">Annuler</button>
                        }
                        @if (payment.status === 'REUSSI') {
                          <button type="button" (click)="refundPayment(payment)">Rembourser</button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <div class="empty">Aucun paiement trouvé.</div>
          }

          @if (payments.length > pageSize) {
            <div class="pagination">
              <button type="button" [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">Precedent</button>
              <span>Page {{ currentPage }} / {{ totalPages }}</span>
              <button type="button" [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)">Suivant</button>
            </div>
          }
        </div>
      }
    </section>
    `,
  styles: [`
    .page { display: grid; gap: 1rem; }
    .page-header, .toolbar, .actions { display: flex; gap: 0.75rem; align-items: center; }
    .page-header { justify-content: space-between; flex-wrap: wrap; }
    .summary-card, .table-card, .state, .empty { background: #fff; border-radius: 16px; padding: 1rem; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.85rem; border-bottom: 1px solid #e2e8f0; text-align: left; }
    .badge { display: inline-block; padding: 0.3rem 0.6rem; border-radius: 999px; background: #ede9fe; color: #5b21b6; font-weight: 700; }
    button, select { border: 1px solid #cbd5e1; border-radius: 10px; padding: 0.55rem 0.85rem; background: #fff; }
    .error { color: #b91c1c; }
    .pagination { margin-top: 0.8rem; display: flex; justify-content: center; align-items: center; gap: 0.75rem; }
  `]
})
export class AdminPaiementsComponent implements OnInit {
  payments: Payment[] = [];
  revenueTotal = 0;
  loading = true;
  error = '';
  selectedStatus = '';
  currentPage = 1;
  readonly pageSize = 12;
  readonly statuses = ['EN_ATTENTE', 'EN_COURS', 'REUSSI', 'ECHOUE', 'ANNULE', 'REMBOURSE', 'REMBOURSEMENT_EN_COURS'];

  constructor(
    private paymentService: PaymentService,
    private popupService: PopupService
  ) {}

  ngOnInit(): void {
    this.loadPayments();
    this.loadRevenue();
  }

  loadPayments(): void {
    this.loading = true;
    this.error = '';
    const request = this.selectedStatus
      ? this.paymentService.getByStatut(this.selectedStatus)
      : this.paymentService.getAll();

    request.subscribe({
      next: (payments) => {
        this.payments = payments;
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Impossible de charger les paiements';
        this.loading = false;
      }
    });
  }

  loadRevenue(): void {
    this.paymentService.getChiffreAffairesTotal().subscribe({
      next: (response) => {
        this.revenueTotal = response.total;
      }
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.payments.length / this.pageSize));
  }

  get pagedPayments(): Payment[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.payments.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
  }

  async cancelPayment(payment: Payment): Promise<void> {
    const confirmed = await this.popupService.confirm({
      title: `Annuler le paiement #${payment.id} ?`,
      text: 'Le paiement passera au statut annule.',
      icon: 'warning',
      confirmText: 'Oui, annuler'
    });

    if (!confirmed) {
      return;
    }

    this.paymentService.annuler(payment.id).subscribe({ next: () => this.loadPayments() });
  }

  async refundPayment(payment: Payment): Promise<void> {
    const amount = await this.popupService.promptNumber({
      title: 'Montant a rembourser',
      label: `Paiement #${payment.id}`,
      initialValue: payment.amount,
      placeholder: 'Laisser vide pour totalite',
      allowEmpty: true,
      confirmText: 'Continuer'
    });

    const reason = await this.popupService.promptText({
      title: 'Raison du remboursement',
      initialValue: 'Remboursement administratif',
      placeholder: 'Motif interne'
    });

    if (reason === null) {
      return;
    }

    this.paymentService.rembourser(payment.id, { amount: amount ?? undefined, reason }).subscribe({
      next: () => {
        this.loadPayments();
        this.loadRevenue();
      }
    });
  }
}

