import { Component, OnInit } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { AuthService } from '../../../services/auth.service';
import { StorageKeysConsts } from '../../../constants/storage-keys';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  imports:[CommonModule, RouterModule, DropdownComponent, DropdownItemTwoComponent]
})
export class UserDropdownComponent implements OnInit {
  isOpen = false;
  userInfo: any = null;

  constructor(private authService: AuthService) {}
  ngOnInit(){
    this.userInfo = JSON.parse(localStorage.getItem(StorageKeysConsts.USER_KEY) || '{}');
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  signOut() {
    this.closeDropdown();
    this.authService.logout();
  }
}