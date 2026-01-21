import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  phosphorGear, 
  phosphorChartBar, 
  phosphorHeadphones, 
  phosphorLightbulb,
  phosphorTrash,
  phosphorPencil
} from '@ng-icons/phosphor-icons/regular';

interface Team {
  id: string;
  name: string;
  description: string;
  members: number;
  color: string;
  icon: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  team: string;
  source: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, NgIcon],
  viewProviders: [provideIcons({ 
    phosphorGear, 
    phosphorChartBar, 
    phosphorHeadphones, 
    phosphorLightbulb,
    phosphorTrash,
    phosphorPencil
  })],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss'
})
export class UserManagement {
  teams: Team[] = [
    {
      id: '1',
      name: 'IT Operations',
      description: 'Infastructure and operational team',
      members: 12,
      color: '#7E68E1',
      icon: 'phosphorGear'
    },
    {
      id: '2',
      name: 'Analytics',
      description: 'Data analyst and reporting team',
      members: 8,
      color: '#8B3A5C',
      icon: 'phosphorChartBar'
    },
    {
      id: '3',
      name: 'Support',
      description: 'Customer Support Team',
      members: 15,
      color: '#22C55E',
      icon: 'phosphorHeadphones'
    },
    {
      id: '4',
      name: 'Development',
      description: 'Development and engineering team',
      members: 20,
      color: '#C2410C',
      icon: 'phosphorLightbulb'
    }
  ];

  users: User[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@justech.com',
      role: 'Superuser',
      team: 'IT Operations',
      source: 'MANUAL',
      status: 'Active',
      lastLogin: '2025-10-24 1:30'
    },
    {
      id: '2',
      username: 'john.doe',
      email: 'john@justech.com',
      role: 'Admin',
      team: 'IT Operations',
      source: 'LDAP',
      status: 'Active',
      lastLogin: '2025-10-24 1:30'
    },
    {
      id: '3',
      username: 'jone.smith',
      email: 'jane@justech.com',
      role: 'User',
      team: 'Analytics',
      source: 'LDAP',
      status: 'Active',
      lastLogin: '2025-10-24 1:30'
    },
    {
      id: '4',
      username: 'bob.wilson',
      email: 'bob@justech.com',
      role: 'Viewer',
      team: 'Support',
      source: 'MANUAL',
      status: 'Inactive',
      lastLogin: '2025-10-24 1:30'
    }
  ];

  deleteTeam(teamId: string): void {
    // Handle team deletion
    console.log('Delete team:', teamId);
  }

  editUser(userId: string): void {
    // Handle user edit
    console.log('Edit user:', userId);
  }

  deleteUser(userId: string): void {
    // Handle user deletion
    console.log('Delete user:', userId);
  }
}
