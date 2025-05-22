export interface ProductImage {
  id: string;
  imageUrl: string;
}

export interface Product {
  id: string;
  storeId: string;
  productName: string;
  description: string | null;
  categoryId: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
}
