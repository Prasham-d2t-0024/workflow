import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { ApiService } from '../../shared/services/api.service';
import { UtilityService } from '../../shared/services/utility.service';
import { AlertComponent } from '../../shared/components/ui/alert/alert.component';

interface componentType {
  id: string;
  name: string;
  createdAt: string;
  publishedAt: string;
  updatedAt: string;
  documentId: string;
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
    public utilityService: UtilityService
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
      id: item.id || item._id || '',
      name: item.name || '',
      createdAt: item.createdAt || '',
      publishedAt: item.publishedAt || '',
      updatedAt: item.updatedAt || '',
      documentId: item.documentId || ''
    }));
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  handleViewMore(item: componentType) {
    // logic here
    console.log('View More:', item);
  }

  handleDelete(item: componentType) {
    // logic here
    console.log('Delete:', item);
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
      this.apiService.put(`/componenttypes/${this.editingComponentType.id}`, 
        { name: this.newComponentTypeName.trim() }, 
        true
      ).subscribe({
        next: (res) => {
          console.log('Edit successful:', res);
          this.closeEditComponentTypeModal();
          this.loadComponentTypes();
        },
        error: (err) => {
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
          console.log('Added Item successful:', res);
          this.closeAddComponentTypeModal();
          this.loadComponentTypes();
        },
        error: (err) => {
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
      this.apiService.delete(`/componenttypes/${this.deletingComponentType.id}`, true).subscribe({
        next: (res) => {
          console.log('Delete successful:', res);
          this.closeDeleteModal();
          this.loadComponentTypes();
        },
        error: (err) => {
          console.error('Delete failed:', err);
        }
      });
    }
  }
}
