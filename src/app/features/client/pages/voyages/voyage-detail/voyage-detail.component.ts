import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VoyageService } from '../../../../../core/services/voyage.service';
import { ActiviteService } from '../../../../../core/services/activite.service';
import { Voyage, Activite } from '../../../../../core/models/voyage.model';

@Component({
  selector: 'app-voyage-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './voyage-detail.component.html',
  styleUrl: './voyage-detail.component.scss'
})
export class VoyageDetailComponent implements OnInit {
  voyage: Voyage | null = null;
  activites: Activite[] = [];
  loading = true;
  error = '';

  constructor(
    private voyageService: VoyageService,
    private activiteService: ActiviteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadVoyage(+id);
    }
  }

  loadVoyage(id: number): void {
    this.loading = true;

    this.voyageService.getById(id).subscribe({
      next: (voyage) => {
        this.voyage = voyage;
        this.loadActivites(id);
      },
      error: (err) => {
        this.error = 'Voyage non trouvé';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadActivites(voyageId: number): void {
    this.activiteService.getByVoyageId(voyageId).subscribe({
      next: (activites) => {
        this.activites = activites;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement activités:', err);
        this.loading = false;
      }
    });
  }

  getDuration(): number {
    if (!this.voyage) return 0;
    const start = new Date(this.voyage.dateDepart);
    const end = new Date(this.voyage.dateRetour);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  goBack(): void {
    this.router.navigate(['/client/voyages']);
  }
}
