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
  private baseUrl = `${environment.apiUrl}/api/inventory`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(this.baseUrl);
  }

  getByProductId(productId: number): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.baseUrl}/product/${productId}`);
  }

  restock(productId: number, quantity: number): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.baseUrl}/product/${productId}/restock`, { quantity });
  }

  getLowStock(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.baseUrl}/low-stock`);
  }
}
