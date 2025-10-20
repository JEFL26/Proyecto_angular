import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService, Service } from '../../../services/service.service';

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.css']
})
export class ServiceFormComponent implements OnInit {
  service: Service = { name: '', description: '', duration_minutes: 0, price: 0, state: true };
  editMode = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceService: ServiceService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.serviceService.getById(+id).subscribe({
        next: data => this.service = data
      });
    }
  }

  save(): void {
    if (this.editMode) {
      this.serviceService.update(this.service.id_service!, this.service).subscribe({
        next: () => this.router.navigate(['/admin/services'])
      });
    } else {
      this.serviceService.create(this.service).subscribe({
        next: () => this.router.navigate(['/admin/services'])
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/services']);
  }
}

//   <button type="button" (click)="back()">← Volver</button>