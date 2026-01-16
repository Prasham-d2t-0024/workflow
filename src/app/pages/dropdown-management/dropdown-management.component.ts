import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatatableComponent } from '../../shared/components/tables/data-table/data-table.component';
import {
  DataTableColumn,
  DataTableAction,
  DataTableHeaderConfig,
} from '../../shared/components/tables/data-table/data-table.models';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { NotificationService } from '../../shared/services/notification.service';
import { ApiService } from '../../shared/services/api.service';
import { ApiEndpointsConsts } from '../../shared/constants/api-endpoints.constants';
import { DropdownManagementService } from '../../shared/services/dropdown-management.service';

@Component({
  selector: 'app-dropdown-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatatableComponent,
    ModalComponent,
    ButtonComponent,
  ],
  templateUrl: './dropdown-management.component.html',
})

export class DropdownManagementComponent implements OnInit {
  dropdowns: any[] = [];
  codeError = false;
  codeErrorMessage = '';


  columns: DataTableColumn<any>[] = [
    { key: 'name', label: 'Name', sortable: true, searchable: true },
    { key: 'code', label: 'Code', sortable: true, searchable: true },
    {
      key: 'options',
      label: 'Options',
      sortable: false,
      searchable: false,
      type: 'dropdown',
    },
    {
      key: 'createdAt',
      label: 'Created At',
      type: 'date',
      sortable: false,
    },
    // {
    //   key: 'Active',
    //   label: 'Active',
    //   type: 'badge',
    //   badgeMap: {
    //     active: {
    //       label: 'Active',
    //       color: 'bg-success-50 text-success-600',
    //     },
    //     inactive: {
    //       label: 'Inactive',
    //       color: 'bg-error-50 text-error-600',
    //     },
    //   },
    // },
     {
      key: 'updatedAt',
      label: 'Updated At',
      sortable: false,
      type: 'date',
    }
  ];

  actions: DataTableAction<any>[] = [
    { icon: 'fa-solid fa-pencil', handler: (row) => this.onEdit(row) },
    { icon: 'fa-solid fa-trash', handler: (row) => this.onDelete(row) },
  ];

  headerConfig: DataTableHeaderConfig<any> = {
    title: 'Dropdown Management',
    buttons: [{ label: 'Add Dropdown', icon: 'fas fa-plus' }],
  };

  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;

  formName = '';
  formCode = '';
  formStatus: 'active' | 'inactive' = 'active';


  options: Array<{
    label: string;
    is_active: boolean;
    duplicate?: boolean;
    isDeletedByUser?:boolean
  }> = [];

  optionDuplicateError = false;

  editingDropdown: any = null;
  deletingDropdown: any = null;

  constructor(
    private dropdownManagementService: DropdownManagementService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.loadDropdowns();
  }

  loadDropdowns() {
    this.dropdownManagementService.getDropdowns().subscribe({
      next: (res: any[]) => (this.dropdowns = res),
      error: () => this.notificationService.error('Failed to load dropdowns'),
    });
  }

  normalizeValue(label: string): string {
    return label.trim().toLowerCase().replace(/ /g, '_');
  }

  onLabelChange() {
    const seen = new Set<string>();
    this.optionDuplicateError = false;

    this.options.forEach(opt => {
      const value = this.normalizeValue(opt.label || '');
      opt.duplicate = false;

      if (value && seen.has(value)) {
        opt.duplicate = true;
        this.optionDuplicateError = true;
      }

      if (value) {
        seen.add(value);
      }
    });
  }

  isSaveDisabled(): boolean {
    return (
      !this.formName.trim() ||
      !this.formCode.trim() ||
      this.options.length === 0 ||
      this.optionDuplicateError ||
      this.codeError
    );
  }

  resetForm() {
    this.formName = '';
    this.formCode = '';
    this.formStatus = 'active'
    this.options = [];
    this.optionDuplicateError = false;
    this.codeError = false;
    this.codeErrorMessage = '';
  }

  openAddModal() {
    this.resetForm();
    this.isAddModalOpen = true;
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    this.resetForm();
  }

  addOption() {
    this.options.push({ label: '', is_active: true });
  }

  removeOption(index: number) {
    this.options[index].isDeletedByUser = true;
    this.onLabelChange();
  }

  saveDropdown() {
    if (this.isSaveDisabled()) return;

    const payload = {
      name: this.formName.trim(),
      code: this.formCode.trim(),
      // is_active: this.formStatus == 'active' ? true : false,
      options: this.options.map(o => ({
        label: o.label,
        value: this.normalizeValue(o.label),
        is_active: o.is_active,
      })),
    };

    this.dropdownManagementService.createDropdown(payload).subscribe({
      next: () => {
        this.notificationService.success('Dropdown created');
        this.closeAddModal();
        this.loadDropdowns();
      },
      error: () =>
        this.notificationService.error('Failed to create dropdown'),
    });
  }

  onEdit(row: any) {
    this.editingDropdown = row;
    this.formName = row.name;
    this.formCode = row.code;
    // this.formStatus = row.is_active;
    this.options = row.options.map((o: any) => ({
      label: o.label,
      is_active: o.is_active,
    }));
    this.onLabelChange();
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editingDropdown = null;
    this.resetForm();
  }

  updateDropdown() {
    if (this.isSaveDisabled()) return;

    const payload = {
      name: this.formName.trim(),
      code:this.formCode.trim(),
      // is_active: this.formStatus == 'active' ? true : false,
      options: this.options.map(o => ({
        label: o.label,
        value: this.normalizeValue(o.label),
        is_active: o.is_active,
        isDeletedByUser : o.isDeletedByUser
      })),
    };

      this.dropdownManagementService.updateDropdown(this.editingDropdown.dropdown_id,payload)
      .subscribe({
        next: () => {
          this.notificationService.success('Dropdown updated');
          this.closeEditModal();
          this.loadDropdowns();
        },
        error: () =>
          this.notificationService.error('Failed to update dropdown'),
      });
  }

  onDelete(row: any) {
    this.deletingDropdown = row;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.deletingDropdown = null;
  }

  confirmDelete() {
      this.dropdownManagementService.deleteDropdown(this.deletingDropdown.dropdown_id)
      .subscribe({
        next: () => {
          this.notificationService.success('Dropdown deleted');
          this.closeDeleteModal();
          this.loadDropdowns();
        },
        error: () =>
          this.notificationService.error('Failed to delete dropdown'),
      });
  }

  onCodeChange() {
    this.codeError = false;
    this.codeErrorMessage = '';

    const value = this.formCode || '';

    // Space check
    if (/\s/.test(value)) {
      this.codeError = true;
      this.codeErrorMessage = 'Spaces are not allowed in code';
      return;
    }

    // Uppercase check
    if (value !== value.toLowerCase()) {
      this.codeError = true;
      this.codeErrorMessage = 'Only lowercase letters are allowed';
      return;
    }

    // Hyphen check (ENFORCE underscore)
    if (value.includes('-')) {
      this.codeError = true;
      this.codeErrorMessage = 'Use "_" (underscore) instead of "-"';
      return;
    }

    // Duplicate check (case-insensitive)
    const duplicate = this.dropdowns.some(d =>
      d.code?.toLowerCase() === value.toLowerCase()
    );

    if (duplicate) {
      this.codeError = true;
      this.codeErrorMessage = 'Code already exists';
    }
  }

}
