import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { ApiService } from '../../shared/services/api.service';
import { UtilityService } from '../../shared/services/utility.service';
import { AlertComponent } from '../../shared/components/ui/alert/alert.component';
import { NotificationService } from '../../shared/services/notification.service';

interface componentType {
  component_type_id: number;
  name: string;
  createdAt: string;
  publishedAt: string;
  updatedAt: string;
}
@Component({
  selector: 'app-component-types',
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    ModalComponent,
    AlertComponent,
  ],
  templateUrl: './component-types.component.html',
    styleUrl: './component-types.component.css'
})

export class ComponentTypesComponent implements OnInit{

  componentTypes:componentType[] = []; 
  currentPage = 1;
  itemsPerPage = 5;
  
  // Modal state
  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  successModal = false;
  newComponentTypeName = '';
  editingComponentType: componentType | null = null;
  deletingComponentType: componentType | null = null;

  get totalPages(): number {
    return Math.ceil(this.componentTypes.length / this.itemsPerPage);
  }

  get currentItems(): componentType[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.componentTypes.slice(start, start + this.itemsPerPage);
  }

  constructor(
    private apiService:ApiService,
    public utilityService: UtilityService,
    private notificationService: NotificationService
  ){}

  ngOnInit() {
    this.loadComponentTypes();
  }

  loadComponentTypes() {
    this.apiService.get('/componenttypes',{}, true).subscribe((data: any) => {
      this.componentTypes = this.mapComponentTypes(data);
      console.log('Component Types:', this.componentTypes);
    });
  }

  mapComponentTypes(data: any[]): componentType[] {
    return data.map(item => ({
      component_type_id: Number(item?.component_type_id) ?? '',
      name: item.name || '',
      createdAt: item.createdAt || '',
      publishedAt: item.publishedAt || '',
      updatedAt: item.updatedAt || '',
    }));
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getBadgeColor(status: string): 'success' | 'warning' | 'error' {
    if (status === 'Success') return 'success';
    if (status === 'Pending') return 'warning';
    return 'error';
  }

  // Modal functions
  openAddComponentTypeModal() {
    this.isAddModalOpen = true;
    this.newComponentTypeName = '';
  }

  closeAddComponentTypeModal() {
    this.isAddModalOpen = false;
    this.newComponentTypeName = '';
  }

  isAddButtonDisabled(): boolean {
    return this.newComponentTypeName.trim() === '';
  }

  // Edit functions
  onEdit(item: componentType) {
    this.editingComponentType = { ...item };
    this.newComponentTypeName = item.name;
    this.isEditModalOpen = true;
  }

  closeEditComponentTypeModal() {
    this.isEditModalOpen = false;
    this.editingComponentType = null;
    this.newComponentTypeName = '';
  }

  isEditButtonDisabled(): boolean {
    return this.newComponentTypeName.trim() === '';
  }

  onSaveEdit() {
    if (this.editingComponentType && this.newComponentTypeName.trim()) {
      this.apiService.put(`/componenttypes/${this.editingComponentType.component_type_id}`, 
        { name: this.newComponentTypeName.trim() }, 
        true
      ).subscribe({
        next: (res) => {
          console.log('Edit successful:', res);
          this.closeEditComponentTypeModal();
          this.loadComponentTypes();
          this.notificationService.success('Component Type updated successfully');
        },
        error: (err) => {
          this.notificationService.error('Something went wrong while editing component type');
          console.error('Edit failed:', err);
        }
      });
    }
  }
  onAddItem() {
    if (this.newComponentTypeName.trim()) {
      this.apiService.post(`/componenttypes`, 
        { name: this.newComponentTypeName.trim() }, 
        true
      ).subscribe({
        next: (res) => {
          this.closeAddComponentTypeModal();
          this.loadComponentTypes();
          this.notificationService.success('Component Type added successfully');
        },
        error: (err) => {
          this.notificationService.error('Something went wrong while adding component type');
          console.error('Cant Add Item:', err);
        }
      });
    }
  }

  // Delete functions
  onDelete(item: componentType) {
    this.deletingComponentType = item;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.deletingComponentType = null;
  }

  confirmDelete() {
    if (this.deletingComponentType) {
      this.apiService.delete(`/componenttypes/${this.deletingComponentType.component_type_id}`, true).subscribe({
        next: (res) => {
          this.closeDeleteModal();
          this.loadComponentTypes();
          this.notificationService.success('Component Type Deleted successfully');
        },
        error: (err) => {
          this.notificationService.error('Something went wrong while deleting component type');
          console.error('Delete failed:', err);
        }
      });
    }
  }
}
