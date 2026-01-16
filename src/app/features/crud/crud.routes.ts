import { Routes } from '@angular/router';
import { CrudComponent } from './components/crud';

export default [
    { path: '', component: CrudComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
