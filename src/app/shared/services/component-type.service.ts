import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface ComponentType {
  component_type_id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComponentTypeService {

  constructor(private apiService: ApiService) { }

  /**
   * Get all component types
   * @returns Observable<ComponentType[]>
   */
  getComponentTypes(): Observable<ComponentType[]> {
    return this.apiService.get('/componenttypes', {}, true).pipe(
      map((data: any) => {
        return data.map((item: any) => ({
          id: item.component_type_id || item._component_type_id || '',
          name: item.name || '',
        }));
      })
    );
  }

  /**
   * Get component type by ID
   * @param id Component type ID
   * @returns Observable<ComponentType>
   */
  getComponentTypeById(id: string): Observable<ComponentType> {
    return this.apiService.get(`/componenttypes/${id}`, {}, true);
  }

  /**
   * Create new component type
   * @param payload Component type data
   * @returns Observable<any>
   */
  createComponentType(payload: { name: string }): Observable<any> {
    return this.apiService.post('/componenttypes', payload, true);
  }

  /**
   * Update component type
   * @param id Component type ID
   * @param payload Component type data
   * @returns Observable<any>
   */
  updateComponentType(id: string, payload: { name: string }): Observable<any> {
    return this.apiService.put(`/componenttypes/${id}`, payload, true);
  }

  /**
   * Delete component type
   * @param id Component type ID
   * @returns Observable<any>
   */
  deleteComponentType(id: string): Observable<any> {
    return this.apiService.delete(`/componenttypes/${id}`, true);
  }
}
