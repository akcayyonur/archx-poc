import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  phosphorNotePencil, 
  phosphorCalendarPlus, 
  phosphorWarning, 
  phosphorFlag, 
  phosphorCheckCircle, 
  phosphorUserPlus, 
  phosphorLink, 
  phosphorShareNetwork,
  phosphorCaretRight,
  phosphorCaretDown
} from '@ng-icons/phosphor-icons/regular';
import { AnomalyRecord } from '@shared/models/demo-data.model';

export interface ContextMenuAction {
  type: 'createAnnotation' | 'createEvent' | 'severity' | 'priority' | 'status' | 'assignTo' | 'relateSelected' | 'forwardTo';
  value?: string;
  annotation?: string;
}

@Component({
  selector: 'app-anomaly-context-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  viewProviders: [provideIcons({ 
    phosphorNotePencil, 
    phosphorCalendarPlus, 
    phosphorWarning, 
    phosphorFlag, 
    phosphorCheckCircle, 
    phosphorUserPlus, 
    phosphorLink, 
    phosphorShareNetwork,
    phosphorCaretRight,
    phosphorCaretDown
  })],
  templateUrl: './anomaly-context-menu.html',
  styleUrl: './anomaly-context-menu.scss'
})
export class AnomalyContextMenu {
  @Input() visible = false;
  @Input() position = { x: 0, y: 0 };
  @Input() selectedAnomalies: AnomalyRecord[] = [];
  
  @Output() action = new EventEmitter<ContextMenuAction>();
  @Output() close = new EventEmitter<void>();

  activeSubmenu: string | null = null;
  annotationText = '';
  selectedBusinessService = '';
  userSearchText = '';
  selectedForwardOption = '';

  severityOptions = ['Moderate', 'High', 'Critical'];
  priorityOptions = ['High', 'Medium', 'Low'];
  statusOptions = ['Resolved', 'Active', 'Error'];
  forwardOptions = ['Option one', 'Option two', 'Option three'];
  
  availableUsers = ['User 1', 'User 2', 'User 3', 'Admin', 'Developer'];

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.visible && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.visible) {
      this.closeMenu();
    }
  }

  get filteredUsers(): string[] {
    if (!this.userSearchText.trim()) {
      return this.availableUsers;
    }
    return this.availableUsers.filter(u => 
      u.toLowerCase().includes(this.userSearchText.toLowerCase())
    );
  }

  toggleSubmenu(menu: string): void {
    this.activeSubmenu = this.activeSubmenu === menu ? null : menu;
  }

  submitAnnotation(): void {
    if (this.annotationText.trim()) {
      this.action.emit({ type: 'createAnnotation', annotation: this.annotationText });
      this.annotationText = '';
      this.closeMenu();
    }
  }

  confirmAssign(): void {
    if (this.userSearchText.trim()) {
      this.action.emit({ type: 'assignTo', value: this.userSearchText });
      this.closeMenu();
    }
  }

  toggleForwardOption(option: string): void {
    this.selectedForwardOption = option;
  }

  confirmForward(): void {
    if (this.selectedForwardOption) {
      this.action.emit({ type: 'forwardTo', value: this.selectedForwardOption });
      this.closeMenu();
    }
  }

  selectOption(type: ContextMenuAction['type'], value?: string): void {
    this.action.emit({ type, value });
    this.closeMenu();
  }

  closeMenu(): void {
    this.visible = false;
    this.activeSubmenu = null;
    this.annotationText = '';
    this.userSearchText = '';
    this.selectedForwardOption = '';
    this.close.emit();
  }
}
