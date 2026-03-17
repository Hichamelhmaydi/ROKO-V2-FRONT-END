import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Activite, ActiviteRequest } from '../models/voyage.model';
import { ActionResponse, CountResponse } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class ActiviteService {
  private apiUrl = `${environment.apiUrl}/activites`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Activite[]> {
    return this.http.get<Activite[]>(this.apiUrl);
  }

  getById(id: number): Observable<Activite> {
    return this.http.get<Activite>(`${this.apiUrl}/${id}`);
  }

  getByVoyageId(voyageId: number): Observable<Activite[]> {
    return this.http.get<Activite[]>(`${this.apiUrl}/voyage/${voyageId}`);
  }

  getByIdWithDetails(id: number): Observable<Activite> {
    return this.http.get<Activite>(`${this.apiUrl}/${id}/details`);
  }

  getByVoyageIdWithDetails(voyageId: number): Observable<Activite[]> {
    return this.http.get<Activite[]>(`${this.apiUrl}/voyage/${voyageId}/details`);
  }

  searchByNom(nom: string): Observable<Activite[]> {
    return this.http.get<Activite[]>(`${this.apiUrl}/search`, {
      params: new HttpParams().set('nom', nom)
    });
  }

  searchByDescription(keyword: string): Observable<Activite[]> {
    return this.http.get<Activite[]>(`${this.apiUrl}/search/description`, {
      params: new HttpParams().set('keyword', keyword)
    });
  }

  getPopulaires(): Observable<Activite[]> {
    return this.http.get<Activite[]>(`${this.apiUrl}/populaires`);
  }

  create(activite: ActiviteRequest): Observable<Activite> {
    return this.http.post<Activite>(this.apiUrl, activite);
  }

  update(id: number, activite: ActiviteRequest): Observable<Activite> {
    return this.http.put<Activite>(`${this.apiUrl}/${id}`, activite);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  forceDelete(id: number): Observable<ActionResponse> {
    return this.http.delete<ActionResponse>(`${this.apiUrl}/${id}/force`);
  }

  countByVoyageId(voyageId: number): Observable<CountResponse> {
    return this.http.get<CountResponse>(`${this.apiUrl}/voyage/${voyageId}/count`);
  }

  exists(id: number): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/${id}/exists`);
  }
}
