import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:'',
        redirectTo:'/landing',
        pathMatch:'full'
    },
    {
        path: 'landing',
        loadComponent: () => import('@pages/landing/landing').then(m => m.Landing)
    },
    {
        path: 'login',
        loadComponent: () => import('@pages/login/login').then(m => m.Login)
    },
    {
        path: 'signup',
        loadComponent: () => import('@pages/signup/signup').then(m => m.Signup)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('@pages/dashboard/dashboard').then(m => m.Dashboard)
    },
    {
        path: 'schedules',
        loadComponent: () => import('@pages/schedules/schedules').then(m => m.Schedules)
    },
    {
        path: 'fields/tech',
        loadComponent: () => import('@pages/fields/tech/tech').then(m => m.Tech)
    },
    {
        path: 'fields/business',
        loadComponent: () => import('@pages/fields/tech/tech').then(m => m.Tech) // Using Dashboard as placeholder for now
    },
    {
        path: 'fields/operations',
        loadComponent: () => import('@pages/fields/tech/tech').then(m => m.Tech) // Using Dashboard as placeholder for now
    },
    {
        path: 'fields/security',
        loadComponent: () => import('@pages/fields/tech/tech').then(m => m.Tech) // Using Dashboard as placeholder for now
    },
    {
        path: 'integration',
        loadComponent: () => import('@pages/integration/integration').then(m => m.Integration)
    },
    {
        path: 'integration/new',
        loadComponent: () => import('@pages/new-integration/new-integration').then(m => m.NewIntegration)
    },
    {
        path: 'agents-overview',
        loadComponent: () => import('@pages/agents-overview/agents-overview').then(m => m.AgentsOverview)
    },
    {
        path: 'agent-health/:agentId',
        loadComponent: () => import('@pages/agent-health/agent-health').then(m => m.AgentHealth)
    },
    {
        path: 'agent-core/:agentId',
        loadComponent: () => import('@pages/agent-core/agent-core').then(m => m.AgentCore)
    },
    {
        path: 'anomaly-insights',
        loadComponent: () => import('@pages/anomaly-insights/anomaly-insights').then(m => m.AnomalyInsights)
    },
    {
        path: 'platform-settings',
        loadComponent: () => import('@pages/platform-settings/platform-settings').then(m => m.PlatformSettings),
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: () => import('@pages/platform-settings/tabs/platform-dashboard/platform-dashboard').then(m => m.PlatformDashboard)
            },
            {
                path: 'user-management',
                loadComponent: () => import('@pages/platform-settings/tabs/user-management/user-management').then(m => m.UserManagement)
            },
            {
                path: 'reporting',
                loadComponent: () => import('@pages/platform-settings/tabs/reporting/reporting').then(m => m.Reporting)
            },
            {
                path: 'security-kvkk',
                loadComponent: () => import('@pages/platform-settings/tabs/security/security').then(m => m.Security)
            },
            {
                path: 'certificates',
                loadComponent: () => import('@pages/platform-settings/tabs/certificates/certificates').then(m => m.Certificates)
            },
            {
                path: 'license',
                loadComponent: () => import('@pages/platform-settings/tabs/license/license').then(m => m.License)
            }
        ]
    },
    {
        path: 'anomaly-detail/:anomalyId',
        loadComponent: () => import('@pages/anomaly-detail/anomaly-detail').then(m => m.AnomalyDetail)
    },
    {
        path: 'entity-insights/:entityId',
        loadComponent: () => import('@pages/entity-insights/entity-insights').then(m => m.EntityInsights)
    } 
];
