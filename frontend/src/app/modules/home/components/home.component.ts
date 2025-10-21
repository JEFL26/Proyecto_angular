// frontend/src/app/modules/home/home.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  // El operador ! le dice a TypeScript que confíe en que la propiedad authSubscription
  // será inicializada antes de su uso, lo cual ocurre en el método ngOnInit()
  private authSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
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

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
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