import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  email = new FormControl<string>('', [Validators.required, Validators.email]);
  password = new FormControl<string>('', Validators.required);

  loading: boolean = false;
  error_flag: boolean = false;

  constructor(private router: Router, private authService: AuthService) { }

  async login() {
    this.loading = true;
    this.error_flag = false;

    this.authService.login(this.email.value as string, this.password.value as string).then(cred => {
      console.log(cred);
      this.router.navigateByUrl('/main');
      this.loading = false;
      this.error_flag = false;
    }).catch(error => {
      console.error(error);
      this.loading = false;
      this.error_flag = true
    });
  }

}
