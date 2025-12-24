import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

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
  constructor(private apiService: ApiService) {}

  // GET /menu-groups
  getMenuGroups(): Observable<MenuGroup[]> {
    return this.apiService.get('/menu-groups', {}, true).pipe(
      map((resp: any) => {
        const data = resp || [];
        return data.map((item: any) => this.mapToMenuGroup(item));
      })
    );
  }

  // GET /menu-groups/{id}
  getMenuGroupById(id: number): Observable<MenuGroup> {
    return this.apiService.get(`/menu-groups/${id}`, {}, true).pipe(map((resp: any) => this.mapToMenuGroup(resp)));
  }

  // POST /menu-groups
  createMenuGroup(payload: MenuGroupPayload): Observable<any> {
    return this.apiService.post('/menu-groups', payload, true);
  }

  // PUT /menu-groups/{id} with same payload
  updateMenuGroup(id: number, payload: MenuGroupPayload): Observable<any> {
    return this.apiService.put(`/menu-groups/${id}`, payload, true);
  }

  // DELETE /menu-groups/{id}
  deleteMenuGroup(id: number): Observable<any> {
    return this.apiService.delete(`/menu-groups/${id}`, true);
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
