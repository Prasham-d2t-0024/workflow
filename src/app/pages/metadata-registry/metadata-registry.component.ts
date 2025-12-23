import { Component } from '@angular/core';
import { UtilityService } from '../../shared/services/utility.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { AlertComponent } from '../../shared/components/ui/alert/alert.component';
import { SelectComponent, Option } from '../../shared/components/form/select/select.component';
import { MetadataRegistryService, MetadataRegistry } from '../../shared/services/metadata-registry.service';
import { ComponentType } from '../../shared/services/component-type.service';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-metadata-registry',
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    ModalComponent,
    AlertComponent,
    SelectComponent,
    BadgeComponent],
  templateUrl: './metadata-registry.component.html',
  styleUrl: './metadata-registry.component.css'
})
export class MetadataRegistryComponent {

  metadataRegistries: MetadataRegistry[] = []; 
  componentTypes: ComponentType[] = [];
  componentTypeOptions: Option[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  
  // Modal state
  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  successModal = false;
  
  // Form fields
  formTitle = '';
  formIsRequired = false;
  formIsMultiple = false;
  formComponentType:any = '';
  
  editingMetadataRegistry: MetadataRegistry | null = null;
  deletingMetadataRegistry: MetadataRegistry | null = null;

  get totalPages(): number {
    return Math.ceil(this.metadataRegistries.length / this.itemsPerPage);
  }

  get currentItems(): MetadataRegistry[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.metadataRegistries.slice(start, start + this.itemsPerPage);
  }

  constructor(
    private metadataRegistryService: MetadataRegistryService,
    public utilityService: UtilityService,
    public notificationService: NotificationService
  ){}

  ngOnInit() {
    this.loadComponentTypes();
    this.loadMetadataRegistries();
  }

  loadComponentTypes() {
    this.metadataRegistryService.getComponentTypes().subscribe({
      next: (data: ComponentType[]) => {
        this.componentTypes = data;
        this.componentTypeOptions = this.metadataRegistryService.convertToOptions(data);
      },
      error: (err) => {
        this.notificationService.error('Soemthing went wrong while loading metadata list');
        console.error('Failed to load component types:', err);
      }
    });
  }

  loadMetadataRegistries() {
    this.metadataRegistryService.getMetadataRegistries().subscribe({
      next: (data: MetadataRegistry[]) => {
        this.metadataRegistries = data;
      },
      error: (err) => {
        this.notificationService.error('Soemthing went wrong while loading metadata list');
        console.error('Failed to load metadata registries:', err);
      }
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Modal functions
  openAddMetadataRegistryModal() {
    this.isAddModalOpen = true;
    this.resetForm();
  }

  closeAddMetadataRegistryModal() {
    this.isAddModalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.formTitle = '';
    this.formIsRequired = false;
    this.formIsMultiple = false;
    this.formComponentType = '';
  }

  isAddButtonDisabled(): boolean {
    return this.formTitle.trim() === '' || this.formComponentType === '';
  }

  onComponentTypeChange(value: string) {
    this.formComponentType = value;
  }

  // Edit functions
  onEdit(item: MetadataRegistry) {
    this.editingMetadataRegistry = { ...item };
    this.formTitle = item.title;
    this.formIsRequired = item.isrequired;
    this.formIsMultiple = item.ismultiple;
    this.formComponentType = String(item.componentType?.component_type_id || '');
    this.isEditModalOpen = true;
  }

  closeEditMetadataRegistryModal() {
    this.isEditModalOpen = false;
    this.editingMetadataRegistry = null;
    this.resetForm();
  }

  isEditButtonDisabled(): boolean {
    return this.formTitle.trim() === '' || this.formComponentType === '';
  }

  onSaveEdit() {
    if (this.editingMetadataRegistry && this.formTitle.trim() && this.formComponentType) {
      const obj = {
        key: this.formTitle.trim(),
        isrequired: this.formIsRequired,
        ismultiple: this.formIsMultiple,
        componenttype_id: Number(this.formComponentType),
        // publishedAt: this.editingMetadataRegistry.publishedAt,
      };
      let payload = JSON.stringify(obj);
      
      this.metadataRegistryService.updateMetadataRegistry(this.editingMetadataRegistry.metadata_registry_id, payload).subscribe({
        next: (res) => {
          this.closeEditMetadataRegistryModal();
          this.loadMetadataRegistries();
          this.notificationService.success('Metadata edited successfully');
        },
        error: (err) => {
          this.notificationService.error('Soemthing went wrong while editing metadata');
          console.error('Edit failed:', err);
        }
      });
    }
  }

  onAddItem() {
    if (this.formTitle.trim() && this.formComponentType) {
      const obj = {
        key: this.formTitle.trim(),
        isrequired: this.formIsRequired,
        ismultiple: this.formIsMultiple,
        componenttype_id: Number(this.formComponentType)
      };
      // let payload = {"data":obj};
      
      this.metadataRegistryService.createMetadataRegistry(obj).subscribe({
        next: (res) => {
          this.closeAddMetadataRegistryModal();
          this.loadMetadataRegistries();
          this.notificationService.success('Metadata added successfully');
        },
        error: (err) => {
          this.notificationService.error('Soemthing went wrong while adding metadata');
          console.error('Cant Add Item:', err);
        }
      });
    }
  }

  // Delete functions
  onDelete(item: MetadataRegistry) {
    this.deletingMetadataRegistry = item;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.deletingMetadataRegistry = null;
  }

  confirmDelete() {
    if (this.deletingMetadataRegistry) {
      this.metadataRegistryService.deleteMetadataRegistry(this.deletingMetadataRegistry.metadata_registry_id).subscribe({
        next: (res) => {
          this.closeDeleteModal();
          this.loadMetadataRegistries();
          this.notificationService.success('Metadata Deleted successfully');
        },
        error: (err) => {
          this.notificationService.error('Soemthing went wrong while deleting metadata');
          console.error('Delete failed:', err);
        }
      });
    }
  }
}
