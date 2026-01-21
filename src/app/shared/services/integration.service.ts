import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ServiceModel {
  id: string;
  name: string;
  description?: string;
  availableMonitoringScopes: MonitoringScope[];
  availableSensitivityLevels: SensitivityLevel[];
}

export interface MonitoringScope {
  id: string;
  name: string;
  description?: string;
}

export interface SensitivityLevel {
  id: string;
  name: string;
  icon: string;
  color: string;
  severityOrder: number;
  description?: string;
}

export interface UserIntegration {
  id: number;
  serviceModel: ServiceModel;
  name?: string;
  description?: string;
  status: IntegrationStatus;
  createdAt: string;
  updatedAt: string;
  selectedMonitoringScopes: MonitoringScope[];
  selectedSensitivityLevels: SensitivityLevel[];
}

export interface CreateUserIntegrationRequest {
  serviceModelId: string;
  name?: string;
  description?: string;
  selectedMonitoringScopes: string[];
  selectedSensitivityLevels: string[];
}

export enum IntegrationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  ERROR = 'ERROR'
}

@Injectable({
  providedIn: 'root'
})
export class IntegrationService {
  private apiUrl = `${environment.apiUrl}/integrations`;

  constructor(private http: HttpClient) { }

  // Get all available service models with their monitoring scopes and sensitivity levels
  getServiceModels(): Observable<ServiceModel[]> {
    return this.http.get<ServiceModel[]>(`${this.apiUrl}/service-models`);
  }

  // Get specific service model by ID
  getServiceModelById(id: string): Observable<ServiceModel> {
    return this.http.get<ServiceModel>(`${this.apiUrl}/service-models/${id}`);
  }

  // Get all monitoring scopes
  getMonitoringScopes(): Observable<MonitoringScope[]> {
    return this.http.get<MonitoringScope[]>(`${this.apiUrl}/monitoring-scopes`);
  }

  // Get all sensitivity levels
  getSensitivityLevels(): Observable<SensitivityLevel[]> {
    return this.http.get<SensitivityLevel[]>(`${this.apiUrl}/sensitivity-levels`);
  }

  // Get current user's integrations
  getMyIntegrations(): Observable<UserIntegration[]> {
    return this.http.get<UserIntegration[]>(`${this.apiUrl}/my-integrations`);
  }

  // Get specific user integration by ID
  getMyIntegrationById(id: number): Observable<UserIntegration> {
    return this.http.get<UserIntegration>(`${this.apiUrl}/my-integrations/${id}`);
  }

  // Create new integration for current user
  createIntegration(request: CreateUserIntegrationRequest): Observable<UserIntegration> {
    return this.http.post<UserIntegration>(`${this.apiUrl}/my-integrations`, request);
  }

  // Update integration status
  updateIntegrationStatus(id: number, status: IntegrationStatus): Observable<UserIntegration> {
    return this.http.put<UserIntegration>(`${this.apiUrl}/my-integrations/${id}/status`, { status });
  }

  // Update integration (monitoring scopes and sensitivity levels)
  updateIntegration(id: string, request: any): Observable<UserIntegration> {
    return this.http.put<UserIntegration>(`${this.apiUrl}/my-integrations/${id}`, request);
  }

  // Delete user integration
  deleteIntegration(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/my-integrations/${id}`);
  }
}
