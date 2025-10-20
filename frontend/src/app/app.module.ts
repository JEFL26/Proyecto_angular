// frontend/src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Importar componentes
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

// Importar servicios y guards
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { ServicesComponent } from './components/admin/services/services.component';
import { ServiceFormComponent } from './components/admin/service-form/service-form.component';

/**
 * Módulo principal de la aplicación
 * 
 * - declarations: Componentes, directivas y pipes que pertenecen a este módulo
 * - imports: Otros módulos que necesitamos
 * - providers: Servicios que estarán disponibles en toda la app
 * - bootstrap: Componente raíz que inicia la aplicación
 */
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    ServicesComponent,
    ServiceFormComponent
  ],
  imports: [
    BrowserModule,           // Módulo esencial para apps de navegador
    AppRoutingModule,        // Módulo de rutas
    HttpClientModule,        // Para hacer peticiones HTTP
    FormsModule              // Para usar [(ngModel)] en formularios
  ],
  providers: [
    AuthService,             // Servicio de autenticación
    AuthGuard                // Guard de protección de rutas
  ],
  bootstrap: [AppComponent]  // Componente inicial
})
export class AppModule { }