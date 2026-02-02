import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { ApiService } from './shared/services/api.service';
import { FileCreationService } from './shared/services/file-creation.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: (apiService: ApiService) =>{ return () => apiService.load() },
      deps: [ApiService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (fileCreationService: FileCreationService) =>{ return () => fileCreationService.load() },
      deps: [FileCreationService],
      multi: true
    }
  ]
};
