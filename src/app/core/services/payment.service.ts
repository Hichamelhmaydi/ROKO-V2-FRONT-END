import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RevenueResponse } from '../models/common.model';
import { Payment, PaymentSessionResponse, RefundRequest } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/paiements`;

  constructor(private http: HttpClient) {}

  createSession(reservationId: number): Observable<PaymentSessionResponse> {
    return this.http.post<PaymentSessionResponse>(`${this.apiUrl}/create-session`, { reservationId });
  }

  confirm(sessionId: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/confirm`, { sessionId });
  }

  failure(sessionId: string, reason: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/failure`, { sessionId, reason });
  }

  getAll(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl);
  }

  getById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`);
  }

  getMine(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/me`);
  }

  getByReservation(reservationId: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/reservation/${reservationId}`);
  }

  getByStatut(statut: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/statut/${statut}`);
  }

  annuler(id: number): Observable<Payment> {
    return this.http.put<Payment>(`${this.apiUrl}/${id}/annuler`, {});
  }

  rembourser(id: number, payload: RefundRequest): Observable<{ message: string; refundId: string; amount: number; status: string }> {
    return this.http.post<{ message: string; refundId: string; amount: number; status: string }>(`${this.apiUrl}/${id}/rembourser`, payload);
  }

  getChiffreAffairesTotal(): Observable<RevenueResponse> {
    return this.http.get<RevenueResponse>(`${this.apiUrl}/statistiques/chiffre-affaires`);
  }

  getChiffreAffairesPeriode(debut: string, fin: string): Observable<RevenueResponse> {
    const params = new HttpParams().set('debut', debut).set('fin', fin);
    return this.http.get<RevenueResponse>(`${this.apiUrl}/statistiques/chiffre-affaires/periode`, { params });
  }
}