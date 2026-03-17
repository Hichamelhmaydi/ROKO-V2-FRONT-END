import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CountResponse } from '../models/common.model';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getMine(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/me`);
  }

  getUnreadCount(): Observable<CountResponse> {
    return this.http.get<CountResponse>(`${this.apiUrl}/me/unread-count`);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/read`, {});
  }
}