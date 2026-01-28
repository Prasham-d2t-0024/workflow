import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ApiEndpointsConsts } from '../constants/api-endpoints.constants';

export interface Item {
  item_id: number;
  name: string;
  createdAt:string
  updatedAt:string
  deletedAt:string
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private endpoint = ApiEndpointsConsts.ITEMS;

  constructor(private apiService: ApiService) {}

  /**
   * Get all items
   * @returns Observable<Item[]>
   */
  getItems(): Observable<Item[]> {
    return this.apiService.get(this.endpoint, {}, true).pipe(
      map((data: any) => {
        return data.map((item: any) => ({
          item_id: item.item_id || item._item_id || '',
          name: item.name || '',
        }));
      })
    );
  }

  /**
   * Get item by ID
   * @param id Item ID
   * @returns Observable<Item>
   */
  getItemById(id: string): Observable<Item> {
    return this.apiService.get(`${this.endpoint}/${id}`, {}, true);
  }

  /**
   * Create new item
   * @param payload Item data
   * @returns Observable<any>
   */
  createItem(payload: { name: string }): Observable<any> {
    return this.apiService.post(this.endpoint, payload, true);
  }

  /**
   * Update item
   * @param id Item ID
   * @param payload Item data
   * @returns Observable<any>
   */
  updateItem(id: string, payload: { name: string }): Observable<any> {
    return this.apiService.put(`${this.endpoint}/${id}`, payload, true);
  }

  /**
   * Delete item
   * @param id Item ID
   * @returns Observable<any>
   */
  deleteItem(id: string): Observable<any> {
    return this.apiService.delete(`${this.endpoint}/${id}`, true);
  }
}
