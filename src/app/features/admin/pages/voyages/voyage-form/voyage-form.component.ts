import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, map, of } from 'rxjs';
import { VoyageService } from '../../../../../core/services/voyage.service';
import { FileUploadService } from '../../../../../core/services/file-upload.service';
import { ErrorHandlerService, ErrorMessage } from '../../../../../core/services/error-handler.service';
import { VoyageRequest } from '../../../../../core/models/voyage.model';

@Component({
  selector: 'app-voyage-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './voyage-form.component.html',
  styleUrl: './voyage-form.component.scss'
})
export class VoyageFormComponent implements OnInit {
  @ViewChild('coverFileInput') coverFileInput!: ElementRef;
  @ViewChild('photosFileInput') photosFileInput!: ElementRef;

  isEdit = false;
  voyageId: number | null = null;
  loading = false;
  errorMessage: ErrorMessage | null = null;
  uploadingImage = false;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  selectedPhotosFiles: File[] = [];
  photosPreviews: string[] = [];

  voyage: VoyageRequest = {
    nom: '',
    description: '',
    destination: '',
    dateDepart: '',
    dateRetour: '',
    prixBase: 0,
    cover: '',
    photos: []
  };

  get todayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  constructor(
    private voyageService: VoyageService,
    private fileUploadService: FileUploadService,
    private errorHandler: ErrorHandlerService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.voyageId = +id;
      this.loadVoyage();
    }
  }

  loadVoyage(): void {
    if (!this.voyageId) return;

    this.voyageService.getById(this.voyageId).subscribe({
      next: (voyage) => {
        this.voyage = {
          nom: voyage.nom,
          description: voyage.description,
          destination: voyage.destination,
          dateDepart: voyage.dateDepart.split('T')[0],
          dateRetour: voyage.dateRetour.split('T')[0],
          prixBase: voyage.prixInitial ?? voyage.prixBase,
          cover: voyage.cover || '',
          photos: voyage.photos || []
        };
        if (voyage.cover) {
          this.imagePreview = voyage.cover;
        }
      },
      error: (err) => {
        this.errorMessage = this.errorHandler.handleError(err);
        console.error(err);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validation fichier (image)
      const validation = this.errorHandler.validateFile(file, ['image/jpeg', 'image/png', 'image/webp'], 5);
      if (validation) {
        this.errorMessage = validation;
        return;
      }

      this.selectedFile = file;
      this.errorMessage = null;

      // Aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onPhotosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    // Validation chaque fichier
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      const validation = this.errorHandler.validateFile(file, ['image/jpeg', 'image/png', 'image/webp'], 5);
      if (validation) {
        this.errorMessage = validation;
        return;
      }
    }

    this.selectedPhotosFiles = Array.from(input.files);
    this.photosPreviews = [];
    this.errorMessage = null;

    this.selectedPhotosFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photosPreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.voyage.cover = '';
    if (this.coverFileInput) {
      this.coverFileInput.nativeElement.value = '';
    }
  }

  removeExistingVoyagePhoto(index: number): void {
    const currentPhotos = this.voyage.photos || [];
    this.voyage.photos = currentPhotos.filter((_, i) => i !== index);
  }

  removeSelectedPhoto(index: number): void {
    this.selectedPhotosFiles = this.selectedPhotosFiles.filter((_, i) => i !== index);
    this.photosPreviews = this.photosPreviews.filter((_, i) => i !== index);
    if (this.selectedPhotosFiles.length === 0 && this.photosFileInput) {
      this.photosFileInput.nativeElement.value = '';
    }
  }

  clearSelectedPhotos(): void {
    this.selectedPhotosFiles = [];
    this.photosPreviews = [];
    if (this.photosFileInput) {
      this.photosFileInput.nativeElement.value = '';
    }
  }

  onSubmit(): void {
    if (!this.validateForm()) return;

    this.loading = true;
    this.errorMessage = null;
    this.uploadingImage = true;

    const coverUpload$ = this.selectedFile
      ? this.fileUploadService.uploadFile(this.selectedFile).pipe(map((response) => response.url))
      : of(this.voyage.cover || '');

    const photosUpload$ = this.selectedPhotosFiles.length > 0
      ? forkJoin(this.selectedPhotosFiles.map((file) => this.fileUploadService.uploadFile(file))).pipe(
          map((responses) => responses.map((response) => response.url))
        )
      : of<string[]>([]);

    forkJoin({ coverUrl: coverUpload$, photosUrls: photosUpload$ }).subscribe({
      next: ({ coverUrl, photosUrls }) => {
        this.voyage.cover = coverUrl;
        this.voyage.photos = [...(this.voyage.photos || []), ...photosUrls];
        this.uploadingImage = false;
        this.saveVoyage();
      },
      error: (err) => {
        this.loading = false;
        this.uploadingImage = false;
        this.errorMessage = this.errorHandler.handleError(err);
        console.error(err);
      }
    });
  }

  private saveVoyage(): void {
    const request = {
      ...this.voyage,
      prixInitial: this.voyage.prixBase
    };

    const operation = this.isEdit && this.voyageId
      ? this.voyageService.update(this.voyageId, request)
      : this.voyageService.create(request);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/admin/voyages']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = this.errorHandler.handleError(err);
        console.error(err);
      }
    });
  }

  private extractErrorMessage(err: any): string {
    const apiError = err?.error;
    if (apiError?.errors && typeof apiError.errors === 'object') {
      const firstError = Object.values(apiError.errors)[0];
      if (typeof firstError === 'string' && firstError.trim()) {
        return firstError;
      }
    }
    return apiError?.message || 'Erreur lors de l\'enregistrement';
  }

  private toLocalDate(value: string): Date | null {
    if (!value) {
      return null;
    }
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) {
      return null;
    }
    return new Date(year, month - 1, day);
  }

  validateForm(): boolean {
    this.errorMessage = null;

    // Validation nom
    let validation = this.errorHandler.validateTextLength(this.voyage.nom, 3, 100, 'Nom du voyage');
    if (validation) {
      this.errorMessage = validation;
      return false;
    }

    // Validation destination
    validation = this.errorHandler.validateTextLength(this.voyage.destination, 3, 100, 'Destination');
    if (validation) {
      this.errorMessage = validation;
      return false;
    }

    // Validation dates
    validation = this.errorHandler.validateDateRange(this.voyage.dateDepart, this.voyage.dateRetour);
    if (validation) {
      this.errorMessage = validation;
      return false;
    }

    const today = this.toLocalDate(this.todayDate);
    const dateDepart = this.toLocalDate(this.voyage.dateDepart);

    if (!dateDepart || !today || dateDepart < today) {
      this.errorMessage = {
        title: 'Date de départ invalide',
        message: 'La date de départ doit être aujourd\'hui ou dans le futur.',
        type: 'validation'
      };
      return false;
    }

    // Validation prix
    validation = this.errorHandler.validateAmount(this.voyage.prixBase, 'prix du voyage');
    if (validation) {
      this.errorMessage = validation;
      return false;
    }

    // Validation cover
    const existingPhotosCount = this.voyage.photos?.length || 0;
    const newPhotosCount = this.selectedPhotosFiles.length;
    if (!this.isEdit && !this.selectedFile && !this.voyage.cover) {
      this.errorMessage = {
        title: 'Image de couverture manquante',
        message: 'Téléchargez une image de couverture pour le voyage.',
        type: 'validation'
      };
      return false;
    }

    // Validation photos supplémentaires
    if (!this.isEdit && existingPhotosCount + newPhotosCount === 0) {
      this.errorMessage = {
        title: 'Photos supplémentaires manquantes',
        message: 'Ajoutez au moins une photo du voyage (lieux) en plus du cover.',
        type: 'validation'
      };
      return false;
    }

    return true;
  }
}
