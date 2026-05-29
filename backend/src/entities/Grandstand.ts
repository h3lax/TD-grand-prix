export enum Category {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export interface Grandstand {
  id: number;
  name: string;
  location: string;
  category: Category;
  capacity: number;
  basePrice: number;
  covered: boolean;
}
