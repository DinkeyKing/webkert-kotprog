import { Component } from '@angular/core';
import { Carpet } from '../../shared/models/Carpet';
import { CarpetService } from '../../shared/services/carpet.service';
import { Observable, debounceTime, map, startWith, switchMap } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  carpets? : Observable<Carpet[]>
  filteredCarpets? : Observable<Carpet[]>
  carpetCount : number = 0
  searchForm: FormGroup;

  constructor(private carpetService : CarpetService, private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      search: ['']
    });
  }

  ngOnInit(){

    this.carpets = this.carpetService.getAll();

      // Using switchMap to handle the search operation
      this.filteredCarpets = this.searchForm.get('search')?.valueChanges.pipe(
        startWith(''), // Start with no filter
        debounceTime(300), // Optional: Debounce time to limit requests for fast typing
        switchMap(text => this.filterCarpets(text) as Observable<any[]>) // Using switchMap to filter carpets
      );


    // Get displayed carpet array length
    this.filteredCarpets?.subscribe({
      next: c => this.carpetCount = c.length
    });
  }

  filterCarpets(text: string): Observable<any[]> | undefined {
    return this.carpets?.pipe(
      map(carpets => carpets.filter(carpet => 
        carpet.name.toLowerCase().includes(text.toLowerCase())
      ))
    );
  }
}
