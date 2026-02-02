import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiEndpointsConsts } from '../constants/api-endpoints.constants';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FileCreationService {
  private endpoint = ApiEndpointsConsts.METADATA_REGISTRY_VALUES;
  private batchesEndpoint = ApiEndpointsConsts.BATCHES;
  config: AppConfig | null = null;
  filesTableColumn: any[] = [];
  fileNameConfig: string = '';
  constructor(private http: HttpClient, private apiService: ApiService) { }

  load(): Promise<void> {
      return new Promise((resolve) => {
          this.http.get<AppConfig>('/config.json').subscribe({
          next: (config: AppConfig) => {
              this.config = config;
              this.filesTableColumn = config?.filesTableColumn || [];
              this.fileNameConfig = config?.fileNameConfig || '';
              resolve();
          },
          error: (err) => {
              console.error('Failed to load config', err);
              resolve();
          }
          });
      }
  )};
  submitMetadataForm(formData:any):Observable<any>{
    return this.apiService.post(this.endpoint,formData,true);
  }

  commitBatch(payload:any):Observable<any>{
    return this.apiService.post(`${this.batchesEndpoint}/commit`,payload,true);
  }
  
}
