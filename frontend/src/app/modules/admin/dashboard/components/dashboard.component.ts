import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { ServiceService, Service } from '../../../../services/service.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  services: Service[] = [];
  loading = false;
  error = '';

  constructor(
    private router: Router, 
    private authService: AuthService,
    private serviceService: ServiceService
  ) {}

  ngOnInit(): void {
    this.fetchServices();
  }

  fetchServices(): void {
    this.loading = true;
    this.error = '';
    this.serviceService.getAll().subscribe({
      next: data => {
        this.services = data;
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

  getInactiveServicesCount(): number {
    return this.services.filter(s => !s.state).length;
  }

  logout(): void {
    this.authService.logout(); // Usa el método de AuthService
    this.router.navigate(['/home']);
  }
}
