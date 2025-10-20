// frontend/src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserRegister, UserLogin, AuthResponse, MessageResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL base de tu backend - CÁMBIALA según tu configuración
  private apiUrl = 'http://localhost:8000';
  
  // BehaviorSubject: mantiene el estado del login
  // Si hay token, el usuario está logueado
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Verifica si existe un token en localStorage
   */
  private hasToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Registra un nuevo usuario
   * POST a /auth/register
   */
  register(user: UserRegister): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/auth/register`, user);
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
}