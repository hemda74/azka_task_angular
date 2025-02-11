import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideServerRendering } from '@angular/platform-server';

export const config: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideServerRendering(),
  ],
};
