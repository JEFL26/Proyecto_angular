import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReservationService, Reservation } from '../../../../services/reservation.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-client-reservations',
  templateUrl: './client-reservations.component.html',
  styleUrls: ['./client-reservations.component.css']
})
export class ClientReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  loading = false;
  error = '';
  userInfo: any = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.getUserInfo();
    this.fetchReservations();
  }

  getUserInfo(): void {
    const token = this.authService.getToken();
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        this.userInfo = {
          email: decodedToken.email,
          first_name: decodedToken.first_name,
          last_name: decodedToken.last_name,
          role: decodedToken.role
        };
      } catch (error) {
        console.error('Error decodificando token:', error);
      }
    }
  }

  fetchReservations(): void {
    this.loading = true;
    this.error = '';
    this.reservationService.getMyReservations().subscribe({
      next: data => {
        this.reservations = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las reservas';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  getUserInitials(): string {
    if (this.userInfo?.first_name && this.userInfo?.last_name) {
      return (this.userInfo.first_name.charAt(0) + this.userInfo.last_name.charAt(0)).toUpperCase();
    }
    return 'U';
  }

  cancelReservation(id: number): void {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    this.reservationService.cancel(id).subscribe({
      next: () => {
        alert('Reserva cancelada exitosamente');
        this.fetchReservations(); // Recargar las reservas
      },
      error: (err) => {
        alert('Error al cancelar la reserva');
        console.error('Error:', err);
      }
    });
  }

  getStatusClass(statusName: string): string {
    switch (statusName) {
      case 'Pendiente':
        return 'status-pending';
      case 'Confirmado':
        return 'status-confirmed';
      case 'Cancelado':
        return 'status-cancelled';
      case 'Completado':
        return 'status-completed';
      default:
        return '';
    }
  }

  canCancelReservation(reservation: Reservation): boolean {
    // Solo se pueden cancelar reservas en estado Pendiente o Confirmado
    return reservation.status_name === 'Pendiente' || reservation.status_name === 'Confirmado';
  }

  formatDateTime(dateTimeStr: string): string {
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateTimeStr;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  goToServices(): void {
    this.router.navigate(['/client/services']);
  }

  goToDashboard(): void {
    this.router.navigate(['/client']);
  }
}

