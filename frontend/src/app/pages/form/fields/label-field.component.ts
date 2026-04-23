import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormField } from '../../../config/form.types';
import { DataSourceTagComponent } from './data-source-tag.component';

@Component({
  selector: 'app-label-field',
  standalone: true,
  imports: [DataSourceTagComponent],
  template: `
    <div class="preview-label-value" (click)="$event.stopPropagation(); selectField.emit(field.id)">
      {{ value || field.placeholder || field.label || 'Label' }}
    </div>
    <app-data-source-tag [field]="field" [boundTableLabel]="boundTableLabel" />
  `,
  styles: [`
    .preview-label-value {
      font-size: 13px; color: #1e293b; padding: 6px 0;
      line-height: 1.5; word-break: break-word;
    }
  `],
})
export class LabelFieldComponent {
  @Input() field!: FormField;
  @Input() value = '';
  @Input() boundTableLabel = '';
  @Output() selectField = new EventEmitter<string>();
}
