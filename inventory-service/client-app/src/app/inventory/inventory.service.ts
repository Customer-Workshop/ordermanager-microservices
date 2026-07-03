import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryItem } from './inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private readonly baseUrl = '/api/inventory';

  constructor(private http: HttpClient) {}

  getAll(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(this.baseUrl);
  }

  getByProduct(productId: number): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.baseUrl}/product/${productId}`);
  }

  restock(productId: number, quantity: number): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.baseUrl}/product/${productId}/restock`, { quantity });
  }

  getLowStock(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.baseUrl}/low-stock`);
  }
}
