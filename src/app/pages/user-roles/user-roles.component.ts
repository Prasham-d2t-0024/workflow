import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { AlertComponent } from '../../shared/components/ui/alert/alert.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { RolesService, Role, RoleCreatePayload } from '../../shared/services/roles.service';
import { UtilityService } from '../../shared/services/utility.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-user-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, ModalComponent, AlertComponent, BadgeComponent],
  templateUrl: './user-roles.component.html',
  styleUrl: './user-roles.component.css'
})
export class UserRolesComponent {
  roles: Role[] = [];

  currentPage = 1;
  itemsPerPage = 5;

  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;

  formName = '';
  formDescription = '';
  formStatus: 'active' | 'inactive' = 'active';

  editingRole: Role | null = null;
  deletingRole: Role | null = null;

  constructor(
    private rolesService: RolesService,
    public utilityService: UtilityService,
    public notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadRoles();
  }

  get totalPages(): number {
    return Math.ceil(this.roles.length / this.itemsPerPage);
  }

  get currentItems(): Role[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.roles.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  loadRoles() {
    this.rolesService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (err) => {
        this.notificationService.error('Something went wrong while loading user roles list');
        console.error('Failed to load roles:', err);
      },
    });
  }

  // Add Modal
  openAddRoleModal() {
    this.isAddModalOpen = true;
    this.resetForm();
  }

  closeAddRoleModal() {
    this.isAddModalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.formName = '';
    this.formDescription = '';
    this.formStatus = 'active';
  }

  isAddButtonDisabled(): boolean {
    return this.formName.trim() === '' || this.formDescription.trim() === '';
  }

  onAddItem() {
    if (this.formName.trim() && this.formDescription.trim()) {
      const payload: RoleCreatePayload = {
        name: this.formName.trim().toLowerCase(),
        description: this.formDescription.trim(),
        status: this.formStatus,
      };
      this.rolesService.createRole(payload).subscribe({
        next: () => {
          this.closeAddRoleModal();
          this.loadRoles();
          this.notificationService.success('Role added successfully');
        },
        error: (err) => {
          this.notificationService.error('Something went wrong while adding role');
          console.error('Cant Add Role:', err);
        },
      });
    }
  }

  // Edit
  onEdit(item: Role) {
    this.editingRole = { ...item };
    this.formName = item.name;
    this.formDescription = item.description;
    this.formStatus = item.status;
    this.isEditModalOpen = true;
  }

  closeEditRoleModal() {
    this.isEditModalOpen = false;
    this.editingRole = null;
    this.resetForm();
  }

  isEditButtonDisabled(): boolean {
    return this.formName.trim() === '' || this.formDescription.trim() === '';
  }

  onSaveEdit() {
    if (this.editingRole) {
      // Only id for PUT per instructions
      const payload: RoleCreatePayload = {
        name: this.formName.trim().toLowerCase(),
        description: this.formDescription.trim(),
        status: this.formStatus,
      };
      this.rolesService.updateRole(this.editingRole.id, payload).subscribe({
        next: () => {
          this.closeEditRoleModal();
          this.loadRoles();
          this.notificationService.success('Role updated successfully');
        },
        error: (err) => {
          this.notificationService.error('Something went wrong while editing role');
          console.error('Edit failed:', err);
        },
      });
    }
  }

  // Delete
  onDelete(item: Role) {
    this.deletingRole = item;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.deletingRole = null;
  }

  confirmDelete() {
    if (this.deletingRole) {
      this.rolesService.deleteRole(this.deletingRole.id).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.loadRoles();
          this.notificationService.success('Role Deleted successfully');
        },
        error: (err) => {
          this.notificationService.error('Something went wrong while deleting role');
          console.error('Delete failed:', err);
        },
      });
    }
  }

  getBadgeColor(status: 'active' | 'inactive'): 'success' | 'error' {
    return status === 'active' ? 'success' : 'error';
  }
}
