import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss'
})
export class AddComponent {
  addFormGroup : FormGroup

  constructor(private fb : FormBuilder){
    this.addFormGroup = this.fb.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      price: ['', [Validators.required]],
      description: ['', [Validators.required]],
      rating: ['', [Validators.required]]
    })
  }

  onSubmit() {
    throw new Error('Method not implemented.');
    }
}
