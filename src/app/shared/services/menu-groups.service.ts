import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ApiEndpointsConsts } from '../constants/api-endpoints.constants';

export interface MenuGroup {
  id: number;
  name: string;
  order: number;
  status: 'active' | 'inactive';
}

export interface MenuGroupPayload {
  name: string;
  order: number;
  status: 'active' | 'inactive';
}

@Injectable({ providedIn: 'root' })
export class MenuGroupsService {
  private endpoint = ApiEndpointsConsts.MENU_GROUPS;
  constructor(private apiService: ApiService) {}

  // GET /menu-groups
  getMenuGroups(): Observable<MenuGroup[]> {
    return this.apiService.get(this.endpoint, {}, true).pipe(
      map((resp: any) => {
        const data = resp || [];
        return data.map((item: any) => this.mapToMenuGroup(item));
      })
    );
  }

  // GET /menu-groups/{id}
  getMenuGroupById(id: number): Observable<MenuGroup> {
    return this.apiService.get(`${this.endpoint}/${id}`, {}, true).pipe(map((resp: any) => this.mapToMenuGroup(resp)));
  }

  // POST /menu-groups
  createMenuGroup(payload: MenuGroupPayload): Observable<any> {
    return this.apiService.post(this.endpoint, payload, true);
  }

  // PUT /menu-groups/{id} with same payload
  updateMenuGroup(id: number, payload: MenuGroupPayload): Observable<any> {
    return this.apiService.put(`${this.endpoint}/${id}`, payload, true);
  }

  // DELETE /menu-groups/{id}
  deleteMenuGroup(id: number): Observable<any> {
    return this.apiService.delete(`${this.endpoint}/${id}`, true);
  }

  private mapToMenuGroup(item: any): MenuGroup {
    return {
      id: item.id ?? item.menu_group_id ?? 0,
      name: item.name ?? '',
      order: Number(item.order ?? 0),
      status: (item.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
    };
  }
}
