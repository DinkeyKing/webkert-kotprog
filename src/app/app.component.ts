import { Component } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  page : string = '';
  routes: Array<string> = [];
  loggedInUser?: firebase.default.User | null;

  constructor(private router: Router, private authService: AuthService) {}

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

    // Store current user in local storage
    this.authService.isUserLoggedIn().subscribe(user => {
      console.log(user);
      this.loggedInUser = user;
      localStorage.setItem('user', JSON.stringify(this.loggedInUser));
    }, error => {
      console.error(error);
      localStorage.setItem('user', JSON.stringify('null'));
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
      console.log('Logged out successfully.');
    }).catch(error => {
      console.error(error);
    });
  }
}