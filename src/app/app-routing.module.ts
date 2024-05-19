import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { adminGuard } from './shared/services/admin.guard';
import { authGuard } from './shared/services/auth.guard';

const routes: Routes = [
  { 
    path: 'main',
    loadChildren: () => import('./pages/main/main.module').then(m => m.MainModule) 
  },
  { 
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
  },
  { 
    path: 'signup',
    loadChildren: () => import('./pages/signup/signup.module').then(m => m.SignupModule) 
  },
  {
    path: 'not-found',
    loadChildren: () => import('./pages/not-found/not-found.module').then(m => m.NotFoundModule)
  },
  { 
    path: 'admin', 
    loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule),
    canActivate: [adminGuard]
  },
  { 
    path: 'cart', 
    loadChildren: () => import('./pages/cart/cart.module').then(m => m.CartModule),
    canActivate: [authGuard]
  },
  { 
    path: 'purchases', 
    loadChildren: () => import('./pages/purchases/purchases.module').then(m => m.PurchasesModule),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: '/main',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/not-found'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
