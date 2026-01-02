import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiEndpointsConsts } from '../constants/api-endpoints.constants';

export interface UserRole {
  role_id: number;
  name: string;
}

export interface UserMenu {
  menu_id: number;
  menu_group_id: number;
  name: string;
  path: string;
  icon: string;
  order?: number | null;
  status: string;
}

export interface User {
  user_id?: number;
  full_name: string;
  username: string;
  password?: string;
  user_type_id: number;
  role_ids?: number[];
  menu_ids?: number[];
  roles?: UserRole[] | string[];
  menus?: UserMenu[] | string[];
  role_names?: string;
  menu_names?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface UserCreatePayload {
  full_name: string;
  username: string;
  password: string;
  user_type_id: number;
  role_ids: number[];
  menu_ids?: number[];
}

export interface UserUpdatePayload {
  full_name: string;
  username: string;
  password?: string;
  user_type_id: number;
  role_ids: number[];
  menu_ids?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private endpoint = ApiEndpointsConsts.USERS;

  constructor(private apiService: ApiService) { }

  /**
   * Get all users
   * @returns Observable<User[]>
   */
  getUsers(): Observable<User[]> {
    return this.apiService.get(this.endpoint, {}, true);
  }

  /**
   * Get user by ID
   * @param id User ID
   * @returns Observable<User>
   */
  getUserById(id: string): Observable<User> {
    return this.apiService.get(`${this.endpoint}/${id}`, {}, true);
  }

  /**
   * Create new user
   * @param payload User data
   * @returns Observable<any>
   */
  createUser(payload: UserCreatePayload): Observable<any> {
    return this.apiService.post(this.endpoint, payload, true);
  }

  /**
   * Update user
   * @param id User ID
   * @param payload User data
   * @returns Observable<any>
   */
  updateUser(id: string, payload: UserUpdatePayload): Observable<any> {
    return this.apiService.put(`${this.endpoint}/${id}`, payload, true);
  }

  /**
   * Delete user
   * @param id User ID
   * @returns Observable<any>
   */
  deleteUser(id: string): Observable<any> {
    return this.apiService.delete(`${this.endpoint}/${id}`, true);
  }
}
