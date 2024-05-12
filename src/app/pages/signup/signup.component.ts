import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl, FormBuilder } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { Location } from '@angular/common';
import { UserService } from '../../shared/services/user.service';
import { User } from '../../shared/models/User';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {

  error_flag : boolean = false;
  required_error_flag : boolean = false;

  // signUpForm = new FormGroup({
  //   email: new FormControl('', [Validators.required, Validators.email]),
  //   password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  //   rePassword: new FormControl('', [Validators.required]),
  //   name: new FormGroup({
  //     firstname: new FormControl('', Validators.required),
  //     lastname: new FormControl('', Validators.required)
  //   }, {validators : this.passwordMatchValidator})
  // });


  signUpForm : FormGroup


  constructor(private location: Location, private authService: AuthService, private fb : FormBuilder, private userService: UserService, private router: Router) { 
    this.signUpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rePassword: ['', [Validators.required]],
      isAdmin : [false],
      name : this.fb.group({
        firstname : ['', [Validators.required]],
        lastname : ['', [Validators.required]]
      })
    }, { validators: this.passwordMatchValidator() });
  }


  markAllAsTouched(control: AbstractControl) {
    if (control instanceof FormGroup) {
      Object.values(control.controls).forEach(c => this.markAllAsTouched(c)); // Recurse into another FormGroup
    } else {
      control.markAsTouched();

      if (control?.errors?.['required']){
        this.required_error_flag = true;
      }
    }
  }


  onSubmit() {
    this.required_error_flag = false;
    this.error_flag = false;

    if (this.signUpForm.invalid) {
      this.markAllAsTouched(this.signUpForm)

      console.error('Invalid rigister form inputs!')
      this.error_flag = true;
      return;
    }

    console.log(this.signUpForm.value);

    this.signUpForm.errors

    this.authService.signup(this.signUpForm.get('email')?.value as string, this.signUpForm.get('password')?.value as string).then(cred => {
      console.log(cred);
      this.error_flag = false;

      // Add user
      const user: User = {
        id: cred.user?.uid as string,
        email: this.signUpForm.get('email')?.value as string,
        username: (this.signUpForm.get('email')?.value as string).split('@')[0],
        name: {
          firstname: this.signUpForm.get('name.firstname')?.value as string,
          lastname: this.signUpForm.get('name.lastname')?.value as string
        },
        is_admin : this.signUpForm.get('isAdmin')?.value as boolean
      };
      this.userService.create(user).then(_ => {
        console.log('User added successfully.');
        this.router.navigateByUrl('/main');  // Go to main

      }).catch(error => {
        console.error(error);
      })

    }).catch(error => {
      this.error_flag = true;
      console.error(error);
    });
  }

  goBack() {
    this.location.back();
  }


  passwordMatchValidator(): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
       // Ensure the control is a FormGroup
      if (!(formGroup instanceof FormGroup)) return null;

      const password = formGroup.get('password');
      const confirmPassword = formGroup.get('rePassword');
      if (!password || !confirmPassword) {
        return null; // Return null if controls haven't initialised yet
      }
  
      const valid : boolean = password.value === confirmPassword.value;
      return valid ? null : { 'passwordMismatch': true };
    };
  }
}
