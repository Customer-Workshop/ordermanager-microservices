import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  private apiUrl = `${environment.apiUrl}/api/inventory`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(this.apiUrl);
  }

  getByProductId(productId: number): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl}/product/${productId}`);
  }

  getLowStock(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.apiUrl}/low-stock`);
  }

  restock(productId: number, quantity: number): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.apiUrl}/product/${productId}/restock`, { quantity });
  }

  deductStock(productId: number, quantity: number): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.apiUrl}/product/${productId}/deduct`, { quantity });
  }
}
