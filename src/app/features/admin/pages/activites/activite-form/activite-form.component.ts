import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ActiviteService } from '../../../../../core/services/activite.service';
import { VoyageService } from '../../../../../core/services/voyage.service';
import { ActiviteRequest, Voyage } from '../../../../../core/models/voyage.model';

@Component({
  selector: 'app-activite-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './activite-form.component.html',
  styleUrl: './activite-form.component.scss'
})
export class ActiviteFormComponent implements OnInit {
  isEdit = false;
  activiteId: number | null = null;
  loading = false;
  error = '';
  voyages: Voyage[] = [];

  activite: ActiviteRequest = {
    nom: '',
    description: '',
    prix: 0,
    voyageId: 0
  };

  constructor(
    private activiteService: ActiviteService,
    private voyageService: VoyageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVoyages();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.activiteId = +id;
      this.loadActivite();
    }
  }

  loadVoyages(): void {
    this.voyageService.getAll().subscribe({
      next: (data) => {
        this.voyages = data;
      },
      error: (err) => {
        console.error('Erreur chargement voyages:', err);
      }
    });
  }

  loadActivite(): void {
    if (!this.activiteId) return;

    this.activiteService.getById(this.activiteId).subscribe({
      next: (activite) => {
        this.activite = {
          nom: activite.nom,
          description: activite.description,
          prix: activite.prix,
          voyageId: activite.voyageId
        };
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de l\'activité';
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (!this.validateForm()) return;

    this.loading = true;
    this.error = '';

    const operation = this.isEdit && this.activiteId
      ? this.activiteService.update(this.activiteId, this.activite)
      : this.activiteService.create(this.activite);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/admin/activites']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erreur lors de l\'enregistrement';
        console.error(err);
      }
    });
  }

  validateForm(): boolean {
    if (!this.activite.nom || !this.activite.voyageId) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return false;
    }

    if (this.activite.prix < 0) {
      this.error = 'Le prix ne peut pas être négatif';
      return false;
    }

    return true;
  }
}
