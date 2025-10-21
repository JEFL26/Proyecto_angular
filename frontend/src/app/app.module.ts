// frontend/src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Importar componentes
import { HomeComponent } from './modules/home/components/home.component';
import { LoginComponent } from './modules/login/components/login.component';
import { RegisterComponent } from './modules/register/components/register.component';

// Importar servicios y guards
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { DashboardComponent } from './modules/admin/dashboard/components/dashboard.component';
import { ServicesComponent } from './modules/admin/services/components/services.component';
import { ServiceFormComponent } from './modules/admin/service-form/components/service-form.component';

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