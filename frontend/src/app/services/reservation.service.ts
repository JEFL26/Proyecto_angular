import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reservation {
  id_reservation?: number;
  id_user?: number;
  id_service: number;
  id_reservation_status?: number;
  scheduled_datetime: string;
  created_at?: string;
  total_price?: number;
  payment_method: string;
  state?: boolean;
  service_name?: string;
  service_description?: string;
  duration_minutes?: number;
  status_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface ReservationCreate {
  id_service: number;
  scheduled_datetime: string;
  payment_method: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:8000/reservations';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Crea una nueva reserva
   */
  create(reservation: ReservationCreate): Observable<any> {
    return this.http.post(this.apiUrl, reservation, { headers: this.getAuthHeaders() });
  }

  /**
   * Obtiene todas las reservas del usuario autenticado
   */
  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/my-reservations`, { headers: this.getAuthHeaders() });
  }

  /**
   * Obtiene todas las reservas del sistema (solo para administradores)
   */
  getAll(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  /**
   * Obtiene una reserva por su ID
   */
  getById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  /**
   * Cancela una reserva
   */
  cancel(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/cancel`, {}, { headers: this.getAuthHeaders() });
  }

  /**
   * Actualiza el estado de una reserva (solo para administradores)
   */
  updateStatus(id: number, statusId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status/${statusId}`, {}, { headers: this.getAuthHeaders() });
  }

  /**
   * Elimina una reserva (solo para administradores)
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}

