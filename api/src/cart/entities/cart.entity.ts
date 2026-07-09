export interface CartItem {
  productId: number;
  title: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

export interface Cart {
  userId: number;
  items: CartItem[];
  updatedAt: string;
}
