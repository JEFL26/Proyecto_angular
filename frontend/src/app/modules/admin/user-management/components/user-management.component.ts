// frontend/src/app/modules/admin/user-management/components/user-management.component.ts
import { Component, OnInit } from '@angular/core';
import { UserManagementService, UserUpdate } from '../../../../services/user-management.service';
import { UserOut } from '../../../../models/user.model';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: UserOut[] = [];
  loading = false;
  error: string | null = null;
  editingUser: UserOut | null = null;
  editForm: UserUpdate = {};

  constructor(private userManagementService: UserManagementService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Carga todos los usuarios del sistema
   */
  loadUsers(): void {
    this.loading = true;
    this.error = null;
    
    console.log('Cargando usuarios...');
    console.log('Token disponible:', !!localStorage.getItem('access_token'));
    
    // Primero probar la autenticación
    this.userManagementService.testAuth().subscribe({
      next: (response) => {
        console.log('Auth test successful:', response);
        // Si la autenticación funciona, cargar usuarios
        this.loadAllUsers();
      },
      error: (error) => {
        console.error('Auth test failed:', error);
        this.error = `Error de autenticación: ${error.status} - ${error.error?.detail || error.message}`;
        this.loading = false;
      }
    });
  }

  private loadAllUsers(): void {
    this.userManagementService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Usuarios cargados:', users);
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        this.error = `Error al cargar los usuarios: ${error.status} - ${error.error?.detail || error.message}`;
        this.loading = false;
      }
    });
  }

  /**
   * Inicia la edición de un usuario
   */
  startEdit(user: UserOut): void {
    this.editingUser = user;
    this.editForm = {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      id_role: user.id_role
    };
  }

  /**
   * Cancela la edición
   */
  cancelEdit(): void {
    this.editingUser = null;
    this.editForm = {};
  }

  /**
   * Guarda los cambios del usuario
   */
  saveUser(): void {
    if (!this.editingUser) return;

    this.loading = true;
    this.userManagementService.updateUser(this.editingUser.id_user, this.editForm).subscribe({
      next: (updatedUser) => {
        // Actualizar el usuario en la lista
        const index = this.users.findIndex(u => u.id_user === updatedUser.id_user);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.cancelEdit();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.error = 'Error al actualizar el usuario';
        this.loading = false;
      }
    });
  }

  /**
   * Desactiva un usuario
   */
  deactivateUser(user: UserOut): void {
    if (!confirm(`¿Estás seguro de que quieres desactivar al usuario ${user.first_name} ${user.last_name}?`)) {
      return;
    }

    this.loading = true;
    this.userManagementService.deactivateUser(user.id_user).subscribe({
      next: () => {
        // Actualizar el estado del usuario en la lista
        const index = this.users.findIndex(u => u.id_user === user.id_user);
        if (index !== -1) {
          this.users[index].state = false;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error deactivating user:', error);
        this.error = 'Error al desactivar el usuario';
        this.loading = false;
      }
    });
  }

  /**
   * Reactiva un usuario
   */
  activateUser(user: UserOut): void {
    this.loading = true;
    this.userManagementService.activateUser(user.id_user).subscribe({
      next: () => {
        // Actualizar el estado del usuario en la lista
        const index = this.users.findIndex(u => u.id_user === user.id_user);
        if (index !== -1) {
          this.users[index].state = true;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error activating user:', error);
        this.error = 'Error al reactivar el usuario';
        this.loading = false;
      }
    });
  }

  /**
   * Obtiene el nombre del rol
   */
  getRoleName(roleId: number): string {
    return this.userManagementService.getRoleName(roleId);
  }

  /**
   * Obtiene la clase CSS para el estado del usuario
   */
  getUserStateClass(state: boolean): string {
    return state ? 'active' : 'inactive';
  }

  /**
   * Obtiene el texto del estado del usuario
   */
  getUserStateText(state: boolean): string {
    return state ? 'Activo' : 'Inactivo';
  }

  /**
   * Obtiene el número de usuarios activos
   */
  getActiveUsersCount(): number {
    return this.users.filter(u => u.state).length;
  }

  /**
   * Obtiene el número de usuarios inactivos
   */
  getInactiveUsersCount(): number {
    return this.users.filter(u => !u.state).length;
  }
}
