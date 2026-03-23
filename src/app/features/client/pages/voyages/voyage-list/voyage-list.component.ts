import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VoyageService } from '../../../../../core/services/voyage.service';
import { Voyage } from '../../../../../core/models/voyage.model';

@Component({
  selector: 'app-client-voyage-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './voyage-list.component.html',
  styleUrl: './voyage-list.component.scss'
})
export class ClientVoyageListComponent implements OnInit {
  voyages: Voyage[] = [];
  filteredVoyages: Voyage[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  currentPage = 1;
  readonly pageSize = 6;

  constructor(private voyageService: VoyageService) {}

  ngOnInit(): void {
    this.loadVoyages();
  }

  loadVoyages(): void {
    this.loading = true;
    this.voyageService.getActifs().subscribe({
      next: (data) => {
        this.voyages = data;
        this.filteredVoyages = data;
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

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredVoyages = this.voyages;
      this.currentPage = 1;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredVoyages = this.voyages.filter(v =>
      v.nom.toLowerCase().includes(term) ||
      v.destination.toLowerCase().includes(term) ||
      v.description?.toLowerCase().includes(term)
    );
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredVoyages.length / this.pageSize));
  }

  get pagedVoyages(): Voyage[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredVoyages.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
  }
}
