// frontend/src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/home/components/home.component';
import { LoginComponent } from './modules/login/components/login.component';
import { RegisterComponent } from './modules/register/components/register.component';
import { DashboardComponent } from './modules/admin/dashboard/components/dashboard.component';
import { ServicesComponent } from './modules/admin/services/components/services.component';
import { ServiceFormComponent } from './modules/admin/service-form/components/service-form.component';
import { UserManagementComponent } from './modules/admin/user-management/components/user-management.component';
import { ClientDashboardComponent } from './modules/client/dashboard/components/client-dashboard.component';
import { ClientReservationsComponent } from './modules/client/reservations/components/client-reservations.component';
import { AuthGuard } from './guards/auth.guard';

/**
 * Definición de rutas de la aplicación
 * 
 * - '': Ruta vacía (raíz), redirige al home
 * - 'home': Página principal
 * - 'login': Página de inicio de sesión
 * - 'register': Página de registro
 * 
 * Puedes agregar "canActivate: [AuthGuard]" a cualquier ruta
 * para protegerla y requerir autenticación
 */
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Panel admin (solo accesible con token)
  { path: 'admin', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin/services', component: ServicesComponent, canActivate: [AuthGuard] },
  { path: 'admin/services/new', component: ServiceFormComponent, canActivate: [AuthGuard] },
  { path: 'admin/services/edit/:id', component: ServiceFormComponent, canActivate: [AuthGuard] },
  { path: 'admin/users', component: UserManagementComponent, canActivate: [AuthGuard] },
  { 
    path: 'admin', 
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'services', component: ServicesComponent },
      { path: 'services/new', component: ServiceFormComponent },
      { path: 'services/edit/:id', component: ServiceFormComponent },
      { path: 'users', component: UserManagementComponent },
      { path: '', redirectTo: 'services', pathMatch: 'full' }
    ]
  },

  // Panel cliente (solo accesible con token)
  { path: 'client', component: ClientDashboardComponent, canActivate: [AuthGuard] },
  { path: 'client/reservations', component: ClientReservationsComponent, canActivate: [AuthGuard] },

  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
