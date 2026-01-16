export interface DataTableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  searchable?: boolean;
  width?: string;
  type?: 'text' | 'date' | 'badge' | 'currency' | 'custom' | 'icon' | 'multiselect' | 'dropdown';
  badgeMap?: Record<string, { label: string; color: string }>;
  formatter?: (row: T) => string;
  allOptions?: any;
  displayKey?: string; // For multiselect, which key to use for display
}

export interface DataTableAction<T = any> {
  icon: string;
  tooltip?: string;
  visible?: (row: T) => boolean;
  handler: (row: T) => void;
}

export interface DataTableHeaderButton<T = any> {
  label?: string;
  icon: string;
}

export interface DataTableHeaderConfig<T = any> {
  title?:string,
  buttons?:DataTableHeaderButton[]
}



export interface DataTableConfig {
  pageSize?: number;
  selectable?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
}
