// frontend/src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserLogin } from '../../models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Modelo del formulario
  loginData: UserLogin = {
    email: '',
    password: ''
  };

  // Estados del componente
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Maneja el submit del formulario de login
   */
  onLogin(): void {
    // Validaciones básicas
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Llamada al servicio de autenticación
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.loading = false;

        // Guarda token
        localStorage.setItem('access_token', response.access_token);

        // Si el usuario es admin, ir a /admin; si no, a /home
        const decodedToken = JSON.parse(atob(response.access_token.split('.')[1]));
        if (decodedToken.role === 1 || decodedToken.is_admin) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (error) => {
        // Error: mostrar mensaje
        this.loading = false;
        if (error.status === 401) {
          this.errorMessage = 'Email o contraseña incorrectos';
        } else {
          this.errorMessage = 'Error al iniciar sesión. Intenta nuevamente';
        }
      }
    });
  }

  /**
   * Navega a la página de registro
   */
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  /**
   * Navega al home
   */
  goToHome(): void {
    this.router.navigate(['/home']);
  }
}