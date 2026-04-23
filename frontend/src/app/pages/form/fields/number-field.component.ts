import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormField } from '../../../config/form.types';
import { DataSourceTagComponent } from './data-source-tag.component';

@Component({
  selector: 'app-number-field',
  standalone: true,
  imports: [DataSourceTagComponent],
  template: `
    <div class="preview-input">
      <input type="number" class="preview-text-input"
             [placeholder]="field.placeholder || field.label || '0'"
             [value]="value"
             (input)="inputChange.emit($any($event.target).valueAsNumber)"
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
  `],
})
export class NumberFieldComponent {
  @Input() field!: FormField;
  @Input() value = '';
  @Input() boundTableLabel = '';
  @Output() inputChange = new EventEmitter<number>();
  @Output() selectField = new EventEmitter<string>();
}
