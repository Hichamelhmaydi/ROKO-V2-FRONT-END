import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
    if (this.getToken()) {
      this.refreshCurrentUser().subscribe();
    }
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  refreshCurrentUser(): Observable<User | null> {
    if (!this.getToken()) {
      return of(null);
    }

    return this.http.get<Record<string, any>>(`${this.apiUrl}/me`).pipe(
      map((payload) => {
        const role = payload['role']
          ?? payload['authorities']?.[0]?.authority
          ?? 'USER';

        return {
          id: payload['id'],
          email: payload['email'] ?? payload['username'] ?? '',
          nom: payload['nom'] ?? '',
          prenom: payload['prenom'] ?? '',
          telephone: payload['telephone'],
          status: payload['status'],
          role
        } as User;
      }),
      tap((normalized) => {
        localStorage.setItem('user', JSON.stringify(normalized));
        this.currentUserSubject.next(normalized);
      })
    );
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    const user: User = {
      id: response.id,
      email: response.email,
      nom: response.nom,
      prenom: response.prenom,
      role: response.role as User['role']
    };
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout(): void {
    if (this.getToken()) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({ error: () => undefined });
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';
  }

  isVoyageur(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'VOYAGEUR' || user?.role === 'ROLE_VOYAGEUR';
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
