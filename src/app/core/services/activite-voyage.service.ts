import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActionResponse } from '../models/common.model';
import { ActiviteVoyage } from '../models/voyage.model';

@Injectable({
  providedIn: 'root'
})
export class ActiviteVoyageService {
  private apiUrl = `${environment.apiUrl}/activites-voyages`;

  constructor(private http: HttpClient) {}

  create(payload: ActiviteVoyage): Observable<ActiviteVoyage> {
    return this.http.post<ActiviteVoyage>(this.apiUrl, payload);
  }

  getByVoyage(voyageId: number): Observable<ActiviteVoyage[]> {
    return this.http.get<ActiviteVoyage[]>(`${this.apiUrl}/voyage/${voyageId}`);
  }

  getByActivite(activiteId: number): Observable<ActiviteVoyage[]> {
    return this.http.get<ActiviteVoyage[]>(`${this.apiUrl}/activite/${activiteId}`);
  }

  getObligatoires(voyageId: number): Observable<ActiviteVoyage[]> {
    return this.http.get<ActiviteVoyage[]>(`${this.apiUrl}/voyage/${voyageId}/obligatoires`);
  }

  getOptionnelles(voyageId: number): Observable<ActiviteVoyage[]> {
    return this.http.get<ActiviteVoyage[]>(`${this.apiUrl}/voyage/${voyageId}/optionnelles`);
  }

  getByJour(voyageId: number, jour: string): Observable<ActiviteVoyage[]> {
    return this.http.get<ActiviteVoyage[]>(`${this.apiUrl}/voyage/${voyageId}/jour/${jour}`);
  }

  update(id: number, payload: ActiviteVoyage): Observable<ActiviteVoyage> {
    return this.http.put<ActiviteVoyage>(`${this.apiUrl}/${id}`, payload);
  }

  dissocier(activiteId: number, voyageId: number): Observable<ActionResponse> {
    return this.http.delete<ActionResponse>(`${this.apiUrl}/activite/${activiteId}/voyage/${voyageId}`);
  }

  delete(id: number): Observable<ActionResponse> {
    return this.http.delete<ActionResponse>(`${this.apiUrl}/${id}`);
  }

  countByVoyage(voyageId: number): Observable<{ voyageId: number; total: number; obligatoires: number; optionnelles: number }> {
    return this.http.get<{ voyageId: number; total: number; obligatoires: number; optionnelles: number }>(`${this.apiUrl}/voyage/${voyageId}/count`);
  }
}