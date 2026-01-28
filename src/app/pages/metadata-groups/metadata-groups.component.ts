import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { AlertComponent } from '../../shared/components/ui/alert/alert.component';
import {
  MetadataGroupsService,
  MetadataGroup,
  MetadataGroupCreatePayload,
  MetadataGroupUpdatePayload
} from '../../shared/services/metadata-groups.service';
import { UtilityService } from '../../shared/services/utility.service';
import { NotificationService } from '../../shared/services/notification.service';
import {
  DataTableAction,
  DataTableColumn,
  DataTableHeaderConfig
} from '../../shared/components/tables/data-table/data-table.models';
import { DatatableComponent } from '../../shared/components/tables/data-table/data-table.component';

@Component({
  selector: 'app-metadata-groups',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    ModalComponent,
    AlertComponent,
    DatatableComponent
  ],
  templateUrl: './metadata-groups.component.html',
  styleUrl: './metadata-groups.component.css'
})
export class MetadataGroupsComponent implements OnInit {

  metadataGroups: MetadataGroup[] = [];

  /* ===== DATATABLE CONFIGURATION ===== */
  metadataGroupsColumns: DataTableColumn<any>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
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

  metadataGroupsActions: DataTableAction<any>[] = [
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
    title: 'Metadata Groups',
    buttons: [
      {
        label: 'Add Metadata Group',
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
  formStatus: 'active' | 'inactive' = 'active';

  editingMetadataGroup: MetadataGroup | null = null;
  deletingMetadataGroup: MetadataGroup | null = null;

  constructor(
    private metadataGroupsService: MetadataGroupsService,
    public utilityService: UtilityService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadMetadataGroups();
  }

  /**
   * Load metadata groups
   */
  loadMetadataGroups() {
    this.metadataGroupsService.getMetadataGroups().subscribe({
      next: (data) => {
        this.metadataGroups = data;
      },
      error: () => {
        this.notificationService.error(
          'Something went wrong while loading metadata groups'
        );
      }
    });
  }

  openAddMetadataGroupModal() {
    this.isAddModalOpen = true;
    this.resetForm();
  }

  closeAddMetadataGroupModal() {
    this.isAddModalOpen = false;
    this.resetForm();
  }

  isAddButtonDisabled(): boolean {
    return this.formName.trim() === '';
  }

  addMetadataGroup() {
    if (this.isAddButtonDisabled()) return;

    const payload: MetadataGroupCreatePayload = {
      name: this.formName.trim(),
      status: this.formStatus,
    };

    this.metadataGroupsService.createMetadataGroup(payload).subscribe({
      next: () => {
        this.closeAddMetadataGroupModal();
        this.notificationService.success(
          'Metadata group created successfully'
        );
        this.loadMetadataGroups();
      },
      error: () => {
        this.notificationService.error(
          'Something went wrong while creating metadata group'
        );
      }
    });
  }

  onEdit(group: MetadataGroup) {
    this.editingMetadataGroup = { ...group };
    this.formName = group.name;
    this.formStatus = group.status;
    this.isEditModalOpen = true;
  }

  closeEditMetadataGroupModal() {
    this.isEditModalOpen = false;
    this.editingMetadataGroup = null;
    this.resetForm();
  }

  isEditButtonDisabled(): boolean {
    return this.formName.trim() === '';
  }

  updateMetadataGroup() {
    if (!this.editingMetadataGroup || this.isEditButtonDisabled()) return;

    const payload: MetadataGroupUpdatePayload = {
      name: this.formName.trim(),
      status: this.formStatus,
    };

    this.metadataGroupsService.updateMetadataGroup(
      this.editingMetadataGroup.metadata_group_id!,
      payload
    ).subscribe({
      next: () => {
        this.closeEditMetadataGroupModal();
        this.notificationService.success(
          'Metadata group updated successfully'
        );
        this.loadMetadataGroups();
      },
      error: () => {
        this.notificationService.error(
          'Something went wrong while updating metadata group'
        );
      }
    });
  }

  onDelete(group: MetadataGroup) {
    this.deletingMetadataGroup = group;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.deletingMetadataGroup = null;
  }

  confirmDelete() {
    if (!this.deletingMetadataGroup) return;

    this.metadataGroupsService.deleteMetadataGroup(
      this.deletingMetadataGroup.metadata_group_id!
    ).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.notificationService.success(
          'Metadata group deleted successfully'
        );
        this.loadMetadataGroups();
      },
      error: () => {
        this.notificationService.error(
          'Something went wrong while deleting metadata group'
        );
      }
    });
  }

  resetForm() {
    this.formName = '';
    this.formStatus = 'active';
  }
}
