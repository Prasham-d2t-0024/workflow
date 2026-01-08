import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiEndpointsConsts } from '../constants/api-endpoints.constants';

export interface Process {
  process_id?: number;
  name: string;
  webhook: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ProcessCreatePayload {
  name: string;
  webhook: string;
  status: 'active' | 'inactive';
}

export interface ProcessUpdatePayload {
  name: string;
  webhook: string;
  status: 'active' | 'inactive';
}

@Injectable({
  providedIn: 'root'
})
export class ProcessesService {
  private endpoint = '/processes';

  constructor(private apiService: ApiService) { }

  /**
   * Get all processes
   * @returns Observable<Process[]>
   */
  getProcesses(): Observable<Process[]> {
    return this.apiService.get(this.endpoint, {}, true);
  }

  /**
   * Get process by ID
   * @param id Process ID
   * @returns Observable<Process>
   */
  getProcessById(id: number): Observable<Process> {
    return this.apiService.get(`${this.endpoint}/${id}`, {}, true);
  }

  /**
   * Create new process
   * @param payload Process data
   * @returns Observable<Process>
   */
  createProcess(payload: ProcessCreatePayload): Observable<Process> {
    return this.apiService.post(this.endpoint, payload, true);
  }

  /**
   * Update existing process
   * @param id Process ID
   * @param payload Updated process data
   * @returns Observable<Process>
   */
  updateProcess(id: number, payload: ProcessUpdatePayload): Observable<Process> {
    return this.apiService.put(`${this.endpoint}/${id}`, payload, true);
  }

  /**
   * Delete process
   * @param id Process ID
   * @returns Observable<any>
   */
  deleteProcess(id: number): Observable<any> {
    return this.apiService.delete(`${this.endpoint}/${id}`, true);
  }
}
