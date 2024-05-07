import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl, FormBuilder } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {

  error_flag : boolean = false;

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


  constructor(private location: Location, private authService: AuthService, private fb : FormBuilder) { 
    this.signUpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rePassword: ['', [Validators.required]],
      name : this.fb.group({
        firstname : ['', [Validators.required]],
        lastname : ['', [Validators.required]]
      })
    }, { validators: this.passwordMatchValidator() });
  }

  onSubmit() {
    if (this.signUpForm.invalid) {
      Object.keys(this.signUpForm.controls).forEach(key => {
        const control = this.signUpForm.get(key);
        control?.markAsTouched(); // This triggers showing the error messages
      });
      console.error('Invalid rigister form inputs!')
      this.error_flag = true;
      return;
    }

    console.log(this.signUpForm.value);

    this.signUpForm.errors

    this.authService.signup(this.signUpForm.get('email')?.value as string, this.signUpForm.get('password')?.value as string).then(cred => {
      console.log(cred);
      this.error_flag = false;
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
