import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Books } from './pages/books/books';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'books', component: Books }
];