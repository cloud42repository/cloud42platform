import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormField } from '../../../config/form.types';
import { DataSourceTagComponent } from './data-source-tag.component';

@Component({
  selector: 'app-text-field',
  standalone: true,
  imports: [DataSourceTagComponent],
  template: `
    <div class="preview-input" [class.field-disabled]="disabled">
      <input [type]="field.masked ? 'password' : 'text'" class="preview-text-input"
             [placeholder]="field.placeholder || field.label || 'Text input'"
             [value]="value"
             [disabled]="disabled"
             (input)="inputChange.emit($any($event.target).value)"
             (click)="$event.stopPropagation(); selectField.emit(field.id)" />
    </div>
    <app-data-source-tag [field]="field" [boundTableLabel]="boundTableLabel" />
  `,
  styles: [`
    .preview-input {
      border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px;
      background: #f8fafc; display: flex; align-items: center;
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
  @Output() inputChange = new EventEmitter<string>();
  @Output() selectField = new EventEmitter<string>();
}
