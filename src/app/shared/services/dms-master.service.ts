import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiEndpointsConsts } from '../constants/api-endpoints.constants';

export interface DmsMaster {
  dms_id: number;
  endpoint: string;
  isPrimary: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DmsCreatePayload {
  endpoint: string;
  isPrimary: boolean;
  active: boolean;
}

export interface DmsUpdatePayload extends DmsCreatePayload {}

@Injectable({ providedIn: 'root' })
export class DmsMasterService {

  private endpoint = ApiEndpointsConsts.DMS_MASTER;

  constructor(private api: ApiService) {}

  getAll(): Observable<DmsMaster[]> {
    return this.api.get(this.endpoint, {}, true);
  }

  create(payload: DmsCreatePayload): Observable<DmsMaster> {
    return this.api.post(this.endpoint, payload, true);
  }

  update(id: number, payload: DmsUpdatePayload): Observable<DmsMaster> {
    return this.api.put(`${this.endpoint}/${id}`, payload, true);
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${this.endpoint}/${id}`, true);
  }
}
