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
  registerData: UserRegister = {
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    id_role: 2 // Por defecto, usuario normal
  };
  confirmPassword = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.registerData.email || !this.registerData.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }
    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Usuario creado exitosamente';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error.detail || 'Error al registrar usuario';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}