import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard - Protects routes that require authentication
 * Redirects to signin page if user is not authenticated
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  const returnUrl = state.url;
  
  // Redirect to signin page with return URL
  router.navigate(['/signin'], { 
    queryParams: { returnUrl } 
  });
  
  return false;
};

/**
 * Guest Guard - Protects routes that should only be accessible to non-authenticated users
 * Redirects to dashboard if user is already authenticated
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // User is already authenticated, redirect to dashboard
  router.navigate(['/home']);
  return false;
};
