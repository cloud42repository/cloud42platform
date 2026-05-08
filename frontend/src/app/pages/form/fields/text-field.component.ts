import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormField } from '../../../config/form.types';
import { DataSourceTagComponent } from './data-source-tag.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-text-field',
  standalone: true,
  imports: [DataSourceTagComponent, MatAutocompleteModule],
  template: `
    <div class="preview-input" [class.field-disabled]="disabled">
      <input [type]="field.masked ? 'password' : 'text'" class="preview-text-input"
             [placeholder]="field.placeholder || field.label || 'Text input'"
             [value]="value"
             [disabled]="disabled"
             (input)="onInput($any($event.target).value)"
             (click)="$event.stopPropagation(); selectField.emit(field.id)"
             [matAutocomplete]="auto" />
      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onOptionSelected($event.option.value)">
        @for (opt of filteredProposals; track opt) {
          <mat-option [value]="opt">{{ opt }}</mat-option>
        }
      </mat-autocomplete>
    </div>
    <app-data-source-tag [field]="field" [boundTableLabel]="boundTableLabel" />
  `,
  styles: [`
    .preview-input {
      border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px;
      background: #f8fafc; display: flex; align-items: center; position: relative;
    }
    .preview-text-input {
      border: none; outline: none; background: transparent;
      color: #1e293b; font-size: 12px; width: 100%; cursor: text;
    }
    .preview-text-input::placeholder { color: #94a3b8; }
    .field-disabled { opacity: 0.5; pointer-events: none; }
  `],
})
export class TextFieldComponent {
  @Input() field!: FormField;
  @Input() value = '';
  @Input() boundTableLabel = '';
  @Input() disabled = false;
  @Input() proposals: string[] = [];
  @Output() inputChange = new EventEmitter<string>();
  @Output() selectField = new EventEmitter<string>();

  filteredProposals: string[] = [];

  onInput(val: string) {
    this.inputChange.emit(val);
    const lower = val.toLowerCase();
    this.filteredProposals = this.proposals.filter(p => p.toLowerCase().includes(lower));
  }

  onOptionSelected(val: string) {
    this.inputChange.emit(val);
  }
}
