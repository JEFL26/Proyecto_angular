// frontend/src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Verifica si el usuario puede acceder a una ruta
   * Si no está autenticado, lo redirige al login
   */
  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true; // Permite el acceso
    } else {
      // Redirige al login si no está autenticado
      this.router.navigate(['/login']);
      return false; // Bloquea el acceso
    }
  }
}