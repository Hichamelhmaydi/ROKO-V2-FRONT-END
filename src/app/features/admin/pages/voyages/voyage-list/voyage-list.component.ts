import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VoyageService } from '../../../../../core/services/voyage.service';
import { Voyage } from '../../../../../core/models/voyage.model';

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

  constructor(private voyageService: VoyageService) {}

  ngOnInit(): void {
    this.loadVoyages();
  }

  loadVoyages(): void {
    this.loading = true;
    this.voyageService.getAll().subscribe({
      next: (data) => {
        this.voyages = data;
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

  deleteVoyage(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce voyage ?')) {
      this.voyageService.delete(id).subscribe({
        next: () => {
          this.voyages = this.voyages.filter(v => v.id !== id);
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
        }
      });
    }
  }
}
