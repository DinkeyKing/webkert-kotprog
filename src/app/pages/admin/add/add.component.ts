import { Component } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, finalize } from 'rxjs';
import { Carpet } from '../../../shared/models/Carpet';
import { CarpetService } from '../../../shared/services/carpet.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss'
})
export class AddComponent {

  addFormGroup : FormGroup
  fileName : string = ""
  file? : File
  uploadPercent?: Observable<number | undefined>
  errorFlag : boolean = false
  successFlag : boolean = false;
  errorMessage : string = "";

  constructor(private fb : FormBuilder, private storage: AngularFireStorage, private carpetService : CarpetService){
    this.addFormGroup = this.fb.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      price: ['', [Validators.required]],
      description: ['', [Validators.required]],
      rating: ['', [Validators.required]]
    })
  }

  onSubmit() {
    this.errorFlag = false;
    this.successFlag = false;
    this.errorMessage = "";
    
    if (this.addFormGroup.invalid){
      this.errorFlag = true;
      console.error('Invalid form!');
      this.errorMessage = "Invalid form!";
      return
    }

    if (this.file) {
      const carpetId = this.carpetService.generateId();

      const filePath = `images/${carpetId}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, this.file);

      // Observing upload progress
      this.uploadPercent = task.percentageChanges();

      // Get notified when the download URL is available
      task.snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe({
              next : url => {
                console.log("Download URL:", url);
                const carpet : Carpet = 
                {
                  id : carpetId,
                  name : this.addFormGroup.get('name')?.value as string,
                  description : this.addFormGroup.get('description')?.value as string,
                  price : this.addFormGroup.get('price')?.value as number,
                  rating : this.addFormGroup.get('rating')?.value as number,
                  type : this.addFormGroup.get('type')?.value as string,
                  imageUrl : url
                };

                this.carpetService.create(carpet).then(_ => {
                  console.log('Carpet added successfully.');
                  this.successFlag = true;

                  this.addFormGroup.reset();
                }).catch(error => {
                  console.error(error);
                  this.errorFlag = true;
                  this.errorMessage = "";
                })
              },
              error : _ => {
              console.error('Url get failed!');
              this.errorFlag = true;
              this.errorMessage = "Url get failed!";
            }
            });
          })
      ).subscribe({
        error : _ => {
          console.error('Image upload failed!')
          this.errorFlag = true;
          this.errorMessage = 'Image upload failed!';
        }
      });
    }
    else{
      console.error('No file provided');
      this.errorFlag = true;
      this.errorMessage = 'No file provided';
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.file = input.files[0];
      this.fileName = this.file.name; // Display the file name
    }
  }

}
