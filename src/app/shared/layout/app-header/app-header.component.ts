import { Component, ElementRef, ViewChild } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeToggleButtonComponent } from '../../components/common/theme-toggle/theme-toggle-button.component';
import { NotificationDropdownComponent } from '../../components/header/notification-dropdown/notification-dropdown.component';
import { UserDropdownComponent } from '../../components/header/user-dropdown/user-dropdown.component';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterModule,
    ThemeToggleButtonComponent,
    NotificationDropdownComponent,
    UserDropdownComponent,
  ],
  templateUrl: './app-header.component.html',
})
export class AppHeaderComponent {
  isApplicationMenuOpen = false;
  os : string = 'Other';
  readonly isMobileOpen$;

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(public sidebarService: SidebarService) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }
  private getOS(): 'win' | 'mac' | 'other' {
    const ua = window.navigator.userAgent;
    if (/Windows/i.test(ua)) return 'win';
    if (/Mac OS|Macintosh|MacIntel/i.test(ua)) return 'mac';
    return 'other';
  }

  ngOnInit(){
     this.os = this.getOS();
  }


  handleToggle() {
    if (window.innerWidth >= 1280) {
      this.sidebarService.toggleExpanded();
    } else {
      if(this.isApplicationMenuOpen) this.isApplicationMenuOpen = false;
      this.sidebarService.toggleMobileOpen();
    }
  }

  toggleApplicationMenu() {
    this.isApplicationMenuOpen = !this.isApplicationMenuOpen;
  }

  ngAfterViewInit() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
    }
  };
}
