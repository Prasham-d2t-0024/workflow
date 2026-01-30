import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiEndpointsConsts } from '../constants/api-endpoints.constants';

@Injectable({
  providedIn: 'root'
})
export class FileCreationService {
  private endpoint = ApiEndpointsConsts.METADATA_REGISTRY_VALUES;
  private batchesEndpoint = ApiEndpointsConsts.BATCHES;

  constructor(private apiService: ApiService) { }
  submitMetadataForm(formData:any):Observable<any>{
    return this.apiService.post(this.endpoint,formData,true);
  }

  commitBatch(payload:any):Observable<any>{
    return this.apiService.post(`${this.batchesEndpoint}/commit`,payload,true);
  }
  
}
