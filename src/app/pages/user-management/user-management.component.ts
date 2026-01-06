import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { AlertComponent } from '../../shared/components/ui/alert/alert.component';
import { MultiSelectComponent } from '../../shared/components/form/multi-select/multi-select.component';
import { UsersService, User, UserCreatePayload, UserUpdatePayload, UserRole, UserMenu } from '../../shared/services/users.service';
import { RolesService, Role } from '../../shared/services/roles.service';
import { MenusService, Menu } from '../../shared/services/menus.service';
import { UtilityService } from '../../shared/services/utility.service';
import { NotificationService } from '../../shared/services/notification.service';
import { DataTableAction, DataTableColumn, DataTableHeaderConfig } from '../../shared/components/tables/data-table/data-table.models';
import { DatatableComponent } from '../../shared/components/tables/data-table/data-table.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, ModalComponent, AlertComponent, DatatableComponent, MultiSelectComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {

  users: User[] = [];
  roles: Role[] = [];
  menus: Menu[] = [];

  // Track data loading state
  isDataLoaded = false;
  loadingErrors: string[] = [];

  /* ===== DATATABLE CONFIGURATION ===== */
  usersColumns: DataTableColumn<any>[] = [
    {
      key: 'full_name',
      label: 'Full Name',
      sortable: true,
      searchable: true,
    },
    {
      key: 'username',
      label: 'Username',
      sortable: true,
      searchable: true,
    },
    // {
    //   key: 'createdAt',
    //   label: 'Created At',
    //   sortable: false,
    //   type: 'date',
    // },
    {
      key: 'updatedAt',
      label: 'Updated At',
      sortable: false,
      type: 'date',
    },
    {
      key: 'roles',
      label: 'Roles',
      type:'multiselect',
      sortable: false,
      searchable: false,
      allOptions: this.roleOptions,
      displayKey: 'role_names'
    },
    {
      key: 'menus',
      label: 'Menus',
      type:'multiselect',
      sortable: false,
      searchable: false,
      allOptions: this.menuOptions,
      displayKey: 'menu_names'
    },
  ];

  usersActions: DataTableAction<any>[] = [
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
    title: 'User Management',
    buttons: [
      {
        label: 'Add User',
        icon: 'fas fa-plus'
      }
    ]
  };
  /* ===== END DATATABLE CONFIGURATION ===== */

  // Modal state
  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;

  // Form fields
  formFullName = '';
  formUsername = '';
  formPassword = '';
  formUserTypeId: number | null = null;
  formRoleIds: string[] = [];
  formMenuIds: string[] = [];

  editingUser: User | null = null;
  deletingUser: User | null = null;

  /**
   * Get role options formatted for multi-select component
   */
  get roleOptions() {
    return this.roles.map(role => ({ value: String(role.id), text: role.name }));
  }

  /**
   * Get menu options formatted for multi-select component
   */
  get menuOptions() {
    return this.menus.map(menu => ({ value: String(menu.menu_id), text: menu.name }));
  }

  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
    private menusService: MenusService,
    public utilityService: UtilityService,
    private notificationService: NotificationService
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
      this.loadUsersAsync(),
      this.loadRolesAsync(),
      this.loadMenusAsync()
    ]).then(() => {
      // All data loaded successfully, update column options and map users
      this.updateColumnOptions();
      this.mapUsersWithRolesAndMenus();
      this.isDataLoaded = true;
      
      if (this.loadingErrors.length === 0) {
        console.log('Data loaded successfully');
        console.log("----------------->",this.roleOptions, this.menuOptions, this.users)
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
    const rolesColumnIndex = this.usersColumns.findIndex(col => col.key === 'roles');
    const menusColumnIndex = this.usersColumns.findIndex(col => col.key === 'menus');
    
    if (rolesColumnIndex !== -1) {
      this.usersColumns[rolesColumnIndex].allOptions = this.roleOptions;
    }
    if (menusColumnIndex !== -1) {
      this.usersColumns[menusColumnIndex].allOptions = this.menuOptions;
    }
  }

  /**
   * Load all users from API (async version)
   */
  loadUsersAsync(): Promise<void> {
    return new Promise((resolve) => {
      this.usersService.getUsers().subscribe({
        next: (data: User[]) => {
          this.users = data;
          resolve();
        },
        error: (error) => {
          this.loadingErrors.push('Failed to load users');
          this.notificationService.error('Something went wrong while loading users');
          resolve(); // Still resolve to allow other data to load
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
          resolve();
        }
      });
    });
  }

  /**
   * Map users data with role and menu information
   */
  mapUsersWithRolesAndMenus() {
    this.users = this.users.map(user => {
      // Extract role IDs and names from the roles array
      const roleIds = user.roles && Array.isArray(user.roles) && user.roles.length > 0
        ? (user.roles as UserRole[]).map(role => String(role.role_id))
        : [];
      
      const roleNames = user.roles && Array.isArray(user.roles) && user.roles.length > 0
        ? (user.roles as UserRole[]).map(role => role.name).join(', ')
        : 'N.A';
      
      // Extract menu IDs and names from the menus array
      const menuIds = user.menus && Array.isArray(user.menus) && user.menus.length > 0
        ? (user.menus as UserMenu[]).map(menu => String(menu.menu_id))
        : [];
      
      const menuNames = user.menus && Array.isArray(user.menus) && user.menus.length > 0
        ? (user.menus as UserMenu[]).map(menu => menu.name).join(', ')
        : 'N.A';

      return {
        ...user,
        roles: roleIds,  // Store role IDs for multi-select
        menus: menuIds,  // Store menu IDs for multi-select
        role_names: roleNames,  // Store display text
        menu_names: menuNames   // Store display text
      };
    });
  }

  resetForm() {
    this.formFullName = '';
    this.formUsername = '';
    this.formPassword = '';
    this.formUserTypeId = null;
    this.formRoleIds = [];
    this.formMenuIds = [];
  }

  /**
   * Open Add User Modal
   */
  openAddUserModal() {
    this.isAddModalOpen = true;
    this.resetForm();
  }

  /**
   * Close Add User Modal
   */
  closeAddUserModal() {
    this.isAddModalOpen = false;
    this.resetForm();
  }

  /**
   * Check if Add button should be disabled
   */
  isAddButtonDisabled(): boolean {
    return this.formFullName.trim() === '' || 
           this.formUsername.trim() === '' || 
           this.formPassword.trim() === ''
          //  this.formUserTypeId === null;
  }

  /**
   * Add new user
   */
  addUser() {
    if (this.isAddButtonDisabled()) return;

    const payload: UserCreatePayload = {
      full_name: this.formFullName.trim(),
      username: this.formUsername.trim(),
      password: this.formPassword.trim(),
      // user_type_id: this.formUserTypeId!,
      role_ids: this.formRoleIds.map(id => Number(id)),
      menu_ids: this.formMenuIds.map(id => Number(id)),
    };

    this.usersService.createUser(payload).subscribe({
      next: (response) => {
        this.closeAddUserModal();
        this.notificationService.success('User created successfully');
        
        // Reload users
        this.loadInitialData();
      },
      error: (error) => {
        this.notificationService.error('Something went wrong while creating user');
      }
    });
  }

  /**
   * Open Edit User Modal
   */
  onEdit(user: User) {
    this.editingUser = { ...user };
    this.formFullName = user.full_name;
    this.formUsername = user.username;
    this.formPassword = ''; // Don't pre-fill password
    this.formUserTypeId = user.user_type_id;
    
    // Extract role IDs - after mapping they are stored as string array in roles
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      // Check if roles contains strings (mapped data) or role objects (raw data)
      if (typeof user.roles[0] === 'string') {
        this.formRoleIds = user.roles as string[];
      } else if (typeof user.roles[0] === 'object' && 'role_id' in user.roles[0]) {
        // Raw API data with role objects
        this.formRoleIds = (user.roles as UserRole[]).map(role => String(role.role_id));
      }
    } else if (user.role_ids && user.role_ids.length > 0) {
      this.formRoleIds = user.role_ids.map(id => String(id));
    } else {
      this.formRoleIds = [];
    }

    // Extract menu IDs - after mapping they are stored as string array in menus
    if (user.menus && Array.isArray(user.menus) && user.menus.length > 0) {
      // Check if menus contains strings (mapped data) or menu objects (raw data)
      if (typeof user.menus[0] === 'string') {
        this.formMenuIds = user.menus as string[];
      } else if (typeof user.menus[0] === 'object' && 'menu_id' in user.menus[0]) {
        // Raw API data with menu objects
        this.formMenuIds = (user.menus as UserMenu[]).map(menu => String(menu.menu_id));
      }
    } else if (user.menu_ids && user.menu_ids.length > 0) {
      this.formMenuIds = user.menu_ids.map(id => String(id));
    } else {
      this.formMenuIds = [];
    }
    
    this.isEditModalOpen = true;
  }

  /**
   * Close Edit User Modal
   */
  closeEditUserModal() {
    this.isEditModalOpen = false;
    this.editingUser = null;
    this.resetForm();
  }

  /**
   * Check if Edit button should be disabled
   */
  isEditButtonDisabled(): boolean {
    return this.formFullName.trim() === '' || 
           this.formUsername.trim() === '' || 
           this.formUserTypeId === null;
  }

  /**
   * Update existing user
   */
  updateUser() {
    if (!this.editingUser || this.isEditButtonDisabled()) return;

    const payload: UserUpdatePayload = {
      full_name: this.formFullName.trim(),
      username: this.formUsername.trim(),
      user_type_id: this.formUserTypeId!,
      role_ids: this.formRoleIds.map(id => Number(id)),
      menu_ids: this.formMenuIds.map(id => Number(id)),
    };

    // Only include password if provided
    if (this.formPassword.trim()) {
      payload.password = this.formPassword.trim();
    }

    this.usersService.updateUser(String(this.editingUser.user_id), payload).subscribe({
      next: (response) => {
        this.closeEditUserModal();
        this.notificationService.success('User updated successfully');
        
        // Reload users
        this.loadInitialData();
      },
      error: (error) => {
        this.notificationService.error('Something went wrong while updating user');
      }
    });
  }

  /**
   * Open Delete Confirmation Modal
   */
  onDelete(user: User) {
    this.deletingUser = { ...user };
    this.isDeleteModalOpen = true;
  }

  /**
   * Close Edit Modal
   */
  closeEditModal() {
    this.isEditModalOpen = false;
    this.editingUser = null;
  }

  /**
   * Close Delete Confirmation Modal
   */
  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.deletingUser = null;
  }

  /**
   * Confirm and delete user
   */
  confirmDelete() {
    if (!this.deletingUser) return;

    this.usersService.deleteUser(String(this.deletingUser.user_id)).subscribe({
      next: (response) => {
        this.closeDeleteModal();
        this.notificationService.success('User deleted successfully');
        
        // Reload users
        this.loadInitialData();
      },
      error: (error) => {
        this.notificationService.error('Something went wrong while deleting user');
      }
    });
  }
}
