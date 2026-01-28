import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface MetadataGroup {
  metadata_group_id: number;
  name: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface MetadataGroupCreatePayload {
  name: string;
  status: 'active' | 'inactive';
}

export interface MetadataGroupUpdatePayload {
  name: string;
  status: 'active' | 'inactive';
}

@Injectable({
  providedIn: 'root'
})
export class MetadataGroupsService {
  private endpoint = '/metadata-groups';

  constructor(private apiService: ApiService) {}

  /**
   * Get all metadata groups
   */
  getMetadataGroups(): Observable<MetadataGroup[]> {
    return this.apiService.get(this.endpoint, {}, true);
  }

  /**
   * Get metadata group by ID
   */
  getMetadataGroupById(id: number): Observable<MetadataGroup> {
    return this.apiService.get(`${this.endpoint}/${id}`, {}, true);
  }

  /**
   * Create metadata group
   */
  createMetadataGroup(
    payload: MetadataGroupCreatePayload
  ): Observable<MetadataGroup> {
    return this.apiService.post(this.endpoint, payload, true);
  }

  /**
   * Update metadata group
   */
  updateMetadataGroup(
    id: number,
    payload: MetadataGroupUpdatePayload
  ): Observable<MetadataGroup> {
    return this.apiService.put(`${this.endpoint}/${id}`, payload, true);
  }

  /**
   * Delete metadata group
   */
  deleteMetadataGroup(id: number): Observable<any> {
    return this.apiService.delete(`${this.endpoint}/${id}`, true);
  }
}
