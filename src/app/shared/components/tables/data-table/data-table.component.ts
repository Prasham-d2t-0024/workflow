import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
} from '@angular/core';
import { DataTableColumn, DataTableAction, DataTableConfig, DataTableHeaderButton, DataTableHeaderConfig } from './data-table.models';
import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
import { ButtonComponent } from '../../ui/button/button.component';
import { UtilityService } from '../../../services/utility.service';
import { MultiSelectComponent } from '../../form/multi-select/multi-select.component';

@Component({
  selector: 'app-datatable',
  standalone: true,
  templateUrl: './data-table.component.html',
  imports: [CommonModule, FormsModule, ButtonComponent, JsonPipe, MultiSelectComponent],
})
export class DatatableComponent<T> implements OnChanges {
  @Input() columns: DataTableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() actions: DataTableAction<T>[] = [];
  @Input() headerConfig: DataTableHeaderConfig<any> = {};
  @Input() config: DataTableConfig = {};

  @Output() selectionChange = new EventEmitter<T[]>();
  @Output() btnClickTrigger = new EventEmitter<T[]>();

  searchTerm = '';
  sortKey: string | null = null;
  sortDir: 'asc' | 'desc' = 'asc';

  page = 1;
  pageSize = 10;
  pageSizeOptions: number[] = [10, 20, 50, 100];

  filteredData: T[] = [];
  paginatedData: T[] = [];
  selected = new Set<T>();

  headerButtons:any[] = [];

  constructor(
    public utilityService : UtilityService
  ){}

  ngOnChanges() {
    const defaultSize = this.config.pageSize ?? this.pageSizeOptions[0];
    this.pageSize = this.pageSizeOptions.includes(defaultSize)
      ? defaultSize
      : this.pageSizeOptions[0];
    this.headerButtons = this.headerConfig?.buttons ?? [];
    this.applyAll();
  }

  clickBtnTrigger(){
    this.btnClickTrigger.emit();
  }

  applyAll() {
    let rows = [...this.data];

    // Search
    if (this.searchTerm) {
      rows = rows.filter(row =>
        this.columns.some(col =>
          col.searchable !== false &&
          String((row as any)[col.key] ?? '')
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
        )
      );
    }

    // Sort
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
    console.log('Filtered Data:', this.filteredData);
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

// Sorting

  onHeaderClick(col: DataTableColumn<T>) {
    if (col.sortable === true){
      this.toggleSort(col.key as string);
    } 
    return;
  }

  getValue(row: T, col: DataTableColumn<T>) {
    const keys = (col.key as string).split('.');
    let value: any = row;
    
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined || value === null) {
        return 'N.A.';
      }
    }
    
    return value ?? 'N.A.';
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  isSortable(col: DataTableColumn<any>): boolean {
    return col.sortable == true;
  }

  isSorted(col: DataTableColumn<any>): boolean {
    return this.sortKey === col.key;
  }

  sortIcon(col: DataTableColumn<any>): 'none' | 'asc' | 'desc' | 'neutral' {
    if (!this.isSortable(col)) return 'none';
    if (!this.isSorted(col)) return 'neutral';
    return this.sortDir;
  }

    toggleSort(key: string) {
    this.sortDir = this.sortKey === key && this.sortDir === 'asc' ? 'desc' : 'asc';
    this.sortKey = key;
    this.applyAll();
  }

  toggleRow(row: T) {
    this.selected.has(row) ? this.selected.delete(row) : this.selected.add(row);
    this.selectionChange.emit([...this.selected]);
  }

}
