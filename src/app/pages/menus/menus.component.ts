import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { AlertComponent } from '../../shared/components/ui/alert/alert.component';
import { MultiSelectComponent } from '../../shared/components/form/multi-select/multi-select.component';
import { MenusService, Menu } from '../../shared/services/menus.service';
import { MenuGroupsService, MenuGroup } from '../../shared/services/menu-groups.service';
import { RolesService, Role } from '../../shared/services/roles.service';
import { UtilityService } from '../../shared/services/utility.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ApiService } from '../../shared/services/api.service';
import { ApiEndpointsConsts } from '../../shared/constants/api-endpoints.constants';
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
    MultiSelectComponent,
  ],
  templateUrl: './menus.component.html',
  styleUrl: './menus.component.css'
})
export class MenusComponent implements OnInit {

  menus: Menu[] = [];
  menuGroups: MenuGroup[] = [];
  roles: Role[] = [];
  menuRoles: Map<number, Role[]> = new Map(); // Stores roles for each menu by menu_id
  
  // Track data loading state
  isDataLoaded = false;
  loadingErrors: string[] = [];

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
      key: 'role_ids',
      label: 'Roles',
      sortable: false,
      searchable: false,
      type: 'multiselect',
      allOptions: this.roleOptions,
      displayKey: 'role_names'
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
  formMenuGroupId: number | null = null;
  formRoleIds: string[] = [];

  editingMenu: Menu | null = null;
  deletingMenu: Menu | null = null;

  /**
   * Get role options formatted for multi-select component
   */
  get roleOptions() {
    return this.roles.map(role => ({ value: String(role.id), text: role.name }));
  }

  /**
   * Get menu group options formatted for dropdown
   */
  get menuGroupOptions() {
    return this.menuGroups.map(group => ({ value: group.id, text: group.name }));
  }

  constructor(
    private menusService: MenusService,
    private menuGroupsService: MenuGroupsService,
    private rolesService: RolesService,
    public utilityService: UtilityService,
    private notificationService: NotificationService,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    this.loadInitialData();
  }

  /**
   * Load all initial data from APIs
   */
  loadInitialData() {
    this.isDataLoaded = false;
    this.loadingErrors = [];
    
    // Load all data in parallel with error handling
    Promise.all([
      this.loadMenusAsync(),
      this.loadMenuGroupsAsync(),
      this.loadRolesAsync(),
      // this.loadAllMenuRolesAsync()
    ]).then(() => {
      // All data loaded successfully, update column options and map menus
      this.updateColumnOptions();
      this.mapMenusWithRoles();
      this.isDataLoaded = true;
      
      if (this.loadingErrors.length === 0) {
        console.log('Data loaded successfully');
      }
    }).catch((error) => {
      this.notificationService.error('Failed to load some data');
      this.isDataLoaded = true; // Mark as loaded even with errors
    });
  }

  /**
   * Update column options after data is loaded
   */
  updateColumnOptions() {
    const rolesColumnIndex = this.menusColumns.findIndex(col => col.key === 'role_ids');
    if (rolesColumnIndex !== -1) {
      this.menusColumns[rolesColumnIndex].allOptions = this.roleOptions;
    }
  }

  /**
   * Load all menus from API (async version)
   */
  loadMenusAsync(): Promise<void> {
    return new Promise((resolve) => {
      this.menusService.getMenus().subscribe({
        next: (data: Menu[]) => {
          this.menus = data;
          resolve();
        },
        error: (error) => {
          this.loadingErrors.push('Failed to load menus');
          this.notificationService.error('Something went wrong while loading menus');
          resolve(); // Still resolve to allow other data to load
        }
      });
    });
  }

  /**
   * Load all menu groups from API (async version)
   */
  loadMenuGroupsAsync(): Promise<void> {
    return new Promise((resolve) => {
      this.menuGroupsService.getMenuGroups().subscribe({
        next: (data: MenuGroup[]) => {
          this.menuGroups = data;
          resolve();
        },
        error: (error) => {
          this.loadingErrors.push('Failed to load menu groups');
          this.notificationService.error('Something went wrong while loading menu groups');
          resolve();
        }
      });
    });
  }

  /**
   * Load all roles from API (async version)
   */
  loadRolesAsync(): Promise<void> {
    return new Promise((resolve) => {
      this.rolesService.getRoles().subscribe({
        next: (data: Role[]) => {
          this.roles = data;
          resolve();
        },
        error: (error) => {
          this.loadingErrors.push('Failed to load roles');
          this.notificationService.error('Something went wrong while loading roles');
          resolve();
        }
      });
    });
  }

