import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Voyage, VoyageRequest } from '../models/voyage.model';

@Injectable({
  providedIn: 'root'
})
export class VoyageService {
  private apiUrl = `${environment.apiUrl}/voyages`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(this.apiUrl);
  }

  getById(id: number): Observable<Voyage> {
    return this.http.get<Voyage>(`${this.apiUrl}/${id}`);
  }

  getActifs(): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(`${this.apiUrl}/actifs`);
  }

  getDisponibles(): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(`${this.apiUrl}/disponibles`);
  }

  create(voyage: VoyageRequest): Observable<Voyage> {
    return this.http.post<Voyage>(this.apiUrl, voyage);
  }

  update(id: number, voyage: VoyageRequest): Observable<Voyage> {
    return this.http.put<Voyage>(`${this.apiUrl}/${id}`, voyage);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateStatut(id: number, statut: string): Observable<Voyage> {
    return this.http.patch<Voyage>(`${this.apiUrl}/${id}/statut?statut=${statut}`, {});
  }

  searchByDestination(destination: string): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(`${this.apiUrl}/destination/${destination}`);
  }

  getByNom(nom: string): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(`${this.apiUrl}/nom/${nom}`);
  }

  getByStatut(statut: string): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(`${this.apiUrl}/statut/${statut}`);
  }

  search(query: string): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(`${this.apiUrl}/search`, {
      params: new HttpParams().set('query', query)
    });
  }

  filter(filters: { destination?: string; dateDepart?: string; dateRetour?: string; prixMin?: number; prixMax?: number }): Observable<Voyage[]> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<Voyage[]>(`${this.apiUrl}/filter`, { params });
  }

  getByDateDepart(dateDepart: string): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(`${this.apiUrl}/date-depart/${dateDepart}`);
  }

  addPhotos(id: number, photos: string[]): Observable<Voyage> {
    return this.http.post<Voyage>(`${this.apiUrl}/${id}/photos`, photos);
  }

  removePhoto(id: number, photoUrl: string): Observable<Voyage> {
    return this.http.delete<Voyage>(`${this.apiUrl}/${id}/photos`, {
      body: { photoUrl }
    });
  }

  countDisponibles(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/disponibles`);
  }

  countTotal(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/total`);
  }

  countByStatut(statut: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/statut/${statut}`);
  }
}
