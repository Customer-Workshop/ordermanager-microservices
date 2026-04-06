import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  quantityOnHand: number;
  reorderLevel: number;
  warehouseLocation: string;
  lastRestocked: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private apiUrl = '/api/inventory';

  constructor(private http: HttpClient) {}

  getAll(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(this.apiUrl);
  }

  getByProductId(productId: number): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl}/product/${productId}`);
  }

  restock(productId: number, quantity: number): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.apiUrl}/product/${productId}/restock`, { quantity });
  }

  deduct(productId: number, quantity: number): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.apiUrl}/product/${productId}/deduct`, { quantity });
  }

  getLowStock(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/low-stock`);
  }
}