  /**
   * Load all menu-role associations from API (async version)
   */
  loadAllMenuRolesAsync(): Promise<void> {
    return new Promise((resolve) => {
      this.apiService.get(ApiEndpointsConsts.ROLE_MENU, {}, true).subscribe({
        next: (response: any) => {
          this.menuRoles.clear();
          
          if (Array.isArray(response)) {
            response.forEach((item: any) => {
              const menuId = item.menu_id;
              const roleId = item.role_id;
              
              if (menuId && roleId) {
                const role = this.roles.find(r => r.id === roleId);
                
                if (role) {
                  if (!this.menuRoles.has(menuId)) {
                    this.menuRoles.set(menuId, []);
                  }
                  this.menuRoles.get(menuId)!.push(role);
                }
              }
            });
          }
          
          resolve();
        },
        error: (error) => {
          this.loadingErrors.push('Failed to load menu roles');
          // Don't show notification for this as it's not critical
          resolve();
        }
      });
    });
  }

  /**
   * Map menu data with role names - enriches menu objects with role_names property
   */
  mapMenusWithRoles() {
    this.menus = this.menus.map((menu:any) => {
      // const rolesForMenu = this.menuRoles.get(menu.menu_id!) || [];
      // const roleNames = rolesForMenu.length > 0 
      //   ? rolesForMenu.map(role => role.name).join(', ')
      //   : '-';
      // const roleIds = rolesForMenu.map(role => String(role.id));
      
      const roleNames = menu?.roles.map((role:Role) => role.name).join(', ') || '-';
      const roleIds = menu?.roles.map((role:any) => String(role?.role_id)) || [];
      return {
        ...menu,
        role_names: roleNames,
        role_ids: roleIds
      };
    });
    console.log("Menus", this.menus);
  }

 resetForm() {
    this.formName = '';
    this.formPath = '';
    this.formIcon = '';
    this.formStatus = 'active';
    this.formMenuGroupId = null;
    this.formRoleIds = [];
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

    const payload: any = {
      menu_group_id: Number(this.formMenuGroupId),
      name: this.formName.trim(),
      path: this.formPath.trim(),
      icon: this.formIcon.trim(),
      status: this.formStatus,
      role_ids: this.formRoleIds, 
    };

    this.menusService.createMenu(payload).subscribe({
      next: (response) => {
        this.closeAddMenuModal();
        this.notificationService.success('Menu created successfully');
        
        // Reload menus and role associations
        this.loadInitialData();
      },
      error: (error) => {
        this.notificationService.error('Something went wrong while creating menu');
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
    this.formMenuGroupId = menu.menu_group_id;
    
    // Load existing role assignments for this menu
    this.loadMenuRoles(menu.menu_id!);
    
    this.isEditModalOpen = true;
  }

  /**
   * Load existing role assignments for a specific menu
   */
  loadMenuRoles(menuId: number) {
    this.apiService.get(`${ApiEndpointsConsts.ROLE_MENU}/${menuId}`, {}, true).subscribe({
      next: (response: any) => {
        // response should be an array of role objects or { role_id, menu_id } objects
        if (Array.isArray(response)) {
          // If response is array of objects with role_id property
          this.formRoleIds = response.map(item => String(item.role_id || item.id));
          // Role assignments loaded
        } else {
          this.formRoleIds = [];
        }
      },
      error: (error) => {
        this.formRoleIds = [];
      }
    });
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
    this.formMenuGroupId = null;
    this.formRoleIds = [];
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

    const payload: any = {
      menu_group_id: this.formMenuGroupId,
      name: this.formName.trim(),
      path: this.formPath.trim(),
      icon: this.formIcon.trim(),
      status: this.formStatus,
      role_ids: this.formRoleIds,
    };

    this.menusService.updateMenu(String(this.editingMenu.menu_id), payload).subscribe({
      next: (response) => {
        this.closeEditMenuModal();
        this.notificationService.success('Menu updated successfully');
        
        // Reload menus and role associations
        this.loadInitialData();
      },
      error: (error) => {
        this.notificationService.error('Something went wrong while updating menu');
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
        this.closeDeleteModal();
        this.notificationService.success('Menu deleted successfully');
        
        // Reload menus and role associations
        this.loadInitialData();
      },
      error: (error) => {
        this.notificationService.error('Something went wrong while deleting menu');
      }
    });
  }

  /**
   * Assign roles to menu after menu is created/updated
   * @param menuId - The menu ID from API response
   * @param roleIds - Array of selected role IDs
   */
  assignRolesToMenu(menuId: number, roleIds: string[]) {
    if (roleIds.length === 0) {
      return;
    }

    // Call API for each selected role
    roleIds.forEach(roleIdStr => {
      const roleId = Number(roleIdStr);
      const payload = {
        role_id: roleId,
        menu_id: menuId
      };

      this.apiService.post(ApiEndpointsConsts.ROLE_MENU, payload, true).subscribe({
        next: (response) => {
          // Role assignment successful
        },
        error: (error) => {
          this.notificationService.error('Something went wrong while assigning roles');
        }
      });
    });
  }
}
