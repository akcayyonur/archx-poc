import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IntegrationDataSource } from '@shared/models/integration-data.model';
import { DEMO_INTEGRATED_AGENTS } from '@shared/constants/integration-requirements.constants';

@Injectable({
  providedIn: 'root'
})
export class IntegrationStateService {
  private integrationsSubject = new BehaviorSubject<IntegrationDataSource[]>(DEMO_INTEGRATED_AGENTS);
  public integrations$ = this.integrationsSubject.asObservable();

  constructor() {}

  getIntegrations(): IntegrationDataSource[] {
    return this.integrationsSubject.value;
  }

  getIntegrationById(id: string): IntegrationDataSource | undefined {
    return this.integrationsSubject.value.find(i => i.integrationId === id);
  }

  getIntegratedAgentIds(): string[] {
    return this.integrationsSubject.value.map(i => i.agentId);
  }

  addIntegration(integration: IntegrationDataSource): void {
    const current = this.integrationsSubject.value;
    this.integrationsSubject.next([...current, integration]);
  }

  updateIntegration(integrationId: string, updatedIntegration: IntegrationDataSource): void {
    const current = this.integrationsSubject.value;
    const index = current.findIndex(i => i.integrationId === integrationId);
    if (index !== -1) {
      const updated = [...current];
      updated[index] = updatedIntegration;
      this.integrationsSubject.next(updated);
    }
  }

  deleteIntegration(integrationId: string): void {
    const current = this.integrationsSubject.value;
    this.integrationsSubject.next(current.filter(i => i.integrationId !== integrationId));
  }
}

