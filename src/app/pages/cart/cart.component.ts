import { Component } from '@angular/core';
import { EMPTY, Observable, catchError, map, of, startWith } from 'rxjs';
import { CartItem, DisplayCartItem } from '../../shared/models/CartItem';
import { CartItemService } from '../../shared/services/cart-item.service';
import { CarpetService } from '../../shared/services/carpet.service';
import { Carpet } from '../../shared/models/Carpet';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  displayCartItems$!: Observable<DisplayCartItem[]>;

  constructor(private cartService: CartItemService) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('userObject') || '{}');

    if (!user){
      console.error('User not found!');
    }

    console.log(user.id);

    this.cartService.getDisplayCartItems(user.id)
    this.displayCartItems$ = this.cartService.cartItems$;

    this.displayCartItems$.subscribe({
      next : c => {
        //console.log('Found stuff');
        //console.log(c);
      },
      error : e => {
        console.error(e.message);
      }
    });
  }
}
