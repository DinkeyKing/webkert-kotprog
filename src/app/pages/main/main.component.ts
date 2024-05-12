import { Component } from '@angular/core';
import { Carpet } from '../../shared/models/Carpet';
import { CarpetService } from '../../shared/services/carpet.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  carpets? : Observable<Carpet[]>

  constructor(private carpetService : CarpetService) {}

  ngOnInit(){
    this.carpets = this.carpetService.getAll();
  }
}
