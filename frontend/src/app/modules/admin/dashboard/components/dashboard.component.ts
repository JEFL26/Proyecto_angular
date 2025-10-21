import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(private router: Router, private authService: AuthService) {}

  logout(): void {
    this.authService.logout(); // Usa el método de AuthService
    this.router.navigate(['/home']);
  }
}
