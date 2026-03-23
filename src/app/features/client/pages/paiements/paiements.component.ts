import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';
import { ReservationService } from '../../../../core/services/reservation.service';
import { Payment } from '../../../../core/models/payment.model';
import { Reservation } from '../../../../core/models/reservation.model';
import { PopupService } from '../../../../core/services/popup.service';

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
    
      @if (successMessage) {
        <div class="state success">{{ successMessage }}</div>
      }
      @if (error) {
        <div class="state error">{{ error }}</div>
      }
    
      <section class="list-card">
        <h2>Réservations à payer</h2>
        @for (reservation of pagedPendingReservations; track reservation) {
          <div class="reservation-item">
            <div>
              <strong>{{ reservation.voyageNom }}</strong>
              <p>{{ reservation.nombrePersonnes }} personne(s) - {{ reservation.montantTotal || reservation.prixBase || 0 }} MAD</p>
            </div>
            <button type="button" (click)="startPayment(reservation)">Payer</button>
          </div>
        }
    
        @if (pendingReservations.length === 0) {
          <div class="empty">Aucune réservation en attente de paiement.</div>
        }
        @if (pendingReservations.length > pendingPageSize) {
          <div class="pagination">
            <button type="button" [disabled]="pendingPage === 1" (click)="goToPendingPage(pendingPage - 1)">Precedent</button>
            <span>Page {{ pendingPage }} / {{ pendingTotalPages }}</span>
            <button type="button" [disabled]="pendingPage === pendingTotalPages" (click)="goToPendingPage(pendingPage + 1)">Suivant</button>
          </div>
        }
      </section>
    
      <section class="list-card">
        <h2>Historique des paiements</h2>
        @for (payment of pagedPayments; track payment) {
          <div class="payment-item">
            <div>
              <strong>Paiement #{{ payment.id }}</strong>
              <p>Réservation #{{ payment.reservationId }} - {{ payment.amount | number:'1.2-2' }} MAD</p>
              <small>{{ payment.dateCreation | date:'dd/MM/yyyy HH:mm' }}</small>
            </div>
            <div class="payment-actions">
              <span class="badge">{{ payment.status }}</span>
              @if (payment.status === 'EN_ATTENTE' || payment.status === 'EN_COURS') {
                <button type="button" (click)="cancelPayment(payment)">Annuler</button>
              }
            </div>
          </div>
        }
    
        @if (payments.length === 0) {
          <div class="empty">Aucun paiement enregistré.</div>
        }
        @if (payments.length > pageSize) {
          <div class="pagination">
            <button type="button" [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">Precedent</button>
            <span>Page {{ currentPage }} / {{ totalPages }}</span>
            <button type="button" [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)">Suivant</button>
          </div>
        }
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
    .pagination { margin-top: 0.8rem; display: flex; justify-content: center; align-items: center; gap: 0.75rem; }
  `]
})
export class ClientPaiementsComponent implements OnInit {
  payments: Payment[] = [];
  pendingReservations: Reservation[] = [];
  error = '';
  successMessage = '';
  currentPage = 1;
  readonly pageSize = 8;
  pendingPage = 1;
  readonly pendingPageSize = 6;

  constructor(
    private paymentService: PaymentService,
    private reservationService: ReservationService,
    private route: ActivatedRoute,
    private popupService: PopupService
  ) {}

  ngOnInit(): void {
    this.handleStripeReturn();
    this.reload();
  }

  reload(): void {
    this.paymentService.getMine().subscribe({
      next: (payments) => {
        this.payments = payments;
        this.currentPage = 1;
      }
    });
    this.reservationService.getMine().subscribe({
      next: (reservations) => {
        this.pendingReservations = reservations.filter(item => !item.paiementEffectue && item.statut !== 'ANNULEE' && item.statut !== 'COMPLETEE');
        this.pendingPage = 1;
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

  get pendingTotalPages(): number {
    return Math.max(1, Math.ceil(this.pendingReservations.length / this.pendingPageSize));
  }

  get pagedPendingReservations(): Reservation[] {
    const start = (this.pendingPage - 1) * this.pendingPageSize;
    return this.pendingReservations.slice(start, start + this.pendingPageSize);
  }

  goToPendingPage(page: number): void {
    this.pendingPage = Math.min(Math.max(page, 1), this.pendingTotalPages);
  }

  async cancelPayment(payment: Payment): Promise<void> {
    const confirmed = await this.popupService.confirm({
      title: `Annuler le paiement #${payment.id} ?`,
      text: 'Cette operation est irreversible.',
      icon: 'warning',
      confirmText: 'Oui, annuler'
    });

    if (!confirmed) {
      return;
    }

    this.paymentService.annuler(payment.id).subscribe({ next: () => this.reload() });
  }
}

