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
  carpets? : Observable<Carpet[]>
  carpetForms: FormGroup[] = [];
  fileMap: Map<string, File> = new Map();

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

  onSubmit(form: FormGroup): void {
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
              this.carpetService.update(carpet);
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
        this.carpetService.update(carpet);
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
