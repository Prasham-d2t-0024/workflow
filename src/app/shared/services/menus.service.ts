import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiEndpointsConsts } from '../constants/api-endpoints.constants';

export interface Menu {
  menu_id?: number;
  menu_group_id: number | null;
  name: string;
  path: string;
  icon: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenusService {
  private endpoint = ApiEndpointsConsts.MENUS;

  constructor(private apiService: ApiService) { }

  /**
   * Get all menus
   * @returns Observable<Menu[]>
   */
  getMenus(): Observable<Menu[]> {
    return this.apiService.get(this.endpoint, {}, true);
  }

  /**
   * Get menu by ID
   * @param id Menu ID
   * @returns Observable<Menu>
   */
  getMenuById(id: string): Observable<Menu> {
    return this.apiService.get(`${this.endpoint}/${id}`, {}, true);
  }

  /**
   * Create new menu
   * @param payload Menu data
   * @returns Observable<any>
   */
  createMenu(payload: Menu): Observable<any> {
    return this.apiService.post(this.endpoint, payload, true);
  }

  /**
   * Update menu
   * @param id Menu ID
   * @param payload Menu data
   * @returns Observable<any>
   */
  updateMenu(id: string, payload: Menu): Observable<any> {
    return this.apiService.put(`${this.endpoint}/${id}`, payload, true);
  }

  /**
   * Delete menu
   * @param id Menu ID
   * @returns Observable<any>
   */
  deleteMenu(id: string): Observable<any> {
    return this.apiService.delete(`${this.endpoint}/${id}`, true);
  }
}
