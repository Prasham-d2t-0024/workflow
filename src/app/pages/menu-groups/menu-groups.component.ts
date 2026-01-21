import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { AlertComponent } from '../../shared/components/ui/alert/alert.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { MenuGroupsService, MenuGroup, MenuGroupPayload } from '../../shared/services/menu-groups.service';
import { NotificationService } from '../../shared/services/notification.service';
import { DataTableAction, DataTableColumn, DataTableHeaderConfig } from '../../shared/components/tables/data-table/data-table.models';
import { DatatableComponent } from '../../shared/components/tables/data-table/data-table.component';

@Component({
  selector: 'app-menu-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, ModalComponent, AlertComponent, BadgeComponent, DatatableComponent],
  templateUrl: './menu-groups.component.html',
  styleUrl: './menu-groups.component.css'
})
export class MenuGroupsComponent {
  groups: MenuGroup[] = [];

  menuGroupsColumns: DataTableColumn<any>[] = [
    { key: 'name', label: 'Name', sortable: true, searchable: true },
    { key: 'icon', label: 'Icon', sortable: false, type: 'icon' },
    { key: 'order', label: 'Order', sortable: true, searchable: false },
    { key: 'status', label: 'Status', type: 'badge', badgeMap: { active: {label: 'Active', color: 'bg-success-50 text-success-600'}, inactive: {label: 'Inactive', color: 'bg-error-50 text-error-600'} } }
  ];

  menuGroupsActions: DataTableAction<any>[] = [
    { icon: 'fa-solid fa-pencil', handler: (row: any) => this.onEdit(row) },
    { icon: 'fa-solid fa-trash', handler: (row: any) => this.onDelete(row) }
  ];

  headerConfig: DataTableHeaderConfig<any> = {
    title: 'Menu Groups',
    buttons : [
      {
        label:'Add Group',
        icon:'fas fa-plus'
      }
    ]
  };

  /* ===== COMMENTED OUT - OLD PAGINATION PROPERTIES ===== */
  // currentPage = 1;
  // itemsPerPage = 5;

  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;

  openAddMenuGroupModal() {
    this.openAddModal();
  }

  formName = '';
  formOrder: number | null = null;
  formIcon = '';
  formStatus: 'active' | 'inactive' = 'active';

  editing: MenuGroup | null = null;
  deleting: MenuGroup | null = null;

  constructor(private service: MenuGroupsService, public notificationService: NotificationService) {}

  ngOnInit() {
    this.load();
  }

  /* ===== COMMENTED OUT - OLD PAGINATION METHODS ===== */
  // get totalPages(): number {
  //   return Math.ceil(this.groups.length / this.itemsPerPage);
  // }

  // get currentItems(): MenuGroup[] {
  //   const start = (this.currentPage - 1) * this.itemsPerPage;
  //   return this.groups.slice(start, start + this.itemsPerPage);
  // }

  // goToPage(page: number) {
  //   if (page >= 1 && page <= this.totalPages) {
  //     this.currentPage = page;
  //   }
  // }
  /* ===== END COMMENTED OUT ===== */

  getBadgeColor(status: 'active' | 'inactive'): 'success' | 'error' {
    return status === 'active' ? 'success' : 'error';
  }

  /* ===== COMMENTED OUT - OLD BADGE COLOR METHOD (now using DataTable badgeMap) ===== */
  /* ===== END COMMENTED OUT ===== */

  load() {
    this.service.getMenuGroups().subscribe({
      next: (data) => {
        this.groups = data;
      },
      error: (err) => {
        this.notificationService.error('Soemthing went wrong while loading menu group list');
        console.error('Failed to load menu groups:', err);
      },
    });
  }

  // Add
  openAddModal() {
    this.isAddModalOpen = true;
    this.resetForm();
  }
  closeAddModal() {
    this.isAddModalOpen = false;
    this.resetForm();
  }
  isAddButtonDisabled(): boolean {
    return this.formName.trim() === '' || this.formOrder === null;
  }
  resetForm() {
    this.formName = '';
    this.formOrder = null;
    this.formIcon = '';
    this.formStatus = 'active';
  }
  onAddItem() {
    if (!this.isAddButtonDisabled()) {
      const payload: MenuGroupPayload = {
        name: this.formName.trim(),
        order: Number(this.formOrder),
        icon: this.formIcon.trim() || undefined,
        status: this.formStatus,
      };
      this.service.createMenuGroup(payload).subscribe({
        next: () => {
          this.closeAddModal();
          this.load();
          this.notificationService.success('Menu group added successfully');
        },
        error: (err) => {
          this.notificationService.error('Soemthing went wrong while adding menu group');
          console.error('Cant Add Menu Group:', err);
        },
      });
    }
  }

  // Edit
  onEdit(item: MenuGroup) {
    this.editing = { ...item };
    this.formName = item.name;
    this.formOrder = item.order;
    this.formIcon = item.icon || '';
    this.formStatus = item.status;
    this.isEditModalOpen = true;
  }
  closeEditModal() {
    this.isEditModalOpen = false;
    this.editing = null;
    this.resetForm();
  }
  isEditButtonDisabled(): boolean {
    return this.formName.trim() === '' || this.formOrder === null;
  }
  onSaveEdit() {
    if (this.editing && !this.isEditButtonDisabled()) {
      const payload: MenuGroupPayload = {
        name: this.formName.trim(),
        order: Number(this.formOrder),
        icon: this.formIcon.trim() || undefined,
        status: this.formStatus,
      };
      this.service.updateMenuGroup(this.editing.id, payload).subscribe({
        next: () => {
          this.closeEditModal();
          this.load();
          this.notificationService.success('Menu group edited successfully');
        },
        error: (err) => {
          this.notificationService.error('Soemthing went wrong while editing menu group');
          console.error('Edit failed:', err);
        },
      });
    }
  }

  // Delete
  onDelete(item: MenuGroup) {
    this.deleting = item;
    this.isDeleteModalOpen = true;
  }
  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.deleting = null;
  }
  confirmDelete() {
    if (this.deleting) {
      this.service.deleteMenuGroup(this.deleting.id).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.load();
          this.notificationService.success('Menu group deleted successfully');
        },
        error: (err) => {
          this.notificationService.error('Soemthing went wrong while deleting menu group');
          console.error('Delete failed:', err);
        },
      });
    }
  }
}
