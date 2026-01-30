import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor() {}

  /**
   * Format ISO date string to readable format
   * @param dateString ISO date string
   * @param format 'short' | 'medium' | 'long' - default is 'medium'
   * @returns Formatted date string
   */
  formatDate(dateString: string | null | undefined, format: 'short' | 'medium' | 'long' = 'medium'): string {
    if (!dateString) {
      return 'N/A';
    }

    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      switch (format) {
        case 'short':
          // Format: MM/DD/YYYY
          return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
          });
        
        case 'long':
          // Format: Month DD, YYYY at HH:MM AM/PM
          return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        
        case 'medium':
        default:
          // Format: MMM DD, YYYY
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }

  /**
   * Get relative time from now (e.g., "2 hours ago", "3 days ago")
   * @param dateString ISO date string
   * @returns Relative time string
   */
  getRelativeTime(dateString: string | null | undefined): string {
    if (!dateString) {
      return 'N/A';
    }

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInMinutes < 1) {
        return 'Just now';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      } else if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      } else {
        return this.formatDate(dateString, 'medium');
      }
    } catch (error) {
      console.error('Error calculating relative time:', error);
      return 'Invalid Date';
    }
  }

  /**
   * To check the date validation
   * @param day 
   * @param month 
   * @param year 
   * @returns 
   */
  isValidDate(day: number, month: number, year: number): boolean {
    if (!day || !month || !year) return false;

    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1000) return false;

    // Check actual calendar date
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  convertToRequiredDateFormate(
    dateStr: string,
    fromFormat: 'DD-MM-YYYY' | 'YYYY-MM-DD',
    toFormat: 'DD-MM-YYYY' | 'YYYY-MM-DD',
  ): string {
    if (!dateStr) return dateStr;

    let day: string;
    let month: string;
    let year: string;

    // Parse input format
    switch (fromFormat) {
      case 'DD-MM-YYYY': {
        [day, month, year] = dateStr.split('-');
        break;
      }
      case 'YYYY-MM-DD': {
        [year, month, day] = dateStr.split('-');
        break;
      }
      default:
        throw new Error('Unsupported fromFormat');
    }

    // Validate numbers
    if (
      !day || !month || !year ||
      isNaN(+day) || isNaN(+month) || isNaN(+year)
    ) {
      throw new Error(`Invalid date string: ${dateStr}`);
    }

    // Pad values
    day = day.padStart(2, '0');
    month = month.padStart(2, '0');
    year = year.padStart(4, '0');

    // Build output format
    switch (toFormat) {
      case 'DD-MM-YYYY':
        return `${day}-${month}-${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      default:
        throw new Error('Unsupported toFormat');
    }
  }


}
