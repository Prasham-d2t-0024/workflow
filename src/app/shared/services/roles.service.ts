import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';

export interface Role {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface RoleCreatePayload {
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

@Injectable({ providedIn: 'root' })
export class RolesService {
  constructor(private apiService: ApiService, private notification: NotificationService) {}

  // GET /roles
  getRoles(): Observable<Role[]> {
    return this.apiService.get('/roles', {}, true).pipe(
      map((resp: any) => {
        const data = resp || [];
        return data.map((item: any) => this.mapToRole(item));
      })
    );
  }

  // GET /roles/{id}
  getRoleById(id: number): Observable<Role> {
    return this.apiService.get(`/roles/${id}`, {}, true).pipe(map((resp: any) => this.mapToRole(resp)));
  }

  // POST /roles
  createRole(payload: RoleCreatePayload): Observable<any> {
    return this.apiService.post('/roles', payload, true);
  }

  // PUT /roles/{id} (only id required per instructions)
  updateRole(id: number, payload: RoleCreatePayload): Observable<any> {
    return this.apiService.put(`/roles/${id}`, payload, true);
  }

  // DELETE /roles/{id}
  deleteRole(id: number): Observable<any> {
    return this.apiService.delete(`/roles/${id}`, true);
  }

  private mapToRole(item: any): Role {
    return {
      id: item.id ?? item.role_id ?? 0,
      name: item.name ?? '',
      description: item.description ?? '',
      status: (item.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
    };
  }
}
