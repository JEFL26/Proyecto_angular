// frontend/src/app/app.component.ts
import { Component } from '@angular/core';

/**
 * Componente raíz de la aplicación
 * Este es el contenedor principal que carga todos los demás componentes
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Centro de Belleza';
}