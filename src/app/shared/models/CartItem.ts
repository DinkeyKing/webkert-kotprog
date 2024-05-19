
export interface CartItem {
    id : string
    userId : string
    carpetId : string
    amount : number
}

export interface DisplayCartItem {
    carpetName: string;
    amount: number;
    price: number;
    cartItemId: string;
}