import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';
import { ReservationService } from '../../../../core/services/reservation.service';
import { Payment } from '../../../../core/models/payment.model';
import { Reservation } from '../../../../core/models/reservation.model';

@Component({
  selector: 'app-client-paiements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page">
      <div class="page-header">
        <div>
          <h1>Mes paiements</h1>
          <p>Finalisez vos réservations et suivez les transactions Stripe.</p>
        </div>
        <button type="button" (click)="reload()">Actualiser</button>
      </div>

      <div class="state success" *ngIf="successMessage">{{ successMessage }}</div>
      <div class="state error" *ngIf="error">{{ error }}</div>

      <section class="list-card">
        <h2>Réservations à payer</h2>
        <div class="reservation-item" *ngFor="let reservation of pendingReservations">
          <div>
            <strong>{{ reservation.voyageNom }}</strong>
            <p>{{ reservation.nombrePersonnes }} personne(s) - {{ reservation.montantTotal || reservation.prixBase || 0 }} EUR</p>
          </div>
          <button type="button" (click)="startPayment(reservation)">Payer</button>
        </div>

        <div class="empty" *ngIf="pendingReservations.length === 0">Aucune réservation en attente de paiement.</div>
      </section>

      <section class="list-card">
        <h2>Historique des paiements</h2>
        <div class="payment-item" *ngFor="let payment of payments">
          <div>
            <strong>Paiement #{{ payment.id }}</strong>
            <p>Réservation #{{ payment.reservationId }} - {{ payment.amount | number:'1.2-2' }} EUR</p>
            <small>{{ payment.dateCreation | date:'dd/MM/yyyy HH:mm' }}</small>
          </div>
          <div class="payment-actions">
            <span class="badge">{{ payment.status }}</span>
            <button type="button" *ngIf="payment.status === 'EN_ATTENTE' || payment.status === 'EN_COURS'" (click)="cancelPayment(payment)">Annuler</button>
          </div>
        </div>

        <div class="empty" *ngIf="payments.length === 0">Aucun paiement enregistré.</div>
      </section>
    </section>
  `,
  styles: [`
    .page { display: grid; gap: 1rem; }
    .page-header, .reservation-item, .payment-item, .payment-actions { display: flex; gap: 0.75rem; justify-content: space-between; align-items: center; flex-wrap: wrap; }
    .list-card, .state, .empty { background: #fff; border-radius: 16px; padding: 1rem; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); }
    .reservation-item, .payment-item { padding: 0.85rem 0; border-bottom: 1px solid #e2e8f0; }
    .reservation-item:last-child, .payment-item:last-child { border-bottom: none; }
    .badge { background: #dbeafe; color: #1d4ed8; padding: 0.3rem 0.6rem; border-radius: 999px; font-weight: 700; }
    button { border: 1px solid #cbd5e1; border-radius: 10px; padding: 0.6rem 0.85rem; background: #fff; }
    .success { color: #166534; }
    .error { color: #b91c1c; }
  `]
})
export class ClientPaiementsComponent implements OnInit {
  payments: Payment[] = [];
  pendingReservations: Reservation[] = [];
  error = '';
  successMessage = '';

  constructor(
    private paymentService: PaymentService,
    private reservationService: ReservationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.handleStripeReturn();
    this.reload();
  }

  reload(): void {
    this.paymentService.getMine().subscribe({ next: (payments) => { this.payments = payments; } });
    this.reservationService.getMine().subscribe({
      next: (reservations) => {
        this.pendingReservations = reservations.filter(item => !item.paiementEffectue && item.statut !== 'ANNULEE' && item.statut !== 'COMPLETEE');
      }
    });
  }

  handleStripeReturn(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    const currentPath = this.route.snapshot.routeConfig?.path;

    if (currentPath === 'payment/cancel') {
      this.error = 'Le paiement a été annulé ou interrompu.';
      return;
    }

    if (!sessionId) {
      return;
    }

    this.paymentService.confirm(sessionId).subscribe({
      next: () => {
        this.successMessage = 'Paiement confirmé avec succès.';
        this.reload();
      },
      error: (err) => {
        this.error = err.error?.message || 'Impossible de confirmer le paiement.';
      }
    });
  }

  startPayment(reservation: Reservation): void {
    this.error = '';
    this.successMessage = '';

    this.paymentService.createSession(reservation.id).subscribe({
      next: (response) => {
        const checkoutUrl = response.sessionUrl || response.checkoutUrl;
        if (!checkoutUrl) {
          this.error = 'Aucune URL de redirection Stripe n\'a été renvoyée.';
          return;
        }
        window.location.href = checkoutUrl;
      },
      error: (err) => {
        this.error = err.error?.message || 'Impossible d\'initier le paiement.';
      }
    });
  }

  cancelPayment(payment: Payment): void {
    this.paymentService.annuler(payment.id).subscribe({ next: () => this.reload() });
  }
}
