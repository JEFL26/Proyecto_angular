// frontend/src/app/components/register/register.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserRegister } from '../../../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  // Modelo del formulario
  registerData: UserRegister = {
    email: '',
    password: ''
  };

  // Campo adicional para confirmar contraseña
  confirmPassword = '';

  // Estados del componente
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Maneja el submit del formulario de registro
   */
  onRegister(): void {
    // Limpiar mensajes previos
    this.errorMessage = '';
    this.successMessage = '';

    // Validaciones
    if (!this.registerData.email || !this.registerData.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (this.registerData.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.loading = true;

    // Llamada al servicio de registro
    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        // Éxito: mostrar mensaje y redirigir al login
        this.loading = false;
        this.successMessage = response.msg || 'Usuario creado exitosamente';
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        // Error: mostrar mensaje
        this.loading = false;
        if (error.status === 400) {
          this.errorMessage = 'El email ya está registrado';
        } else {
          this.errorMessage = 'Error al registrar usuario. Intenta nuevamente';
        }
      }
    });
  }

  /**
   * Navega a la página de login
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Navega al home
   */
  goToHome(): void {
    this.router.navigate(['/home']);
  }
}