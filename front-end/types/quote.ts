export interface QuoteItem {
  id: string;
  product_id: string | null;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount: number; // percentuale, 0-100
}