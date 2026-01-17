import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

import {
  DataTableColumn,
  DataTableAction,
  DataTableConfig,
  DataTableHeaderConfig,
} from './data-table.models';

import { ButtonComponent } from '../../ui/button/button.component';
import { MultiSelectComponent } from '../../form/multi-select/multi-select.component';
import { UtilityService } from '../../../services/utility.service';
import { SelectComponent } from '../../form/select/select.component';

@Component({
  selector: 'app-datatable',
  standalone: true,
  templateUrl: './data-table.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    MultiSelectComponent,
    DragDropModule,
    SelectComponent
  ],
})
export class DatatableComponent<T> implements OnChanges {

  /* ================= Inputs ================= */
  @Input() columns: DataTableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() actions: DataTableAction<T>[] = [];
  @Input() headerConfig: DataTableHeaderConfig<any> = {};
  @Input() config: DataTableConfig = {};

  /** Enable drag reorder */
  @Input() reorderable = false;

  @Output() selectionChange = new EventEmitter<T[]>();
  @Output() btnClickTrigger = new EventEmitter<void>();

  @Output() rowOrderChange = new EventEmitter<{
    previousIndex: number;
    currentIndex: number;
    movedItem: T;
    replacedItem: T | null;
    updatedData: T[];
  }>();

  searchTerm = '';
  sortKey: string | null = null;
  sortDir: 'asc' | 'desc' = 'asc';

  page = 1;
  pageSize = 10;
  pageSizeOptions: number[] = [10, 20, 50, 100];

  filteredData: T[] = [];
  paginatedData: T[] = [];
  selected = new Set<T>();

  headerButtons: any[] = [];

  constructor(public utilityService: UtilityService) {}

  ngOnChanges() {
    const defaultSize = this.config.pageSize ?? this.pageSizeOptions[0];
    this.pageSize = this.pageSizeOptions.includes(defaultSize)
      ? defaultSize
      : this.pageSizeOptions[0];

    this.headerButtons = this.headerConfig?.buttons ?? [];
    this.applyAll();
  }

  clickBtnTrigger() {
    this.btnClickTrigger.emit();
  }

  /* ================= Data Pipeline ================= */
  applyAll() {
    let rows = [...this.data];

    // Search
    // if (this.searchTerm) {
    //   rows = rows.filter(row =>
    //     this.columns.every(col =>
    //       col.searchable !== false &&
    //       String((row as any)[col.key] ?? '')
    //         .toLowerCase()
    //         .includes(this.searchTerm.toLowerCase())
    //     )
    //   );
    // }

      // Search
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();

      rows = rows.filter(row =>
        this.columns.some(col => {
          if (col.searchable !== true) return false;

          // Support nested keys like "user.name"
          const keys = (col.key as string).split('.');
          let value: any = row;

          for (const key of keys) {
            value = value?.[key];
            if (value === undefined || value === null) {
              return false;
            }
          }

          return String(value).toLowerCase().includes(term);
        })
      );
    }

    // Sort (disabled when reorderable)
    // if (this.sortKey && !this.reorderable) {
    if (this.sortKey) {
      rows.sort((a: any, b: any) => {
        const v1 = a[this.sortKey!];
        const v2 = b[this.sortKey!];
        return this.sortDir === 'asc'
          ? v1 > v2 ? 1 : -1
          : v1 < v2 ? 1 : -1;
      });
    }

    this.filteredData = rows;
    this.paginate();
  }

  paginate() {
    const start = (this.page - 1) * this.pageSize;
    this.paginatedData = this.filteredData.slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.page = page;
    this.paginate();
  }

  totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.page = 1;
    this.paginate();
  }

  /* ================= Sorting ================= */
  onHeaderClick(col: DataTableColumn<T>) {
    // if (!this.reorderable && col.sortable === true) {
    if (col.sortable === true) {
      this.toggleSort(col.key as string);
    }
  }

  toggleSort(key: string) {
    this.sortDir =
      this.sortKey === key && this.sortDir === 'asc' ? 'desc' : 'asc';
    this.sortKey = key;
    this.applyAll();
  }

  isSortable(col: DataTableColumn<any>): boolean {
    // return col.sortable === true && !this.reorderable;
    return col.sortable === true;
  }

  isSorted(col: DataTableColumn<any>): boolean {
    return this.sortKey === col.key;
  }

  sortIcon(col: DataTableColumn<any>): 'none' | 'asc' | 'desc' | 'neutral' {
    if (!this.isSortable(col)) return 'none';
    if (!this.isSorted(col)) return 'neutral';
    return this.sortDir;
  }

  /* ================= Helpers ================= */
  getValue(row: T, col: DataTableColumn<T>) {
    const keys = (col.key as string).split('.');
    let value: any = row;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined || value === null) return 'N.A.';
    }

    return value ?? 'N.A.';
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  toggleRow(row: T) {
    this.selected.has(row)
      ? this.selected.delete(row)
      : this.selected.add(row);

    this.selectionChange.emit([...this.selected]);
  }

  /* ================= Drag & Drop ================= */
  onRowDrop(event: CdkDragDrop<T[]>) {
    console.log('Drag Drop Event:', event.previousIndex, event.currentIndex);
    if (event.previousIndex === event.currentIndex) return;

    const dataCopy = [...this.filteredData];
    const movedItem = dataCopy[event.previousIndex];
    const replacedItem = dataCopy[event.currentIndex] ?? null;

    moveItemInArray(dataCopy, event.previousIndex, event.currentIndex);

    this.filteredData = dataCopy;
    this.paginate();

    this.rowOrderChange.emit({
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
      movedItem,
      replacedItem,
      updatedData: [...dataCopy],
    });
  }
}
