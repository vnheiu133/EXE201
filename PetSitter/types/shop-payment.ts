export interface ShopOrder{
  orderId: string,
  shopId: string,
  shopName: string,
  totalAmount: number,
  items: ItemOrder[]
}

export interface ItemOrder{
  itemId: string,
  product: string,
  productName: string,
  productImage: string;
  quantity: number,
  price: number
}