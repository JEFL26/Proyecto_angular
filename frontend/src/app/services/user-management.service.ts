// frontend/src/app/services/user-management.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserOut } from '../models/user.model';

export interface UserUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  id_role?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Obtiene todos los usuarios registrados
   */
  getAllUsers(): Observable<UserOut[]> {
    const headers = this.getHeaders();
    console.log('Headers enviados:', headers);
    console.log('URL:', `${this.apiUrl}/users/`);
    
    return this.http.get<UserOut[]>(`${this.apiUrl}/users/`, {
      headers: headers
    });
  }

  /**
   * Obtiene un usuario específico por ID
   */
  getUserById(userId: number): Observable<UserOut> {
    return this.http.get<UserOut>(`${this.apiUrl}/users/${userId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Actualiza un usuario
   */
  updateUser(userId: number, userData: UserUpdate): Observable<UserOut> {
    return this.http.put<UserOut>(`${this.apiUrl}/users/${userId}`, userData, {
      headers: this.getHeaders()
    });
  }

  /**
   * Desactiva un usuario (soft delete)
   */
  deactivateUser(userId: number): Observable<{message: string}> {
    return this.http.patch<{message: string}>(`${this.apiUrl}/users/${userId}/deactivate`, {}, {
      headers: this.getHeaders()
    });
  }

  /**
   * Reactiva un usuario
   */
  activateUser(userId: number): Observable<{message: string}> {
    return this.http.patch<{message: string}>(`${this.apiUrl}/users/${userId}/activate`, {}, {
      headers: this.getHeaders()
    });
  }

  /**
   * Prueba la autenticación
   */
  testAuth(): Observable<any> {
    const headers = this.getHeaders();
    console.log('Testing auth with headers:', headers);
    
    return this.http.get<any>(`${this.apiUrl}/users/test`, {
      headers: headers
    });
  }

  /**
   * Obtiene el nombre del rol basado en el ID
   */
  getRoleName(roleId: number): string {
    switch (roleId) {
      case 1:
        return 'Administrador';
      case 2:
        return 'Cliente';
      default:
        return 'Desconocido';
    }
  }
}
