import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ActiviteVoyageService } from '../../../../core/services/activite-voyage.service';
import { ReservationService } from '../../../../core/services/reservation.service';
import { VoyageService } from '../../../../core/services/voyage.service';
import { Reservation, ReservationRequest } from '../../../../core/models/reservation.model';
import { ActiviteVoyage, Voyage } from '../../../../core/models/voyage.model';

@Component({
  selector: 'app-client-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="page-header">
        <div>
          <h1>Mes réservations</h1>
          <p>Créez une réservation et suivez son cycle de vie.</p>
        </div>
        <button type="button" (click)="reload()">Actualiser</button>
      </div>

      <section class="form-card">
        <h2>Nouvelle réservation</h2>
        <div class="grid">
          <label>
            Voyage
            <select [(ngModel)]="form.voyageId" name="voyageId" (change)="onVoyageChange()">
              <option [ngValue]="0">Sélectionnez un voyage</option>
              <option *ngFor="let voyage of voyages" [ngValue]="voyage.id">
                {{ voyage.nom }} - {{ voyage.destination }}
              </option>
            </select>
          </label>

          <label>
            Nombre de personnes
            <input type="number" min="1" [(ngModel)]="form.nombrePersonnes" name="nombrePersonnes">
          </label>
        </div>

        <label>
          Commentaire
          <textarea rows="3" [(ngModel)]="form.commentaire" name="commentaire" placeholder="Précisions utiles pour cette réservation"></textarea>
        </label>

        <div class="options" *ngIf="activitesOptionnelles.length">
          <h3>Activités optionnelles</h3>
          <label class="option-item" *ngFor="let activite of activitesOptionnelles">
            <input
              type="checkbox"
              [checked]="isSelected(activite.activiteId)"
              (change)="toggleActivite(activite.activiteId, $any($event.target).checked)">
            <span>
              <strong>{{ activite.activiteNom }}</strong>
              <small>{{ activite.prix || 0 }} EUR</small>
            </span>
          </label>
        </div>

        <div class="error" *ngIf="formError">{{ formError }}</div>

        <div class="actions">
          <button type="button" (click)="submitReservation()" [disabled]="submitting">{{ submitting ? 'Envoi...' : 'Réserver' }}</button>
        </div>
      </section>

      <div class="state" *ngIf="loading">Chargement de vos réservations...</div>
      <div class="state error" *ngIf="!loading && error">{{ error }}</div>

      <div class="cards" *ngIf="!loading && !error">
        <article class="card" *ngFor="let reservation of reservations">
          <div class="card-head">
            <div>
              <h3>{{ reservation.voyageNom }}</h3>
              <p>{{ reservation.voyageDestination }}</p>
            </div>
            <span class="badge">{{ reservation.statut }}</span>
          </div>

          <div class="meta">
            <span>{{ reservation.nombrePersonnes }} personne(s)</span>
            <span>{{ reservation.montantTotal || reservation.prixBase || 0 }} EUR</span>
            <span>{{ reservation.paiementEffectue ? 'Paiement confirmé' : 'Paiement non finalisé' }}</span>
          </div>

          <div class="actions">
            <a [routerLink]="['/client/paiements']" class="link-btn">Voir paiements</a>
            <button type="button" *ngIf="reservation.statut !== 'ANNULEE' && reservation.statut !== 'COMPLETEE'" (click)="cancelReservation(reservation)">Annuler</button>
          </div>
        </article>

        <div class="empty" *ngIf="reservations.length === 0">Aucune réservation enregistrée pour le moment.</div>
      </div>
    </section>
  `,
  styles: [`
    .page, .form-card, .cards { display: grid; gap: 1rem; }
    .page-header, .actions, .card-head { display: flex; gap: 0.75rem; justify-content: space-between; align-items: center; flex-wrap: wrap; }
    .form-card, .card, .state, .empty { background: #fff; border-radius: 16px; padding: 1rem; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    label { display: grid; gap: 0.45rem; font-weight: 600; color: #334155; }
    input, select, textarea, button, .link-btn { border: 1px solid #cbd5e1; border-radius: 10px; padding: 0.65rem 0.85rem; background: #fff; }
    .link-btn { text-decoration: none; color: #0f172a; }
    .options { display: grid; gap: 0.5rem; }
    .option-item { display: flex; gap: 0.75rem; align-items: center; font-weight: 400; }
    .badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 0.3rem 0.65rem; border-radius: 999px; font-weight: 700; }
    .meta { display: grid; gap: 0.35rem; color: #475569; }
    .error { color: #b91c1c; }
  `]
})
export class ClientReservationsComponent implements OnInit {
  voyages: Voyage[] = [];
  reservations: Reservation[] = [];
  activitesOptionnelles: ActiviteVoyage[] = [];
  loading = true;
  error = '';
  formError = '';
  submitting = false;
  form: ReservationRequest = {
    voyageId: 0,
    nombrePersonnes: 1,
    commentaire: '',
    activitesOptionnellesIds: []
  };

  constructor(
    private reservationService: ReservationService,
    private voyageService: VoyageService,
    private activiteVoyageService: ActiviteVoyageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const voyageId = Number(params.get('voyageId'));
      if (voyageId) {
        this.form.voyageId = voyageId;
        this.onVoyageChange();
      }
    });

    this.reload();
  }

  reload(): void {
    this.loadVoyages();
    this.loadReservations();
  }

  loadVoyages(): void {
    this.voyageService.getDisponibles().subscribe({ next: (voyages) => { this.voyages = voyages; } });
  }

  loadReservations(): void {
    this.loading = true;
    this.error = '';
    this.reservationService.getMine().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Impossible de charger vos réservations';
        this.loading = false;
      }
    });
  }

  onVoyageChange(): void {
    if (!this.form.voyageId) {
      this.activitesOptionnelles = [];
      this.form.activitesOptionnellesIds = [];
      return;
    }

    this.activiteVoyageService.getOptionnelles(this.form.voyageId).subscribe({
      next: (activites) => {
        this.activitesOptionnelles = activites;
        this.form.activitesOptionnellesIds = [];
      },
      error: () => {
        this.activitesOptionnelles = [];
      }
    });
  }

  isSelected(activiteId: number): boolean {
    return !!this.form.activitesOptionnellesIds?.includes(activiteId);
  }

  toggleActivite(activiteId: number, checked: boolean): void {
    const selected = new Set(this.form.activitesOptionnellesIds || []);

    if (checked) {
      selected.add(activiteId);
    } else {
      selected.delete(activiteId);
    }

    this.form.activitesOptionnellesIds = Array.from(selected);
  }

  submitReservation(): void {
    if (!this.form.voyageId || this.form.nombrePersonnes < 1) {
      this.formError = 'Sélectionnez un voyage et indiquez un nombre de personnes valide.';
      return;
    }

    this.submitting = true;
    this.formError = '';
    this.reservationService.create(this.form).subscribe({
      next: () => {
        this.submitting = false;
        this.form = { voyageId: 0, nombrePersonnes: 1, commentaire: '', activitesOptionnellesIds: [] };
        this.activitesOptionnelles = [];
        this.router.navigate([], { queryParams: { voyageId: null }, queryParamsHandling: 'merge' });
        this.loadReservations();
      },
      error: (err) => {
        this.submitting = false;
        this.formError = err.error?.message || 'Impossible de créer la réservation';
      }
    });
  }

  cancelReservation(reservation: Reservation): void {
    const motif = prompt('Motif d\'annulation', reservation.motifAnnulation || '') ?? '';
    this.reservationService.annuler(reservation.id, motif).subscribe({ next: () => this.loadReservations() });
  }
}
