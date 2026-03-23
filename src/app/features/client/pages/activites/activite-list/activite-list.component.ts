import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ActiviteService } from '../../../../../core/services/activite.service';
import { VoyageService } from '../../../../../core/services/voyage.service';
import { Activite, Voyage } from '../../../../../core/models/voyage.model';

@Component({
  selector: 'app-client-activite-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './activite-list.component.html',
  styleUrl: './activite-list.component.scss'
})
export class ClientActiviteListComponent implements OnInit {
  activites: Activite[] = [];
  voyages: Voyage[] = [];
  filteredActivites: Activite[] = [];
  loading = true;
  error = '';
  selectedVoyageId: number | null = null;
  currentPage = 1;
  readonly pageSize = 8;

  constructor(
    private activiteService: ActiviteService,
    private voyageService: VoyageService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.voyageService.getActifs().subscribe({
      next: (voyages) => {
        this.voyages = voyages;
        this.loadActivites();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadActivites(): void {
    this.activiteService.getAll().subscribe({
      next: (data) => {
        this.activites = data;
        this.filteredActivites = data;
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des activités';
        this.loading = false;
        console.error(err);
      }
    });
  }

  filterByVoyage(): void {
    if (!this.selectedVoyageId) {
      this.filteredActivites = this.activites;
    } else {
      this.filteredActivites = this.activites.filter(
        a => a.voyageId === this.selectedVoyageId
      );
    }

    this.currentPage = 1;
  }

  getVoyageTitre(voyageId: number): string {
    const voyage = this.voyages.find(v => v.id === voyageId);
    return voyage ? voyage.nom : 'N/A';
  }

  getVoyageDestination(voyageId: number): string {
    const voyage = this.voyages.find(v => v.id === voyageId);
    return voyage ? voyage.destination : '';
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredActivites.length / this.pageSize));
  }

  get pagedActivites(): Activite[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredActivites.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
  }
}
