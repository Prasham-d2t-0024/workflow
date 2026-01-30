import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ComponentTypeService, ComponentType } from './component-type.service';
import { Option } from '../components/form/select/select.component';
import { ApiEndpointsConsts } from '../constants/api-endpoints.constants';
import { DropdownType } from './dropdown-management.service';
import { MetadataGroup, MetadataGroupsService } from './metadata-groups.service';
import { Item, ItemService } from './items.service';

export interface MetadataRegistry {
  metadata_registry_id: number;
  title: string;
  key: string;
  isrequired: boolean;
  ismultiple: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  componentType?: ComponentType;
  dropdown?:DropdownType;
  metadataGroup?:MetadataGroup;
  metadata_group_id?:number;
}

export interface MetadataRegistryPayload {
  title: string;
  isrequired: number;
  ismultiple: number;
  componentType: string;
}

@Injectable({
  providedIn: 'root'
})
export class MetadataRegistryService {
  endpoint = ApiEndpointsConsts.METADATA_REGISTRY;
  metadata_registery_values_endpoint = ApiEndpointsConsts.METADATA_REGISTRY_VALUES;
  constructor(
    private apiService: ApiService,
    private componentTypeService: ComponentTypeService,
    private metadataGroupsService: MetadataGroupsService,
    private itemService:ItemService
  ) { }

  /**
   * Get all metadata registries
   * @returns Observable<MetadataRegistry[]>
   */
  getMetadataRegistries(): Observable<MetadataRegistry[]> {
    return this.apiService.get(this.endpoint, {}, true).pipe(
      map((resp: any) => {
        const data = resp || [];
        return data.map((item: any) => ({
          metadata_registry_id: item.metadata_registry_id || 0,
          title: item.title || '',
          key: item.key || '',
          isrequired: item.isrequired || false,
          ismultiple: item.ismultiple || false,
          entity_name: item.entity_name || null,
          createdAt: item.createdAt || '',
          updatedAt: item.updatedAt || '',
          publishedAt: item.publishedAt || '',
          componentType: item.componentType || '',
          dropdown: item.dropdown || '',
          metadataGroup: item.metadataGroup || '',
          metadata_group_id: item.metadata_group_id || ''
        }));
      })
    );
  }

  /**
   * Get metadata registry by ID
   * @param id Metadata registry ID
   * @returns Observable<MetadataRegistry>
   */
  getMetadataRegistryById(id: number): Observable<MetadataRegistry> {
    return this.apiService.get(`${this.endpoint}/${id}`, {}, true);
  }

  /**
   * To get list og metadata groups
   * @returns 
   */
  getMetadataGroups(): Observable<MetadataGroup[]> {
    return this.metadataGroupsService.getMetadataGroups();
  }

  /**
   * Create new metadata registry
   * @param payload Metadata registry data
   * @returns Observable<any>
   */
  createMetadataRegistry(payload: any): Observable<any> {
    return this.apiService.post(this.endpoint, payload, true);
  }

  /**
   * Update metadata registry
   * @param id Metadata registry ID
   * @param payload Metadata registry data
   * @returns Observable<any>
   */
  updateMetadataRegistry(id: number, payload: any): Observable<any> {
    return this.apiService.put(`${this.endpoint}/${id}`, payload, true);
  }

  /**
   * Delete metadata registry
   * @param id Metadata registry ID
   * @returns Observable<any>
   */
  deleteMetadataRegistry(id: number): Observable<any> {
    return this.apiService.delete(`${this.endpoint}/${id}`, true);
  }

  /**
   * Get component types (uses ComponentTypeService)
   * @returns Observable<ComponentType[]>
   */
  getComponentTypes(): Observable<ComponentType[]> {
    return this.componentTypeService.getComponentTypes();
  }

  /**
   * Get component types (uses ComponentTypeService)
   * @returns Observable<ComponentType[]>
   */
  getItems(): Observable<Item[]> {
    return this.itemService.getItems();
  }
  getItemById(id:any): Observable<Item> {
    return this.itemService.getItemById(id);
  }

  getItemsFromCurrentBatch(){
    return this.itemService.getItemsFromCurrentBatch();
  }

  getMetadatasByItemId(itemID:any){
    return this.apiService.get(`${this.metadata_registery_values_endpoint}/item/${itemID}`,null,true);
  }

  /**
   * Convert component types to select options
   * @param componentTypes Array of component types
   * @returns Option[]
   */
  convertToOptions(componentTypes: any): Option[] {
    return componentTypes.map((ct:any) => ({
      value: String(ct.id),
      label: ct.name
    }));
  }

  reorderMetadata(payload: {
    items: { metadata_registry_id: number; metadataOrder: number }[];
  }) {
    return this.apiService.post(`${this.endpoint}/reorder`, payload, true);
  }

  convertMetadataGroupsToOptions(groups: MetadataGroup[]): Option[] {
    return groups.map((g) => ({
      value: String(g.metadata_group_id),
      label: g.name,
    }));
  }

  deleteItem(itemId:any){
    return this.itemService.deleteItem(itemId);
  }
}
