import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { AlertComponent } from '../../shared/components/ui/alert/alert.component';
import { ProcessesService, Process, ProcessCreatePayload, ProcessUpdatePayload } from '../../shared/services/processes.service';
import { UtilityService } from '../../shared/services/utility.service';
import { NotificationService } from '../../shared/services/notification.service';
import { DataTableAction, DataTableColumn, DataTableHeaderConfig } from '../../shared/components/tables/data-table/data-table.models';
import { DatatableComponent } from '../../shared/components/tables/data-table/data-table.component';

@Component({
  selector: 'app-processes',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, ModalComponent, AlertComponent, DatatableComponent],
  templateUrl: './processes.component.html',
  styleUrl: './processes.component.css'
})
export class ProcessesComponent implements OnInit {

  processes: Process[] = [];

  /* ===== DATATABLE CONFIGURATION ===== */
  processesColumns: DataTableColumn<any>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      searchable: true,
    },
    {
      key: 'webhook',
      label: 'Webhook',
      sortable: false,
      searchable: true,
    },
    {
      key: 'createdAt',
      label: 'Created At',
      sortable: false,
      type: 'date',
    },
    {
      key: 'updatedAt',
      label: 'Updated At',
      sortable: false,
      type: 'date',
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

  processesActions: DataTableAction<any>[] = [
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
    title: 'Processes',
    buttons: [
      {
        label: 'Add Process',
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
  formName = '';
  formWebhook = '';
  formStatus: 'active' | 'inactive' = 'active';

  editingProcess: Process | null = null;
  deletingProcess: Process | null = null;

  constructor(
    private processesService: ProcessesService,
    public utilityService: UtilityService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.loadProcesses();
  }

  /**
   * Load all processes from API
   */
  loadProcesses() {
    this.processesService.getProcesses().subscribe({
      next: (data) => {
        this.processes = data;
        console.log('Processes:', this.processes);
      },
      error: (error) => {
        this.notificationService.error('Something went wrong while loading processes');
        console.error('Load processes error:', error);
      }
    });
  }

  /**
   * Open Add Process Modal
   */
  openAddProcessModal() {
    this.isAddModalOpen = true;
    this.resetForm();
  }

  /**
   * Close Add Process Modal
   */
  closeAddProcessModal() {
    this.isAddModalOpen = false;
    this.resetForm();
  }

  /**
   * Check if Add button should be disabled
   */
  isAddButtonDisabled(): boolean {
    return this.formName.trim() === '' || this.formWebhook.trim() === '';
  }

  /**
   * Add new process
   */
  addProcess() {
    if (this.isAddButtonDisabled()) return;

    const payload: ProcessCreatePayload = {
      name: this.formName.trim(),
      webhook: this.formWebhook.trim(),
      status: this.formStatus,
    };

    this.processesService.createProcess(payload).subscribe({
      next: (response) => {
        this.closeAddProcessModal();
        this.notificationService.success('Process created successfully');
        this.loadProcesses();
      },
      error: (error) => {
        this.notificationService.error('Something went wrong while creating process');
      }
    });
  }

  /**
   * Open Edit Process Modal
   */
  onEdit(process: Process) {
    this.editingProcess = { ...process };
    this.formName = process.name;
    this.formWebhook = process.webhook;
    this.formStatus = process.status;
    this.isEditModalOpen = true;
  }

  /**
   * Close Edit Process Modal
   */
  closeEditProcessModal() {
    this.isEditModalOpen = false;
    this.editingProcess = null;
    this.resetForm();
  }

  /**
   * Check if Edit button should be disabled
   */
  isEditButtonDisabled(): boolean {
    return this.formName.trim() === '' || this.formWebhook.trim() === '';
  }

  /**
   * Update existing process
   */
  updateProcess() {
    if (!this.editingProcess || this.isEditButtonDisabled()) return;

    const payload: ProcessUpdatePayload = {
      name: this.formName.trim(),
      webhook: this.formWebhook.trim(),
      status: this.formStatus,
    };

    this.processesService.updateProcess(this.editingProcess.process_id!, payload).subscribe({
      next: (response) => {
        this.closeEditProcessModal();
        this.notificationService.success('Process updated successfully');
        this.loadProcesses();
      },
      error: (error) => {
        this.notificationService.error('Something went wrong while updating process');
      }
    });
  }

  /**
   * Open Delete Process Modal
   */
  onDelete(process: Process) {
    this.deletingProcess = process;
    this.isDeleteModalOpen = true;
  }

  /**
   * Close Delete Modal
   */
  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.deletingProcess = null;
  }

  /**
   * Confirm delete process
   */
  confirmDelete() {
    if (this.deletingProcess) {
      this.processesService.deleteProcess(this.deletingProcess.process_id!).subscribe({
        next: (response) => {
          this.closeDeleteModal();
          this.notificationService.success('Process deleted successfully');
          this.loadProcesses();
        },
        error: (error) => {
          this.notificationService.error('Something went wrong while deleting process');
        }
      });
    }
  }

  /**
   * Reset form fields
   */
  resetForm() {
    this.formName = '';
    this.formWebhook = '';
    this.formStatus = 'active';
  }
}
