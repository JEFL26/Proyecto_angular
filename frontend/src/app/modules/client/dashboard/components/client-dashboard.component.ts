import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { ServiceService, Service } from '../../../../services/service.service';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {
  services: Service[] = [];
  loading = false;
  error = '';
  userInfo: any = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private serviceService: ServiceService
  ) {}

  ngOnInit(): void {
    this.getUserInfo();
    this.fetchServices();
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

  goToServices(): void {
    this.router.navigate(['/client/services']);
  }

  goToReservations(): void {
    this.router.navigate(['/client/reservations']);
  }
}
