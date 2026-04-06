import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryItem } from './inventory.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly apiUrl = `${environment.apiUrl}/api/inventory`;

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
