// frontend/src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserRegister, UserLogin, AuthResponse } from '../models/user.model';

export interface UserInfo {
  email: string;
  first_name: string;
  last_name: string;
  role: number;
  is_admin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000';
  
  // BehaviorSubject: mantiene el estado del login
  // Si hay token, el usuario está logueado
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // BehaviorSubject para información del usuario
  private userInfoSubject = new BehaviorSubject<UserInfo | null>(this.getUserInfoFromToken());
  public userInfo$ = this.userInfoSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Verifica si existe un token en localStorage
   */
  private hasToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Obtiene la información del usuario desde el token
   */
  private getUserInfoFromToken(): UserInfo | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      return {
        email: decodedToken.email || '',
        first_name: decodedToken.first_name || '',
        last_name: decodedToken.last_name || '',
        role: decodedToken.role || 0,
        is_admin: decodedToken.is_admin || decodedToken.role === 1
      };
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  register(user: UserRegister): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, user);
  }

  /**
   * Inicia sesión
   * POST a /auth/login
   * Guarda el token en localStorage si es exitoso
   */
  login(credentials: UserLogin): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          // Guardar token en el navegador
          localStorage.setItem('access_token', response.access_token);
          // Actualizar estado de autenticación
          this.isAuthenticatedSubject.next(true);
          // Actualizar información del usuario
          this.userInfoSubject.next(this.getUserInfoFromToken());
        })
      );
  }

  /**
   * Cierra sesión
   * Elimina el token y actualiza el estado
   */
  logout(): void {
    localStorage.removeItem('access_token');
    this.isAuthenticatedSubject.next(false);
    this.userInfoSubject.next(null);
  }

  /**
   * Obtiene el token guardado
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isLoggedIn(): boolean {
    return this.hasToken();
  }

  /**
   * Obtiene la información actual del usuario
   */
  getCurrentUser(): UserInfo | null {
    return this.userInfoSubject.value;
  }

  /**
   * Verifica si el usuario es administrador
   */
  isAdmin(): boolean {
    const userInfo = this.getCurrentUser();
    return userInfo?.is_admin || false;
  }

  /**
   * Verifica si el usuario es cliente
   */
  isClient(): boolean {
    const userInfo = this.getCurrentUser();
    return userInfo?.role === 2 || (!userInfo?.is_admin && userInfo?.role !== 1);
  }

  /**
   * Obtiene el rol del usuario
   */
  getUserRole(): number {
    const userInfo = this.getCurrentUser();
    return userInfo?.role || 0;
  }
}