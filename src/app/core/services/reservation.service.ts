import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActionResponse, CountResponse, PageResponse } from '../models/common.model';
import { Reservation, ReservationRequest } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  create(payload: ReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, payload);
  }

  getAll(page = 0, size = 10, sortBy = 'dateReservation', sortDir = 'DESC'): Observable<PageResponse<Reservation>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<Reservation>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
  }

  getMine(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/me`);
  }

  getByUser(userId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/user/${userId}`);
  }

  getByVoyage(voyageId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/voyage/${voyageId}`);
  }

  getByStatut(statut: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/statut/${statut}`);
  }

  getEnAttente(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/en-attente`);
  }

  getRecentes(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/recentes`);
  }

  annuler(id: number, motif = ''): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${id}/annuler`, { motif });
  }

  update(id: number, payload: Reservation): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<ActionResponse> {
    return this.http.delete<ActionResponse>(`${this.apiUrl}/${id}`);
  }

  countByStatut(statut: string): Observable<CountResponse> {
    return this.http.get<CountResponse>(`${this.apiUrl}/count/statut/${statut}`);
  }

  countMine(): Observable<CountResponse> {
    return this.http.get<CountResponse>(`${this.apiUrl}/me/count`);
  }

  marquerCommePaye(id: number): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${id}/payer`, {});
  }
}