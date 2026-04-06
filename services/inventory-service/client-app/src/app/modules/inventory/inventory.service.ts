import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InventoryItemDto {
  id: number;
  productId: number;
  product: { id: number; name: string; sku: string; price: number };
  quantityOnHand: number;
  reorderLevel: number;
  warehouseLocation: string;
  lastRestocked: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private readonly baseUrl = '/api/inventory';

  constructor(private http: HttpClient) {}

  getAll(): Observable<InventoryItemDto[]> {
    return this.http.get<InventoryItemDto[]>(this.baseUrl);
  }

  getByProduct(productId: number): Observable<InventoryItemDto> {
    return this.http.get<InventoryItemDto>(`${this.baseUrl}/product/${productId}`);
  }

  restock(productId: number, quantity: number): Observable<InventoryItemDto> {
    return this.http.post<InventoryItemDto>(`${this.baseUrl}/product/${productId}/restock`, { quantity });
  }

  deduct(productId: number, quantity: number): Observable<InventoryItemDto> {
    return this.http.post<InventoryItemDto>(`${this.baseUrl}/product/${productId}/deduct`, { quantity });
  }

  getLowStock(): Observable<InventoryItemDto[]> {
    return this.http.get<InventoryItemDto[]>(`${this.baseUrl}/low-stock`);
  }
}
