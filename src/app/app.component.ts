import { Component } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from './shared/services/auth.service';
import { User } from './shared/models/User';
import { UserService } from './shared/services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  page : string = '';
  routes: Array<string> = [];
  loggedInUser?:  firebase.default.User | null;
  userObject?: User | null;

  userSubscription?: Subscription;
  userObjectSubscription?: Subscription;

  constructor(private router: Router, private authService: AuthService, private userService: UserService) {}

  ngOnInit() {
    // Set routes array
    this.routes = this.router.config.map(conf => conf.path) as string[];

    // Set current page after navigation
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((evts: any) => {
      const currentPage = (evts.urlAfterRedirects as string).split('/')[1] as string;
      if (this.routes.includes(currentPage)) {
        this.page = currentPage;
      }
    });

    // Set logged in firebase user and user object
    this.userSubscription = this.authService.isUserLoggedIn().subscribe({
      next : user => {
      this.loggedInUser = user ? user : null;

      if (user){
        this.userObjectSubscription = this.userService.getById(user.uid).subscribe({
          next : (userObject) => {
            this.userObject = userObject;
            localStorage.setItem('userObject', JSON.stringify(userObject));  // Store user object in local storage
            console.log(this.userObject)},
          error: _ => {
            this.userObject = null
            localStorage.removeItem('userObject');
            console.error('Error setting userObject!')
          }
        });
      }
      else{
        this.userObject = null;
        localStorage.removeItem('userObject');
      }
    },
    error : _ => {
      this.loggedInUser = null
      console.error('Error setting loggedInUser!')
    }
    });
  }

  changePage(selectedPage: string) {
    this.router.navigateByUrl(selectedPage);
  }

  // Sidenav functions
  onClose(event: any, sidenav: MatSidenav) {
    if (event === true) {
      sidenav.close();
    }
  }

  onToggleSidenav(sidenav: MatSidenav) {
    sidenav.toggle();
  }

  logout(_?: boolean) {
    this.authService.logout().then(() => {
      this.userObjectSubscription?.unsubscribe();  // IMPORTANT!!! MUST BE BEFORE SETTING NULLS!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      this.loggedInUser = null;
      this.userObject = null;
      localStorage.removeItem('userObject');
      console.log('Logged out successfully.');

      console.log(this.loggedInUser)
      console.log(this.userObject)
    }).catch(error => {
      console.error(error);
    });
  }
}