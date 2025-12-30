import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { AlertComponent } from '../../shared/components/ui/alert/alert.component';
import { MenusService, Menu } from '../../shared/services/menus.service';
import { UtilityService } from '../../shared/services/utility.service';
import { NotificationService } from '../../shared/services/notification.service';
import { DataTableAction, DataTableColumn, DataTableHeaderConfig } from '../../shared/components/tables/data-table/data-table.models';
import { DatatableComponent } from '../../shared/components/tables/data-table/data-table.component';

@Component({
  selector: 'app-menus',
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    ModalComponent,
    AlertComponent,
    DatatableComponent,
  ],
  templateUrl: './menus.component.html',
  styleUrl: './menus.component.css'
})
export class MenusComponent implements OnInit {

  menus: Menu[] = [];

  /* ===== DATATABLE CONFIGURATION ===== */
  menusColumns: DataTableColumn<any>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      searchable: true,
    },
    {
      key: 'path',
      label: 'Path',
      sortable: false,
      searchable: true,
    },
    {
      key: 'icon',
      label: 'Icon',
      sortable: false,
      type: 'icon',
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

  menusActions: DataTableAction<any>[] = [
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
    title: 'Menus',
    buttons: [
      {
        label: 'Add Menu',
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
  formName = '';
  formPath = '';
  formIcon = '';
  formStatus: 'active' | 'inactive' = 'active';

  editingMenu: Menu | null = null;
  deletingMenu: Menu | null = null;

  constructor(
    private menusService: MenusService,
    public utilityService: UtilityService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.loadMenus();
  }

  /**
   * Load all menus from API
   */
  loadMenus() {
    this.menusService.getMenus().subscribe({
      next: (data: Menu[]) => {
        this.menus = data;
        console.log('Menus:', this.menus);
      },
      error: (error) => {
        console.error('Error loading menus:', error);
        this.notificationService.error('Failed to load menus');
      }
    });
  }

 resetForm() {
    this.formName = '';
    this.formPath = '';
    this.formIcon = '';
    this.formStatus = 'active';
 }

  /**
   * Open Add Menu Modal
   */
  openAddMenuModal() {
    this.isAddModalOpen = true;
    this.resetForm();
  }

  /**
   * Close Add Menu Modal
   */
  closeAddMenuModal() {
    this.isAddModalOpen = false;
    this.resetForm();
  }

  /**
   * Check if Add button should be disabled
   */
  isAddButtonDisabled(): boolean {
    return this.formName.trim() === '' || this.formPath.trim() === '' || this.formIcon.trim() === '';
  }

  /**
   * Add new menu
   */
  addMenu() {
    if (this.isAddButtonDisabled()) return;

    const payload: Menu = {
      menu_group_id: 3,
      name: this.formName.trim(),
      path: this.formPath.trim(),
      icon: this.formIcon.trim(),
      status: this.formStatus,
    };

    this.menusService.createMenu(payload).subscribe({
      next: (response) => {
        console.log('Menu created:', response);
        this.notificationService.success('Menu created successfully');
        this.closeAddMenuModal();
        this.loadMenus();
      },
      error: (error) => {
        console.error('Error creating menu:', error);
        this.notificationService.error('Failed to create menu');
      }
    });
  }

  /**
   * Open Edit Menu Modal
   */
  onEdit(menu: Menu) {
    this.editingMenu = { ...menu };
    this.formName = menu.name;
    this.formPath = menu.path;
    this.formIcon = menu.icon;
    this.formStatus = menu.status;
    this.isEditModalOpen = true;
  }

  /**
   * Close Edit Menu Modal
   */
  closeEditMenuModal() {
    this.isEditModalOpen = false;
    this.editingMenu = null;
    this.formName = '';
    this.formPath = '';
    this.formIcon = '';
    this.formStatus = 'active';
  }

  /**
   * Check if Edit button should be disabled
   */
  isEditButtonDisabled(): boolean {
    return this.formName.trim() === '' || this.formPath.trim() === '' || this.formIcon.trim() === '';
  }

  /**
   * Update existing menu
   */
  updateMenu() {
    if (!this.editingMenu || this.isEditButtonDisabled()) return;

    const payload: Menu = {
      menu_group_id: null,
      name: this.formName.trim(),
      path: this.formPath.trim(),
      icon: this.formIcon.trim(),
      status: this.formStatus,
    };

    this.menusService.updateMenu(String(this.editingMenu.menu_id), payload).subscribe({
      next: (response) => {
        console.log('Menu updated:', response);
        this.notificationService.success('Menu updated successfully');
        this.closeEditMenuModal();
        this.loadMenus();
      },
      error: (error) => {
        console.error('Error updating menu:', error);
        this.notificationService.error('Failed to update menu');
      }
    });
  }

  /**
   * Open Delete Confirmation Modal
   */
  onDelete(menu: Menu) {
    this.deletingMenu = { ...menu };
    this.isDeleteModalOpen = true;
  }

  /**
   * Close edit Confirmation Modal
   */

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editingMenu = null;
  }
  /**
   * Close Delete Confirmation Modal
   */
  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.deletingMenu = null;
  }

  /**
   * Confirm and delete menu
   */
  confirmDelete() {
    if (!this.deletingMenu) return;

    this.menusService.deleteMenu(String(this.deletingMenu.menu_id)).subscribe({
      next: (response) => {
        console.log('Menu deleted:', response);
        this.notificationService.success('Menu deleted successfully');
        this.closeDeleteModal();
        this.loadMenus();
      },
      error: (error) => {
        console.error('Error deleting menu:', error);
        this.notificationService.error('Failed to delete menu');
      }
    });
  }
}
