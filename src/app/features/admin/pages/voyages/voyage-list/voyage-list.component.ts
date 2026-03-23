import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VoyageService } from '../../../../../core/services/voyage.service';
import { Voyage } from '../../../../../core/models/voyage.model';
import { PopupService } from '../../../../../core/services/popup.service';

@Component({
  selector: 'app-voyage-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './voyage-list.component.html',
  styleUrl: './voyage-list.component.scss'
})
export class VoyageListComponent implements OnInit {
  voyages: Voyage[] = [];
  loading = true;
  error = '';
  currentPage = 1;
  readonly pageSize = 6;

  constructor(
    private voyageService: VoyageService,
    private popupService: PopupService
  ) {}

  ngOnInit(): void {
    this.loadVoyages();
  }

  loadVoyages(): void {
    this.loading = true;
    this.voyageService.getAll().subscribe({
      next: (data) => {
        this.voyages = data;
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des voyages';
        this.loading = false;
        console.error(err);
      }
    });
  }

  toggleStatut(voyage: Voyage): void {
    const newStatut = voyage.statut === 'DISPONIBLE' ? 'COMPLET' : 'DISPONIBLE';
    this.voyageService.updateStatut(voyage.id, newStatut).subscribe({
      next: (updated) => {
        const index = this.voyages.findIndex(v => v.id === voyage.id);
        if (index !== -1) {
          this.voyages[index] = updated;
        }
      },
      error: (err) => {
        console.error('Erreur changement statut:', err);
      }
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.voyages.length / this.pageSize));
  }

  get pagedVoyages(): Voyage[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.voyages.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
  }

  async deleteVoyage(id: number): Promise<void> {
    const confirmed = await this.popupService.confirm({
      title: 'Supprimer ce voyage ?',
      text: 'Cette action est definitive.',
      icon: 'warning',
      confirmText: 'Oui, supprimer'
    });

    if (!confirmed) {
      return;
    }

    this.voyageService.delete(id).subscribe({
      next: async () => {
        this.voyages = this.voyages.filter(v => v.id !== id);
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
        await this.popupService.success('Voyage supprime');
      },
      error: async (err) => {
        console.error('Erreur suppression:', err);
        await this.popupService.error('Suppression impossible', err.error?.message || 'Une erreur est survenue.');
      }
    });
  }
}
