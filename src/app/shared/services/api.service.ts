import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { AppConfig } from './auth.service';
import { NotificationService } from './notification.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

config: AppConfig | null = null;
baseUrl: string = '';

constructor(private http: HttpClient, public notificationService:NotificationService, private router: Router) {}
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
   * @param encodedHeader logout custom header
   * @param customResponseType custom response type
   * @returns response
   */
  get(
    url: string,
    params?: any,
    appendToken?: boolean,
    encodedHeader?: string
  ) {
    let fullUrl: string = this.baseUrl ? this.baseUrl + url : url;
    let headers = new HttpHeaders();

    headers = headers.append('Content-Type', 'application/json');

    // if (encodedHeader) {
    //   headers = headers.set('Authorization', `Basic ${encodedHeader}`);
    // }
    if(appendToken){
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers = headers.append('Authorization', `Bearer ${token}`);
      }
    }
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
   * @returns response
   */
  post(
    url: string,
    args: any,
    appendToken?: boolean,
    params?: any
  ) {
    let fullUrl: string = this.baseUrl ? this.baseUrl + url : url;
    let headers = new HttpHeaders();
    if (!(args instanceof FormData)) { // condition to prevent send wrong content type when sending formdata for any cases
      headers = headers.append('Content-Type', 'application/json');
    }
    if(appendToken){
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers = headers.append('Authorization', `Bearer ${token}`);
      }
    }
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
        catchError((err) => {
          return this.handleError(err)
        })
      );
  }

  /**
   * HTTP PUT REQUEST
   * @param url Url
   * @param args Request body
   * @param appendToken Append authorization token
   * @param params Query params
   * @returns response
   */
  put(
    url: string,
    args: any,
    appendToken?: boolean,
    params?: any
  ) {
    let fullUrl: string = this.baseUrl ? this.baseUrl + url : url;
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    if(appendToken){
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers = headers.append('Authorization', `Bearer ${token}`);
      }
    }
    let options: any = { headers };

    if (params) {
      options = {
        ...options,
        withCredentials: false,
        params: params
      };
    }

    return this.http
      .put(fullUrl, args, options)
      .pipe(
        catchError(err => this.handleError(err))
      );
  }

  /**
   * HTTP DELETE REQUEST
   * @param url Url
   * @param appendToken Append authorization token
   * @param params Query params
   * @returns response
   */
  delete(
    url: string,
    appendToken?: boolean,
    params?: any
  ) {
    let fullUrl: string = this.baseUrl ? this.baseUrl + url : url;
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    if(appendToken){
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers = headers.append('Authorization', `Bearer ${token}`);
      }
    }
    let options: any = { headers };

    if (params) {
      options = {
        ...options,
        withCredentials: false,
        params: params
      };
    }

    return this.http
      .delete(fullUrl, options)
      .pipe(
        catchError(err => this.handleError(err))
      );
  }

   handleError(error: any): Observable<any> {
    if(error.status === 401 || error.status === 403) {
      localStorage.clear();
      this.router.navigate(['/signin']);
      return throwError(() => new Error('Unauthorized or Forbidden'));
    }else {
      const errorMessage = (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server Error';
      return throwError(() => errorMessage);
    }
  }

}