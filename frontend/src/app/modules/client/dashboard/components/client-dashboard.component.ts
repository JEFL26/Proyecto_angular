import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { ServiceService, Service } from '../../../../services/service.service';
import { ReservationService, Reservation, ReservationCreate } from '../../../../services/reservation.service';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {
  services: Service[] = [];
  reservations: Reservation[] = [];
  loading = false;
  error = '';
  userInfo: any = null;
  showReservationModal = false;
  selectedService: Service | null = null;
  reservationData = {
    scheduled_datetime: '',
    payment_method: 'Efectivo'
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private serviceService: ServiceService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.getUserInfo();
    this.fetchServices();
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

  fetchServices(): void {
    this.loading = true;
    this.error = '';
    this.serviceService.getAll().subscribe({
      next: data => {
        // Solo mostrar servicios activos para clientes
        this.services = data.filter(service => service.state);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los servicios';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  fetchReservations(): void {
    this.reservationService.getMyReservations().subscribe({
      next: data => {
        this.reservations = data;
      },
      error: (err) => {
        console.error('Error al cargar las reservas:', err);
      }
    });
  }

  getReservationsCount(): number {
    return this.reservations.length;
  }

  getConfirmedReservationsCount(): number {
    return this.reservations.filter(r => r.status_name === 'Confirmado').length;
  }

  getPendingReservationsCount(): number {
    return this.reservations.filter(r => r.status_name === 'Pendiente').length;
  }

  getActiveServicesCount(): number {
    return this.services.filter(s => s.state).length;
  }

  getUserInitials(): string {
    if (this.userInfo?.first_name && this.userInfo?.last_name) {
      return (this.userInfo.first_name.charAt(0) + this.userInfo.last_name.charAt(0)).toUpperCase();
    }
    return 'U';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  goToReservations(): void {
    this.router.navigate(['/client/reservations']);
  }

  openReservationModal(service: Service): void {
    this.selectedService = service;
    this.showReservationModal = true;
    // Establecer fecha mínima como mañana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formatted = tomorrow.toISOString().slice(0, 16);
    this.reservationData.scheduled_datetime = formatted;
  }

  closeReservationModal(): void {
    this.showReservationModal = false;
    this.selectedService = null;
    this.reservationData = {
      scheduled_datetime: '',
      payment_method: 'Efectivo'
    };
  }

  submitReservation(): void {
    if (!this.selectedService || !this.reservationData.scheduled_datetime) {
      alert('Por favor completa todos los campos');
      return;
    }

    const reservation: ReservationCreate = {
      id_service: this.selectedService.id_service!,
      scheduled_datetime: this.reservationData.scheduled_datetime.replace('T', ' ') + ':00',
      payment_method: this.reservationData.payment_method
    };

    console.log('Enviando reserva:', reservation);

    this.reservationService.create(reservation).subscribe({
      next: (response) => {
        console.log('Respuesta exitosa:', response);
        alert('¡Reserva creada exitosamente!');
        this.closeReservationModal();
        this.fetchReservations(); // Actualizar las reservas
      },
      error: (err) => {
        console.error('Error completo:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.error);
        const errorMsg = err.error?.detail || err.message || 'Error desconocido';
        alert('Error al crear la reserva: ' + errorMsg);
      }
    });
  }

  getMinDateTime(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  }
}
