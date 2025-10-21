// frontend/src/app/modules/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    this.authService.isAuthenticated$.subscribe(
      isAuth => this.isAuthenticated = isAuth
    );
  }

  /**
   * Navega al login
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Navega al registro
   */
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  /**
   * Cierra sesión
   */
  logout(): void {
    this.authService.logout();
    // Opcional: mostrar mensaje de éxito
    alert('Sesión cerrada exitosamente');
  }
}