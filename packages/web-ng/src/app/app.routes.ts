import { Routes } from '@angular/router';
import { AnimalsPage } from './modules/animals/animals-page';

export const routes: Routes = [
  { path: 'animals', component: AnimalsPage },
  { path: '', redirectTo: 'animals', pathMatch: 'full' },
];
