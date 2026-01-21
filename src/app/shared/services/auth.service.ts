import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, throwError, delay } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  field: string;
  company: string;
  country: string;
  city: string;
  organizationalUnit: string;
  phone: string;
  role: string;
  notes: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  email: string;
  firstName: string;
  lastName: string;
  field: string;
}

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  field: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        this.clearAuth();
      }
    }
  }

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    console.log('Login request:', loginRequest);
    
    // Static login for demo (username: admin, password: admin)
    if (loginRequest.email === 'admin' && loginRequest.password === 'admin') {
      const mockResponse: AuthResponse = {
        token: 'demo-token-' + Date.now(),
        type: 'Bearer',
        email: 'admin@archx.com',
        firstName: 'Admin',
        lastName: 'User',
        field: 'tech'
      };
      
      return of(mockResponse).pipe(
        delay(500), // Simulate network delay
        tap(response => {
          this.storeAuth(response);
        })
      );
    }
    
    // Return error for invalid credentials
    return throwError(() => ({ 
      status: 401, 
      message: 'Invalid credentials' 
    })).pipe(delay(500));
  }

  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, registerRequest)
      .pipe(
        tap(response => {
          this.storeAuth(response);
        })
      );
  }

  logout(): void {
    this.clearAuth();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private storeAuth(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    const user: User = {
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      field: response.field
    };
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
} 