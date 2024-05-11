import { CanActivateFn } from '@angular/router';
import { User } from '../models/User';

export const adminGuard: CanActivateFn = (route, state) => {
  const userJson : string | null = localStorage.getItem('userObject')

  //console.log(userJson)

  if (userJson && !(userJson === undefined)){
    console.log(userJson)
    const user : User = JSON.parse(userJson)
    if (user){
      return user.is_admin;
    }
  }

  console.error('No user found by guard!')

  return false;
};
