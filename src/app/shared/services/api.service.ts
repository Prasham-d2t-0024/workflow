import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { AppConfig } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

config: AppConfig | null = null;
baseUrl: string = '';

constructor(private http: HttpClient) {}
    load(): Promise<void> {
        return new Promise((resolve) => {
            this.http.get<AppConfig>('/config.json').subscribe({
            next: (config: AppConfig) => {
                this.config = config;
                this.baseUrl = config?.baseUrl || '';
                resolve();
            },
            error: (err) => {
                console.error('Failed to load config', err);
                resolve();
            }
            });
        }
    )};

      /**
   * HTTP GET REQUEST
   * @param url Url
   * @param params params
   * @param customHeader access token
   * @param encodedHeader logout custom header
   * @param customResponseType custom response type
   * @returns response
   */
  get(
    url: string,
    params?: any,
    encodedHeader?: string
  ) {
    let fullUrl: string = this.baseUrl ? this.baseUrl + url : url;
    let headers = new HttpHeaders();

    headers = headers.append('Content-Type', 'application/json');

    // if (encodedHeader) {
    //   headers = headers.set('Authorization', `Basic ${encodedHeader}`);
    // }

    let options: any = { headers };

    if (params) {
      options = {
        ...options,
        withCredentials: false,
        params: params
      };
    }

    return this.http.get(fullUrl, options).pipe(catchError((err) => this.handleError(err)));
  }


  /**
   * HTTP POST REQUEST
   * @param url Url
   * @param params params
   * @param customHeader access token
   * @param logOutHeader logout custom header
   * @param customResponseType custom response type
   * @returns response
   */
  post(
    url: string,
    args: any,
    params?: any
  ) {
    let fullUrl: string = this.baseUrl ? this.baseUrl + url : url;
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');

    let options: any = { headers };

    if (params) {
      options = {
        ...options,
        withCredentials: false,
        params: params
      };
    }

    return this.http
      .post(fullUrl, args, options)
      .pipe(
        catchError(err => this.handleError(err))
      );
  }

   handleError(error: any): Observable<any> {
    if(error.status === 401 || error.status === 403) {
      return throwError(() => new Error('Unauthorized or Forbidden'));
    } else {
      const errorMessage = (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server Error';
      return throwError(() => errorMessage);
    }
  }

}