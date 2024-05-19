import { Component } from '@angular/core';
import { Carpet } from '../../shared/models/Carpet';
import { CarpetService } from '../../shared/services/carpet.service';
import { Observable, Subscription, debounceTime, map, startWith, switchMap } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartItem } from '../../shared/models/CartItem';
import { CartItemService } from '../../shared/services/cart-item.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  //carpets? : Observable<Carpet[]>
  filteredCarpets? : Observable<Carpet[]>
  carpetCount : number = 0
  searchForm: FormGroup;
  cartForms: FormGroup[] = [];
  carpetsSubscription? : Subscription
  cartMessage : string[] = []
  cartError : string[] = []

  constructor(private carpetService : CarpetService, private fb: FormBuilder, private cartItemService : CartItemService, private router : Router) {
    this.searchForm = this.fb.group({
      search: [''],
      sortField: ['name'],
      sortOrder: ['asc']
    });
  }

  ngOnInit(){
    this.filteredCarpets = this.searchForm.valueChanges.pipe(
      startWith(this.searchForm.value),
      debounceTime(300),
      switchMap(formValue =>
        this.carpetService.getOrderedBy(formValue.sortField, formValue.sortOrder)
      ),
      map(carpets => carpets.filter(carpet => carpet.name.toLowerCase().includes(this.searchForm.get('search')?.value.toLowerCase())))
    );

    // Get displayed carpet array length
    this.carpetsSubscription = this.filteredCarpets?.subscribe({
      next: carpets => {
        this.cartError = []
        this.cartMessage = []
        this.carpetCount = carpets.length;
        this.cartForms = carpets.map(carpet => this.fb.group({
          id: [carpet.id],
          amount: [1, Validators.min(1)],
          carpetName: [carpet.name]
        }));
      },
      error : e => console.error(e.message)
      
    });
  }

  onCarted(cartForm : FormGroup, index : number){
    this.cartMessage[index] = "";
    this.cartError[index] = "";
    console.log('carted: ' + cartForm.get('id')?.value as string);

    if (cartForm.invalid){
      this.cartError[index] = '"Add to cart failed! Amount must be at least 1.';
      return
    }

    const user = JSON.parse(localStorage.getItem('userObject') as string);
    if (user) {
      const cartItem : CartItem = 
      {
        userId : user.id,
        carpetId : cartForm.get('id')?.value,
        amount : cartForm.get('amount')?.value,
        id : ""                                 // Id is set by service
      }
      this.cartItemService.create(cartItem).then(_ => {
        this.cartMessage[index]  = "Carpet added to cart!"
      }).catch(e => {
        console.error(e.message);
        this.cartError[index]  = "Add to cart failed! " + e.message;
      });
    }
    else {
      this.router.navigateByUrl('/login');  // Redirect to login if no user
    }

  }

  ngOnDestroy(){
    this.carpetsSubscription?.unsubscribe();
  }
}
