import { ChangeDetectorRef, Component } from '@angular/core';
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
import { DataTableAction, DataTableColumn, DataTableHeaderConfig } from '../../shared/components/tables/data-table/data-table.models';
import { DatatableComponent } from '../../shared/components/tables/data-table/data-table.component';
import { DropdownManagementService } from '../../shared/services/dropdown-management.service';

@Component({
  selector: 'app-metadata-registry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    ModalComponent,
    AlertComponent,
    SelectComponent,
    BadgeComponent,
    DatatableComponent],
  templateUrl: './metadata-registry.component.html',
  styleUrl: './metadata-registry.component.css'
})
export class MetadataRegistryComponent {

  metadataRegistries: MetadataRegistry[] = []; 
  dropdowns: any[] = []; 
  componentTypes: ComponentType[] = [];
  componentTypeOptions: Option[] = [];
  
  /* ===== DATATABLE CONFIGURATION ===== */
  metadataRegistryColumns: DataTableColumn<any>[] = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      searchable: true,
    },
    {
      key: 'key',
      label: 'Key',
      sortable: true,
      searchable: true,
    },
    {
      key: 'isrequired',
      label: 'Required',
      type: 'badge',
      badgeMap: {
        true: {
          label: 'Yes',
          color: 'bg-success-50 text-success-600',
        },
        false: {
          label: 'No',
          color: 'bg-error-50 text-error-600',
        },
      },
    },
    {
      key: 'ismultiple',
      label: 'Multiple',
      type: 'badge',
      badgeMap: {
        true: {
          label: 'Yes',
          color: 'bg-success-50 text-success-600',
        },
        false: {
          label: 'No',
          color: 'bg-error-50 text-error-600',
        },
      },
    },
    {
      key: 'componentType.name',
      label: 'Component Type',
      sortable: true,
      searchable: true,
    },
    {
      key: 'metadataGroup.name',
      label: 'Metadata Group',
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
  ];

  metadataRegistryActions: DataTableAction<any>[] = [
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
    title: 'Metadata Registry',
    buttons: [
      {
        label: 'Add Metadata',
        icon: 'fas fa-plus'
      }
    ]
  };
  /* ===== END DATATABLE CONFIGURATION ===== */
  
  // Modal state
  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  successModal = false;
  
  // Form fields
  formTitle = '';
  formKey = '';
  formIsRequired = false;
  formIsMultiple = false;
  formComponentType:any = '';
  formDropdown:any = '';
  showDropdownSelection:boolean = true;

  metadataGroups: any[] = [];
  metadataGroupOptions: Option[] = [];
  formMetadataGroup: any = '';
  
  editingMetadataRegistry: MetadataRegistry | null = null;
  deletingMetadataRegistry: MetadataRegistry | null = null;

  /* ===== COMMENTED OUT - OLD PAGINATION GETTERS ===== */
  // get totalPages(): number {
  //   return Math.ceil(this.metadataRegistries.length / this.itemsPerPage);
  // }

  // get currentItems(): MetadataRegistry[] {
  //   const start = (this.currentPage - 1) * this.itemsPerPage;
  //   return this.metadataRegistries.slice(start, start + this.itemsPerPage);
  // }
  /* ===== END COMMENTED OUT ===== */

  constructor(
    private metadataRegistryService: MetadataRegistryService,
    public utilityService: UtilityService,
    public notificationService: NotificationService,
    private dropdownManagementService: DropdownManagementService,
    public cdref: ChangeDetectorRef
  ){}

  ngOnInit() {
    this.loadComponentTypes();
    this.loadMetadataRegistries();
    this.loadDropDowns();
    this.loadMetadataGroups();
  }

  loadComponentTypes() {
    this.metadataRegistryService.getComponentTypes().subscribe({
      next: (data: ComponentType[]) => {
        this.componentTypes = data;
        this.componentTypeOptions = this.metadataRegistryService.convertToOptions(data);
      },
      error: (err) => {
        this.notificationService.error('Something went wrong while loading metadata list');
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
        this.notificationService.error('Something went wrong while loading metadata list');
        console.error('Failed to load metadata registries:', err);
      }
    });
  }
  loadDropDowns(){
    this.dropdownManagementService.getDropdowns().subscribe({
      next: (data: any[]) => {
        this.dropdowns = data;
        this.dropdowns.map((dd)=>{
          dd.value = String(dd.dropdown_id);
          dd.label = dd.name
          return dd;
         })
      },
      error: (err) => {
        this.notificationService.error('Something went wrong while loading Dropdown list');
        console.error('Failed to load Dropdown list:', err);
      }
    })
  }

  loadMetadataGroups() {
    this.metadataRegistryService.getMetadataGroups().subscribe({
      next: (data) => {
        this.metadataGroups = data;
        this.metadataGroupOptions =
          this.metadataRegistryService.convertMetadataGroupsToOptions(data);
      },
      error: (err) => {
        this.notificationService.error(
          'Something went wrong while loading metadata groups'
        );
        console.error(err);
      },
    });
  }


  /* ===== COMMENTED OUT - OLD PAGINATION METHOD ===== */
  // goToPage(page: number) {
  //   if (page >= 1 && page <= this.totalPages) {
  //     this.currentPage = page;
  //   }
  // }
  /* ===== END COMMENTED OUT ===== */

  // Modal functions
  openAddMetadataRegistryModal() {
    this.isAddModalOpen = true;
    this.resetForm();
  }

  closeAddMetadataRegistryModal() {
    this.isAddModalOpen = false;
    this.showDropdownSelection = false;
    this.resetForm();
  }

  resetForm() {
    this.formTitle = '';
    this.formKey = '';
    this.formIsRequired = false;
    this.formIsMultiple = false;
    this.formComponentType = '';
    this.formDropdown = '';
    this.formMetadataGroup = '';
    this.showDropdownSelection = false;
  }

  isAddButtonDisabled(): boolean {
    return (
      this.formTitle.trim() === '' ||
      this.formKey.trim() === '' ||
      this.formComponentType === '' ||
      this.formMetadataGroup === '' 
    );
  }

  onComponentTypeChange(value: string) {
    if(this.componentTypeOptions.find((ct)=> ct.value == value)?.label.toLowerCase() == 'dropdown'){
      this.showDropdownSelection = true;
    }
    this.formComponentType = value;
  }

  onDropdownChange(value:string){
    this.formDropdown = value;
  }

  // Edit functions
  onEdit(item: MetadataRegistry) {
    this.editingMetadataRegistry = { ...item };
    this.formTitle = item.title;
    this.formKey = item.key;
    this.formIsRequired = item.isrequired;
    this.formIsMultiple = item.ismultiple;
    this.formComponentType = String(item.componentType?.component_type_id || '');
    this.formDropdown = String(item?.dropdown?.dropdown_id || '');
    this.formMetadataGroup = String(item?.metadataGroup?.metadata_group_id || '');
    let selectedComponentType = this.componentTypeOptions.find((ct) => ct.value == this.formComponentType);
    if(selectedComponentType?.label.toLowerCase() === 'dropdown'){
      this.showDropdownSelection = true;
      this.cdref.detectChanges();
    }
    this.isEditModalOpen = true;
  }

  closeEditMetadataRegistryModal() {
    this.isEditModalOpen = false;
    this.editingMetadataRegistry = null;
    this.showDropdownSelection = false;
    this.resetForm();
  }

  isEditButtonDisabled(): boolean {
    return this.formTitle.trim() === '' || this.formKey.trim() === '' || this.formComponentType === '';
  }

  onSaveEdit() {
    if (this.editingMetadataRegistry && this.formTitle.trim() && this.formKey.trim() && this.formComponentType) {
      const obj = {
        title: this.formTitle.trim(),
        key: this.formKey.trim(),
        isrequired: this.formIsRequired,
        ismultiple: this.formIsMultiple,
        componenttype_id: Number(this.formComponentType),
        dropdown_id: this.formDropdown ? Number(this.formDropdown) : null,
        metadata_group_id: Number(this.formMetadataGroup)
        // publishedAt: this.editingMetadataRegistry.publishedAt,
      };
      let payload = JSON.stringify(obj);
      
      this.metadataRegistryService.updateMetadataRegistry(this.editingMetadataRegistry.metadata_registry_id, payload).subscribe({
        next: (res) => {
          this.closeEditMetadataRegistryModal();
          this.loadMetadataRegistries();
          this.notificationService.success('Metadata updated successfully');
        },
        error: (err) => {
          this.notificationService.error('Something went wrong while editing metadata');
          console.error('Edit failed:', err);
        }
      });
    }
  }

  onAddItem() {
    if (this.formTitle.trim() && this.formKey.trim() && this.formComponentType) {
      const obj = {
        title:this.formTitle.trim(),
        key: this.formKey.trim(),
        isrequired: this.formIsRequired,
        ismultiple: this.formIsMultiple,
        componenttype_id: Number(this.formComponentType),
        dropdown_id: this.formDropdown ? Number(this.formDropdown) : null,
        metadata_group_id: Number(this.formMetadataGroup)
      };
      // let payload = {"data":obj};
      
      this.metadataRegistryService.createMetadataRegistry(obj).subscribe({
        next: (res) => {
          this.closeAddMetadataRegistryModal();
          this.loadMetadataRegistries();
          this.notificationService.success('Metadata added successfully');
        },
        error: (err) => {
          this.notificationService.error('Something went wrong while adding metadata');
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
          this.notificationService.error('Something went wrong while deleting metadata');
          console.error('Delete failed:', err);
        }
      });
    }
  }

  onRowOrderChange(event: any) {
    if (!event) return;

    const {
      previousIndex,
      currentIndex,
      movedItem,
      replacedItem,
      updatedData,
    } = event;

    // 🔹 Build payload ONLY for affected rows (both indexes)
    const items: {
      metadata_registry_id: number;
      metadataOrder: number;
    }[] = [];

    // Moved item → new position
    items.push({
      metadata_registry_id: movedItem.metadata_registry_id,
      metadataOrder: currentIndex + 1,
    });

    // Replaced item → old position (if exists)
    if (replacedItem) {
      items.push({
        metadata_registry_id: replacedItem.metadata_registry_id,
        metadataOrder: previousIndex + 1,
      });
    }

    this.metadataRegistryService.reorderMetadata({ items }).subscribe({
      next: () => {
        this.notificationService.success('Metadata moved successfully');
      },
      error: (err) => {
        this.notificationService.error('Failed to move metadata');
      },
    });
}


}
