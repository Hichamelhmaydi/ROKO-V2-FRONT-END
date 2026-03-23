import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActiviteService } from '../../../../../core/services/activite.service';
import { VoyageService } from '../../../../../core/services/voyage.service';
import { Activite, Voyage } from '../../../../../core/models/voyage.model';
import { PopupService } from '../../../../../core/services/popup.service';

@Component({
  selector: 'app-activite-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './activite-list.component.html',
  styleUrl: './activite-list.component.scss'
})
export class ActiviteListComponent implements OnInit {
  activites: Activite[] = [];
  voyages: Voyage[] = [];
  loading = true;
  error = '';
  currentPage = 1;
  readonly pageSize = 8;

  constructor(
    private activiteService: ActiviteService,
    private voyageService: VoyageService,
    private popupService: PopupService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.voyageService.getAll().subscribe({
      next: (voyages) => {
        this.voyages = voyages;
        this.loadActivites();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des voyages';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadActivites(): void {
    this.activiteService.getAll().subscribe({
      next: (data) => {
        this.activites = data;
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

  getVoyageTitre(voyageId: number): string {
    const voyage = this.voyages.find(v => v.id === voyageId);
    return voyage ? voyage.nom : 'N/A';
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.activites.length / this.pageSize));
  }

  get pagedActivites(): Activite[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.activites.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
  }

  async deleteActivite(id: number): Promise<void> {
    const confirmed = await this.popupService.confirm({
      title: 'Supprimer cette activite ?',
      text: 'Cette action est definitive.',
      icon: 'warning',
      confirmText: 'Oui, supprimer'
    });

    if (!confirmed) {
      return;
    }

    this.activiteService.delete(id).subscribe({
      next: async () => {
        this.activites = this.activites.filter(a => a.id !== id);
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
        await this.popupService.success('Activite supprimee');
      },
      error: async (err) => {
        console.error('Erreur suppression:', err);
        await this.popupService.error('Suppression impossible', err.error?.message || 'Une erreur est survenue.');
      }
    });
  }
}
