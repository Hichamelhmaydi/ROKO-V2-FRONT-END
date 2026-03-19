export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  status?: string;
  idNational?: string;
  dateExpiration?: string;
  role: 'ADMIN' | 'VOYAGEUR' | 'USER' | 'ROLE_ADMIN' | 'ROLE_VOYAGEUR' | 'ROLE_USER' | string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone: string;
  idNational?: string;
  dateExpiration?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  message?: string;
}
