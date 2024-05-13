import { Component } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { Carpet } from '../../../shared/models/Carpet';
import { CarpetService } from '../../../shared/services/carpet.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-mod',
  templateUrl: './mod.component.html',
  styleUrl: './mod.component.scss'
})
export class ModComponent {

  carpets? : Observable<Carpet[]>;
  carpetForms: FormGroup[] = [];
  fileMap: Map<string, File> = new Map();
  successMessage : string = "";
  errorMessage : string = "";

  constructor(private carpetService : CarpetService, private fb : FormBuilder,  private storage: AngularFireStorage) {}

  ngOnInit(){
    this.carpets = this.carpetService.getAll();
    this.carpets.subscribe(carpets => {
      this.carpetForms = carpets.map(carpet => 
        this.fb.group({
          id: [carpet.id, Validators.required],
          name: [carpet.name, Validators.required],
          type: [carpet.type, Validators.required],
          description: [carpet.description, Validators.required],
          price: [carpet.price, Validators.required],
          rating: [carpet.rating, Validators.required],
          imageUrl: [carpet.imageUrl, Validators.required]
        })
      );
    });
  }

  onDelete(id : string): void{
    this.successMessage = "";
    this.errorMessage = "";

    let imageUrl :string= "";
    this.carpetService.getById(id).subscribe({
      next: carpet => {
        if (carpet?.imageUrl === undefined || !carpet){
          console.error('image url undefined, or no carpet');
          return
        }

        imageUrl = carpet?.imageUrl as string

        this.carpetService.delete(id).then(_ => {
          console.log('Successful carpet delete')

          this.storage.refFromURL(imageUrl).delete().subscribe({
            next: _ => {
              console.log('succesful delete from storage');
              this.successMessage = "Delete successful!"
            },
            error : e => {
              console.error(e)
              "Delete failed!" + e
            }
          });
        }).catch(error => {
          console.error(error);
          this.errorMessage = "Delete failed!" + error
        })
      }

    })
  }


  onSubmit(form: FormGroup): void {
    this.successMessage = "";
    this.errorMessage = "";

    if (form.valid) {
      const carpetId = form.value.id;
      const file = this.fileMap.get(carpetId);
  
      if (file) {
        const filePath = `carpets/${new Date().getTime()}_${file.name}`;
        const fileRef = this.storage.ref(filePath);
        const task = this.storage.upload(filePath, file);
  
        // Handle file upload, then update Firestore document
        task.snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(url => {
              form.patchValue({ imageUrl: url }); // Update image URL in the form
              const carpet : Carpet = 
              {
                id : form.get('id')?.value as string,
                name : form.get('name')?.value as string,
                description : form.get('description')?.value as string,
                price : form.get('price')?.value as number,
                rating : form.get('rating')?.value as number,
                type : form.get('type')?.value as string,
                imageUrl : url
              };
              this.carpetService.update(carpet).then(_ => {
                this.successMessage = "Successfull update!"
              }).catch(error => {
                this.errorMessage = "Update failed!" + error
              });
            });
          })
        ).subscribe();
      } else {
        // No new file, just update Firestore document
        const carpet : Carpet = 
        {
          id : form.get('id')?.value as string,
          name : form.get('name')?.value as string,
          description : form.get('description')?.value as string,
          price : form.get('price')?.value as number,
          rating : form.get('rating')?.value as number,
          type : form.get('type')?.value as string,
          imageUrl : form.get('imageUrl')?.value as string,
        };
        this.carpetService.update(carpet).then(_ => {
          this.successMessage = "Successfull update!"
        }).catch(error => {
          this.errorMessage = "Update failed!" + error
        });
      }
    }
  }

  onFileSelected(event: any, carpetId: string): void {
    const file: File = event.target.files[0];
    if (file) {
      this.fileMap.set(carpetId, file); // Store file temporarily
    }
  }
}
