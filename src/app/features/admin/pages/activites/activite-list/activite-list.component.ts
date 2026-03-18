import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActiviteService } from '../../../../../core/services/activite.service';
import { VoyageService } from '../../../../../core/services/voyage.service';
import { Activite, Voyage } from '../../../../../core/models/voyage.model';

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

  constructor(
    private activiteService: ActiviteService,
    private voyageService: VoyageService
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

  deleteActivite(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
      this.activiteService.delete(id).subscribe({
        next: () => {
          this.activites = this.activites.filter(a => a.id !== id);
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
        }
      });
    }
  }
}
