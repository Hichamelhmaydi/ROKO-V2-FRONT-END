import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  create(payload: { nom: string; prenom: string; email: string; password: string; telephone?: string }): Observable<User> {
    return this.http.post<User>(this.apiUrl, payload);
  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/email/${email}`);
  }

  getByStatus(status: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/status/${status}`);
  }

  getActive(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/active`);
  }

  search(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/search`, {
      params: new HttpParams().set('query', query)
    });
  }

  update(id: number, payload: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, payload);
  }

  toggleStatus(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  updatePassword(id: number, newPassword: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/password`, { newPassword });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  exists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${email}`);
  }

  countActive(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/active`);
  }

  countTotal(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/total`);
  }

  countInactive(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/inactive`);
  }
}