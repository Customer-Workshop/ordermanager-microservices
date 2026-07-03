import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './product.model';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly baseUrl = '/api/products';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  getByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/category/${category}`);
  }

  create(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product);
  }
}
