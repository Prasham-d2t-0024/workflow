import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ApiEndpointsConsts } from '../constants/api-endpoints.constants';
import { Observable } from 'rxjs';

export interface DropdownType{
  dropdown_id: number;
  name: string;
  code:string;
  options:any[];
  createdAt:Date
}
@Injectable({
  providedIn: 'root'
})

export class DropdownManagementService {
  constructor(private apiService: ApiService) { }
  getDropdowns(): Observable<any>{
    return this.apiService.get(ApiEndpointsConsts.DROPDOWNS, {}, true)
  }

  /**
   * Create new menu
   * @param payload Menu data
   * @returns Observable<any>
   */
  createDropdown(payload: any): Observable<any> {
    return this.apiService.post(ApiEndpointsConsts.DROPDOWNS, payload, true);
  }

  /**
   * Update menu
   * @param id Menu ID
   * @param payload Menu data
   * @returns Observable<any>
   */
  updateDropdown(id: string, payload: any): Observable<any> {
    return this.apiService
      .put(
        `${ApiEndpointsConsts.DROPDOWNS}/${id}`,
        payload,
        true,
      );
  }

  /**
   * Delete menu
   * @param id Menu ID
   * @returns Observable<any>
   */
  deleteDropdown(id: string): Observable<any> {
    return this.apiService.delete(`${ApiEndpointsConsts.DROPDOWNS}/${id}`, true);
  }

}
