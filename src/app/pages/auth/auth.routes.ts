import { Routes } from '@angular/router';
import { Access } from './access';
import { LoginComponent } from './login';
import { Error } from './error';
import { noAuthGuard } from '@core/auth';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] } // Prevent authenticated users from accessing login
] as Routes;
