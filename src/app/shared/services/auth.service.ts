import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiEndpointsConsts } from '../constants/api-endpoints.constants';
import { StorageKeysConsts } from '../constants/storage-keys';

export interface AppConfig {
  baseUrl: string;
  appName: string;
  version: string;
  features: {
    enableNotifications: boolean;
    enableChat: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  // Store loaded config
  private config: AppConfig | null = null;

  constructor(private router: Router,private http: HttpClient, private apiService: ApiService) {}

  /**
   * Get loaded config
   */
  getConfig(): AppConfig | null {
    return this.config;
  }

  /**
   * Get API URL from config
   */
  getApiUrl(): string {
    return this.config?.baseUrl || '';
  }

/**
   * Check if user has a valid token
   */
  private hasToken(): boolean {
    return !!localStorage.getItem(StorageKeysConsts.TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  /**
   * Login user and store token
   */
  login(email: string, password: string): Promise<boolean> {
    let bypassLogin = false;
    if(bypassLogin){
        return new Promise((resolve)=>{
            const token = this.generateToken();
            const userData = { email, loginTime: new Date().toISOString() };
            
            localStorage.setItem(StorageKeysConsts.TOKEN_KEY, token);
            localStorage.setItem(StorageKeysConsts.USER_KEY, JSON.stringify(userData));
            
            this.isAuthenticatedSubject.next(true);
            resolve(true);
        })
    }else{
        return new Promise((resolve) => {
          this.apiService.post(ApiEndpointsConsts.LOGIN, { email, password }).subscribe((resp)=>{
            isDevMode() && console.log('%cLoggedin Successfully', 'color: green; font-weight: bold;');
            let {token, user} = resp;
            localStorage.setItem(StorageKeysConsts.TOKEN_KEY, token);
            localStorage.setItem(StorageKeysConsts.USER_KEY, JSON.stringify(user));
            this.isAuthenticatedSubject.next(true);
            resolve(true);
          },(err)=>{
            resolve(false);
          });
        });
    }
  }

  /**
   * Logout user and clear stored data
   */
  logout(): void {
    localStorage.removeItem(StorageKeysConsts.TOKEN_KEY);
    localStorage.removeItem(StorageKeysConsts.USER_KEY);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/signin']);
  }

  /**
   * Get stored user data
   */
  getUserData(): any {
    const userData = localStorage.getItem(StorageKeysConsts.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    return localStorage.getItem(StorageKeysConsts.TOKEN_KEY);
  }

  decodeJwt(token: string): any {
    const payload = token.split('.')[1]; // get the payload part
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  }


  /**
   * Generate a simple token (replace with actual JWT in production)
   */
  private generateToken(): string {
    return 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
