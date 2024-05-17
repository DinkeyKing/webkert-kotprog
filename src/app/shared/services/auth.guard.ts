import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const user = JSON.parse(localStorage.getItem('userObject') as string);
  if (user) {
    return true;
  }
  return false;
};
