import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ActiviteService } from '../../../../../core/services/activite.service';
import { VoyageService } from '../../../../../core/services/voyage.service';
import { ErrorHandlerService, ErrorMessage } from '../../../../../core/services/error-handler.service';
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
  errorMessage: ErrorMessage | null = null;
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
    private errorHandler: ErrorHandlerService,
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
        this.errorMessage = this.errorHandler.handleError(err);
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (!this.validateForm()) return;

    this.loading = true;
    this.errorMessage = null;

    const operation = this.isEdit && this.activiteId
      ? this.activiteService.update(this.activiteId, this.activite)
      : this.activiteService.create(this.activite);

    operation.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/activites']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = this.errorHandler.handleError(err);
        console.error(err);
      }
    });
  }

  validateForm(): boolean {
    this.errorMessage = null;

    // Validation nom
    let validation = this.errorHandler.validateTextLength(this.activite.nom, 3, 100, 'Nom de l\'activité');
    if (validation) {
      this.errorMessage = validation;
      return false;
    }

    // Validation voyage
    if (!this.activite.voyageId) {
      this.errorMessage = this.errorHandler.validateForm(
        () => !!this.activite.voyageId,
        'voyage associé'
      );
      return false;
    }

    // Validation prix
    const priceError = this.errorHandler.validateAmount(this.activite.prix, 'prix de l\'activité');
    if (priceError) {
      this.errorMessage = priceError;
      return false;
    }

    return true;
  }
}
