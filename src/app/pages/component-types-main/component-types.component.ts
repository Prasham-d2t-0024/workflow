import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { ApiService } from '../../shared/services/api.service';
import { UtilityService } from '../../shared/services/utility.service';
import { AlertComponent } from '../../shared/components/ui/alert/alert.component';
import { NotificationService } from '../../shared/services/notification.service';
import { DataTableAction, DataTableColumn, DataTableHeaderConfig } from '../../shared/components/tables/data-table/data-table.models';
import { DatatableComponent } from '../../shared/components/tables/data-table/data-table.component';

interface componentType {
  component_type_id: number;
  name: string;
  createdAt: string;
  publishedAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}
@Component({
  selector: 'app-component-types',
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    ModalComponent,
    AlertComponent,
    DatatableComponent,
  ],
  templateUrl: './component-types.component.html',
    styleUrl: './component-types.component.css'
})

export class ComponentTypesComponent implements OnInit{

  componentTypes:componentType[] = []; 
  
  // DataTable Configuration
  componentTypeColumns: DataTableColumn<any>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      searchable: true,
    },
    {
      key: 'createdAt',
      label: 'Created At',
      type: 'date',
      sortable: false,
    },
    {
      key: 'updatedAt',
      label: 'Updated At',
      type: 'date',
      sortable: false,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'badge',
      badgeMap: {
        active: {
          label: 'Active',
          color: 'bg-success-50 text-success-600',
        },
        inactive: {
          label: 'Inactive',
          color: 'bg-error-50 text-error-600',
        },
      },
    },
  ];
  
  componentTypeActions: DataTableAction<any>[] = [
    {
      icon: 'fa-solid fa-pencil',
      handler: (row) => this.onEdit(row),
    },
    {
      icon: 'fa-solid fa-trash',
      handler: (row) => this.onDelete(row),
    },
  ];

  headerConfig: DataTableHeaderConfig<any> = {
    title: 'Component Types',
    buttons: [
      {
        label: 'Add Component Type',
        icon: 'fas fa-plus'
      }
    ]
  };

  /* ===== COMMENTED OUT - OLD PAGINATION LOGIC ===== */
  // currentPage = 1;
  // itemsPerPage = 5;
  
  // get totalPages(): number {
  //   return Math.ceil(this.componentTypes.length / this.itemsPerPage);
  // }

  // get currentItems(): componentType[] {
  //   const start = (this.currentPage - 1) * this.itemsPerPage;
  //   return this.componentTypes.slice(start, start + this.itemsPerPage);
  // }

  // goToPage(page: number) {
  //   if (page >= 1 && page <= this.totalPages) {
  //     this.currentPage = page;
  //   }
  // }
  /* ===== END COMMENTED OUT ===== */
  
  // Modal state
  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  successModal = false;
  newComponentTypeName = '';
  editingComponentType: componentType | null = null;
  deletingComponentType: componentType | null = null;

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
    });
  }

  mapComponentTypes(data: any[]): componentType[] {
    return data.map(item => ({
      component_type_id: Number(item?.component_type_id) ?? '',
      name: item.name || '',
      createdAt: item.createdAt || '',
      publishedAt: item.publishedAt || '',
      updatedAt: item.updatedAt || '',
      status: item.status || ''
    }));
  }

  /* ===== COMMENTED OUT - OLD PAGINATION METHOD ===== */
  // goToPage(page: number) {
  //   if (page >= 1 && page <= this.totalPages) {
  //     this.currentPage = page;
  //   }
  // }
  /* ===== END COMMENTED OUT ===== */

  /* ===== COMMENTED OUT - OLD BADGE COLOR METHOD (Not needed for new implementation) ===== */
  // getBadgeColor(status: string): 'success' | 'warning' | 'error' {
  //   if (status === 'Success') return 'success';
  //   if (status === 'Pending') return 'warning';
  //   return 'error';
  // }
  /* ===== END COMMENTED OUT ===== */

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
