import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VoyageService } from '../../../../../core/services/voyage.service';
import { FileUploadService } from '../../../../../core/services/file-upload.service';
import { VoyageRequest } from '../../../../../core/models/voyage.model';

@Component({
  selector: 'app-voyage-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './voyage-form.component.html',
  styleUrl: './voyage-form.component.scss'
})
export class VoyageFormComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  isEdit = false;
  voyageId: number | null = null;
  loading = false;
  error = '';
  uploadingImage = false;
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  voyage: VoyageRequest = {
    nom: '',
    description: '',
    destination: '',
    dateDepart: '',
    dateRetour: '',
    prixBase: 0,
    cover: ''
  };

  constructor(
    private voyageService: VoyageService,
    private fileUploadService: FileUploadService,
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
          prixBase: voyage.prixBase,
          cover: voyage.cover || ''
        };
        if (voyage.cover) {
          this.imagePreview = voyage.cover;
        }
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du voyage';
        console.error(err);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      // Aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.voyage.cover = '';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onSubmit(): void {
    if (!this.validateForm()) return;

    this.loading = true;
    this.error = '';

    // Si un fichier est sélectionné, uploader d'abord
    if (this.selectedFile) {
      this.uploadingImage = true;
      this.fileUploadService.uploadFile(this.selectedFile).subscribe({
        next: (response) => {
          this.voyage.cover = response.url;
          this.uploadingImage = false;
          this.saveVoyage();
        },
        error: (err) => {
          this.loading = false;
          this.uploadingImage = false;
          this.error = 'Erreur lors de l\'upload de l\'image';
          console.error(err);
        }
      });
    } else {
      this.saveVoyage();
    }
  }

  private saveVoyage(): void {
    const request = { ...this.voyage };

    const operation = this.isEdit && this.voyageId
      ? this.voyageService.update(this.voyageId, request)
      : this.voyageService.create(request);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/admin/voyages']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erreur lors de l\'enregistrement';
        console.error(err);
      }
    });
  }

  validateForm(): boolean {
    if (!this.voyage.nom || !this.voyage.destination || !this.voyage.dateDepart || !this.voyage.dateRetour) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return false;
    }

    if (new Date(this.voyage.dateRetour) <= new Date(this.voyage.dateDepart)) {
      this.error = 'La date de retour doit être après la date de départ';
      return false;
    }

    if (this.voyage.prixBase <= 0) {
      this.error = 'Le prix doit être supérieur à 0';
      return false;
    }

    return true;
  }
}
