import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners, provideAppInitializer } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { SchemaService } from './services/schema.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    provideAppInitializer(() => {
      const schemaService = inject(SchemaService);
      return firstValueFrom(schemaService.load());
    }),
  ]
};
