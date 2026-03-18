import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../../core/services/payment.service';
import { Payment } from '../../../../core/models/payment.model';

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
            <option *ngFor="let status of statuses" [value]="status">{{ status }}</option>
          </select>
          <button type="button" (click)="loadPayments()">Actualiser</button>
        </div>
      </div>

      <div class="summary-card" *ngIf="!loading && !error">
        <strong>Chiffre d'affaires total</strong>
        <span>{{ revenueTotal | number:'1.2-2' }} EUR</span>
      </div>

      <div class="state" *ngIf="loading">Chargement des paiements...</div>
      <div class="state error" *ngIf="!loading && error">{{ error }}</div>

      <div class="table-card" *ngIf="!loading && !error">
        <table *ngIf="payments.length; else emptyState">
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
            <tr *ngFor="let payment of payments">
              <td>#{{ payment.id }}</td>
              <td>#{{ payment.reservationId }}</td>
              <td>{{ payment.amount | number:'1.2-2' }} EUR</td>
              <td><span class="badge">{{ payment.status }}</span></td>
              <td>{{ payment.dateCreation | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ payment.datePaiement ? (payment.datePaiement | date:'dd/MM/yyyy HH:mm') : 'Non payé' }}</td>
              <td>
                <div class="actions">
                  <button type="button" *ngIf="payment.status === 'EN_ATTENTE' || payment.status === 'EN_COURS'" (click)="cancelPayment(payment)">Annuler</button>
                  <button type="button" *ngIf="payment.status === 'REUSSI'" (click)="refundPayment(payment)">Rembourser</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <ng-template #emptyState>
          <div class="empty">Aucun paiement trouvé.</div>
        </ng-template>
      </div>
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
  `]
})
export class AdminPaiementsComponent implements OnInit {
  payments: Payment[] = [];
  revenueTotal = 0;
  loading = true;
  error = '';
  selectedStatus = '';
  readonly statuses = ['EN_ATTENTE', 'EN_COURS', 'REUSSI', 'ECHOUE', 'ANNULE', 'REMBOURSE', 'REMBOURSEMENT_EN_COURS'];

  constructor(private paymentService: PaymentService) {}

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

  cancelPayment(payment: Payment): void {
    this.paymentService.annuler(payment.id).subscribe({ next: () => this.loadPayments() });
  }

  refundPayment(payment: Payment): void {
    const rawAmount = prompt('Montant à rembourser (laisser vide pour la totalité)', String(payment.amount));
    const reason = prompt('Raison du remboursement', 'Remboursement administratif') || undefined;
    const amount = rawAmount ? Number(rawAmount) : undefined;

    this.paymentService.rembourser(payment.id, { amount, reason }).subscribe({
      next: () => {
        this.loadPayments();
        this.loadRevenue();
      }
    });
  }
}
