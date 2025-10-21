import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceService, Service } from '../../../../services/service.service';
import { HttpClient, HttpHeaders, HttpEventType } from '@angular/common/http';

interface FileItem {
  file: File;
  id: string;
}

interface UploadResult {
  summary: {
    total_files: number;
    total_processed: number;
    completed: number;
    skipped: number;
    failed: number;
  };
  details: Array<{
    filename: string;
    completed: number;
    skipped: number;
    failed: number;
    total: number;
    errors?: string[];
  }>;
}

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {
  services: Service[] = [];
  loading = false;
  error = '';
  
  // Manejo de archivos
  selectedFiles: FileItem[] = [];
  uploading = false;
  progress = 0;
  uploadResult: UploadResult | null = null;

  constructor(
    private serviceService: ServiceService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.fetchServices();
  }

  fetchServices(): void {
    this.loading = true;
    this.error = '';
    this.serviceService.getAll().subscribe({
      next: data => {
        this.services = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los servicios';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  editService(id: number): void {
    this.router.navigate(['/admin/services/edit', id]);
  }

  deleteService(id: number): void {
    if (confirm('¿Seguro que quieres eliminar este servicio?')) {
      this.serviceService.delete(id).subscribe({
        next: () => {
          this.fetchServices();
          alert('Servicio eliminado correctamente');
        },
        error: (err) => {
          alert('Error al eliminar el servicio');
          console.error('Error:', err);
        }
      });
    }
  }

  createService(): void {
    this.router.navigate(['/admin/services/new']);
  }

  back(): void {
    this.router.navigate(['/admin']);
  }

  // --- Manejo de archivos Excel ---
  
  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    
    // Validar límite de 5 archivos total
    if (this.selectedFiles.length + newFiles.length > 5) {
      alert('Solo puedes seleccionar hasta 5 archivos en total.');
      event.target.value = ''; // Limpiar input
      return;
    }

    // Validar extensión
    const invalidFiles = newFiles.filter(f => 
      !f.name.toLowerCase().endsWith('.xls') && 
      !f.name.toLowerCase().endsWith('.xlsx')
    );
    if (invalidFiles.length > 0) {
      alert(`Archivos con formato inválido: ${invalidFiles.map(f => f.name).join(', ')}`);
      event.target.value = '';
      return;
    }

    // Validar tamaño (5 MB por archivo)
    const oversized = newFiles.filter(f => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      alert(`Archivos que superan 5 MB: ${oversized.map(f => f.name).join(', ')}`);
      event.target.value = '';
      return;
    }

    // Validar duplicados
    const duplicates = newFiles.filter(newFile => 
      this.selectedFiles.some(existing => existing.file.name === newFile.name)
    );
    if (duplicates.length > 0) {
      alert(`Archivos ya seleccionados: ${duplicates.map(f => f.name).join(', ')}`);
      event.target.value = '';
      return;
    }

    // Agregar archivos válidos
    newFiles.forEach(file => {
      this.selectedFiles.push({
        file: file,
        id: this.generateId()
      });
    });

    event.target.value = ''; // Limpiar input para permitir reselección
  }

  removeFile(id: string): void {
    this.selectedFiles = this.selectedFiles.filter(item => item.id !== id);
  }

  clearAllFiles(): void {
    this.selectedFiles = [];
    this.uploadResult = null;
    this.progress = 0;
    this.error = '';
  }

  uploadFiles(): void {
    if (this.selectedFiles.length === 0) return;

    this.uploading = true;
    this.progress = 0;
    this.uploadResult = null;
    this.error = '';

    const formData = new FormData();
    this.selectedFiles.forEach(item => {
      formData.append('files', item.file);
    });

    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post<UploadResult>('http://localhost:8000/upload/excel', formData, {
      headers,
      observe: 'events',
      reportProgress: true
    }).subscribe({
      next: event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response) {
          this.uploadResult = event.body;
          this.uploading = false;
          this.progress = 100;
          this.selectedFiles = [];  // Limpiar archivos seleccionados
          this.fetchServices(); // Recargar lista de servicios
          
          // Mostrar mensaje de éxito
          if (this.uploadResult) {
            const { completed, failed } = this.uploadResult.summary;
            if (failed === 0) {
              alert(`✓ Carga completada: ${completed} servicios agregados`);
            } else {
              alert(`Carga finalizada: ${completed} exitosos, ${failed} fallidos`);
            }
          }
        }
      },
      error: err => {
        this.uploading = false;
        this.progress = 0;
        const errorMsg = err.error?.detail || 'Error desconocido al subir archivos';
        this.error = errorMsg;
        alert(`Error: ${errorMsg}`);
        console.error('Error upload:', err);
      }
    });
  }

  getFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getSuccessRate(detail: any): number {
    const total = detail.completed + detail.skipped + detail.failed;
    return total > 0 ? Math.round((detail.completed / total) * 100) : 0;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now();
  }
}