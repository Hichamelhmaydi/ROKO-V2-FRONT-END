import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardService } from '../../../../core/services/admin-dashboard.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { AdminDashboard } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-admin-statistiques',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page">
      <div class="page-header">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue consolidée des réservations, voyages, voyageurs et revenus.</p>
        </div>
        <button type="button" (click)="loadStats()">Actualiser</button>
      </div>
    
      @if (loading) {
        <div class="state">Chargement des statistiques...</div>
      }
      @if (!loading && error) {
        <div class="state error">{{ error }}</div>
      }
    
      @if (stats && !loading && !error) {
        <div class="stats-grid">
          <article class="card"><h3>Réservations totales</h3><strong>{{ stats.totalReservations }}</strong></article>
          <article class="card"><h3>En attente</h3><strong>{{ stats.reservationsEnAttente }}</strong></article>
          <article class="card"><h3>Confirmées</h3><strong>{{ stats.reservationsConfirmees }}</strong></article>
          <article class="card"><h3>Complétées</h3><strong>{{ stats.reservationsCompletees }}</strong></article>
          <article class="card"><h3>Annulées</h3><strong>{{ stats.reservationsAnnulees }}</strong></article>
          <article class="card"><h3>Voyages</h3><strong>{{ stats.totalVoyages }}</strong></article>
          <article class="card"><h3>Voyages disponibles</h3><strong>{{ stats.voyagesDisponibles }}</strong></article>
          <article class="card"><h3>Voyageurs</h3><strong>{{ stats.totalVoyageurs }}</strong></article>
          <article class="card"><h3>Voyageurs actifs</h3><strong>{{ stats.voyageursActifs }}</strong></article>
          <article class="card"><h3>Voyageurs bloqués</h3><strong>{{ stats.voyageursBloques }}</strong></article>
          <article class="card accent"><h3>Chiffre d'affaires</h3><strong>{{ revenueTotal | number:'1.2-2' }} MAD</strong></article>
        </div>
      }
    </section>
    `,
  styles: [`
    .page { display: grid; gap: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    .card, .state { background: #fff; border-radius: 18px; padding: 1rem; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); }
    .card h3 { margin: 0 0 0.5rem; color: #475569; font-size: 0.95rem; }
    .card strong { font-size: 2rem; color: #0f172a; }
    .card.accent { background: linear-gradient(135deg, #0f766e, #155e75); color: #fff; }
    .card.accent h3, .card.accent strong { color: #fff; }
    button { border: 1px solid #cbd5e1; border-radius: 10px; padding: 0.55rem 0.85rem; background: #fff; }
    .error { color: #b91c1c; }
  `]
})
export class AdminStatistiquesComponent implements OnInit {
  stats: AdminDashboard | null = null;
  revenueTotal = 0;
  loading = true;
  error = '';

  constructor(
    private dashboardService: AdminDashboardService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = '';

    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Impossible de charger les statistiques';
        this.loading = false;
      }
    });

    this.paymentService.getChiffreAffairesTotal().subscribe({
      next: (response) => {
        this.revenueTotal = response.total;
      }
    });
  }
}

