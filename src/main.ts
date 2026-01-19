import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import { appConfig } from './app.config';
import { AppComponent } from './app.component';

// Register Vietnamese locale data for date/currency formatting
registerLocaleData(localeVi, 'vi');

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
