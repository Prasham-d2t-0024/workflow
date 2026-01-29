import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DataTableColumn,
  DataTableAction,
  DataTableHeaderConfig
} from '../../shared/components/tables/data-table/data-table.models';
import { DatatableComponent } from '../../shared/components/tables/data-table/data-table.component';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { NotificationService } from '../../shared/services/notification.service';
import {
  DmsMasterService,
  DmsMaster,
  DmsCreatePayload,
  DmsUpdatePayload
} from '../../shared/services/dms-master.service';


@Component({
  selector: 'app-dms-master',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatatableComponent,
    ModalComponent,
    ButtonComponent
  ],
  templateUrl: './dms-master.component.html'
})
export class DmsMasterComponent implements OnInit {

  dmsMasters: DmsMaster[] = [];

  dmsMasterColumns: DataTableColumn<any>[] = [
    { key: 'endpoint', label: 'DMS Endpoint', searchable: true, sortable:true },
    {
      key: 'active',
      label: 'Active',
      type: 'badge',
      badgeMap: {
        true: { label: 'Active', color: 'bg-success-50 text-success-600' },
        false: { label: 'Inactive', color: 'bg-error-50 text-error-600' }
      }
    },
    {
      key: 'isPrimary',
      label: 'Primary',
      type: 'badge',
      badgeMap: {
        true: { label: 'Yes', color: 'bg-brand-50 text-brand-600' },
        false: { label: 'No', color: 'bg-gray-300 text-gray-600' }
      }
    },
    { key: 'createdAt', label: 'Created At', type: 'date' },
    { key: 'updatedAt', label: 'Updated At', type: 'date' }
  ];

  dmsMasterActions: DataTableAction<any>[] = [
    { icon: 'fa-solid fa-pencil', handler: (row) => this.onEdit(row) },
    { icon: 'fa-solid fa-trash', handler: (row) => this.onDelete(row) }
  ];

  headerConfig: DataTableHeaderConfig<any> = {
    title: 'DMS Master',
    buttons: [{ label: 'Add DMS Endpoint', icon: 'fas fa-plus' }]
  };

  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;

  formEndpoint = '';
  formIsPrimary = false;
  formActive = true;

  editingDmsMaster: DmsMaster | null = null;
  deletingDmsMaster: DmsMaster | null = null;

  constructor(
    private dmsService: DmsMasterService,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.dmsService.getAll().subscribe(data => this.dmsMasters = data);
  }

  openAddDmsMasterModal() {
    this.resetForm();
    this.isAddModalOpen = true;
  }

  closeAddDmsMasterModal() {
    this.isAddModalOpen = false;
    this.resetForm();
  }

  isAddDisabled() {
    return this.formEndpoint.trim() === '';
  }

  addDmsMaster() {
    const payload: DmsCreatePayload = {
      endpoint: this.formEndpoint.trim(),
      isPrimary: this.formIsPrimary,
      active: this.formActive
    };

    this.dmsService.create(payload).subscribe(() => {
      this.notification.success('DMS endpoint created');
      this.closeAddDmsMasterModal();
      this.load();
    });
  }

  onEdit(row: DmsMaster) {
    this.editingDmsMaster = row;
    this.formEndpoint = row.endpoint;
    this.formIsPrimary = row.isPrimary;
    this.formActive = row.active;
    this.isEditModalOpen = true;
  }

  closeEditDmsMasterModal() {
    this.isEditModalOpen = false;
    this.editingDmsMaster = null;
    this.resetForm();
  }

  isEditDisabled() {
    return this.formEndpoint.trim() === '';
  }

  updateDmsMaster() {
    if (!this.editingDmsMaster) return;

    const payload: DmsUpdatePayload = {
      endpoint: this.formEndpoint.trim(),
      isPrimary: this.formIsPrimary,
      active: this.formActive
    };

    this.dmsService.update(this.editingDmsMaster.dms_id, payload).subscribe(() => {
      this.notification.success('DMS endpoint updated');
      this.closeEditDmsMasterModal();
      this.load();
    });
  }

  onDelete(row: DmsMaster) {
    this.deletingDmsMaster = row;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.deletingDmsMaster = null;
  }

  confirmDelete() {
    if (!this.deletingDmsMaster) return;

    this.dmsService.delete(this.deletingDmsMaster.dms_id).subscribe(() => {
      this.notification.success('DMS endpoint deleted');
      this.closeDeleteModal();
      this.load();
    });
  }

  resetForm() {
    this.formEndpoint = '';
    this.formIsPrimary = false;
    this.formActive = true;
  }
}
