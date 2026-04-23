import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormField } from '../../../config/form.types';

@Component({
  selector: 'app-boolean-field',
  standalone: true,
  imports: [MatSlideToggleModule],
  template: `
    <div class="preview-boolean" (click)="$event.stopPropagation(); toggle.emit(field.id)">
      <mat-slide-toggle
        [checked]="checked"
        (change)="valueChange.emit({ fieldId: field.id, value: $event.checked })"
        (click)="$event.stopPropagation()">
        {{ field.label || 'Toggle' }}
      </mat-slide-toggle>
    </div>
  `,
  styles: [`
    .preview-boolean {
      display: flex; align-items: center; padding: 4px 0;
    }
  `],
})
export class BooleanFieldComponent {
  @Input() field!: FormField;
  @Input() checked = false;
  @Output() toggle = new EventEmitter<string>();
  @Output() valueChange = new EventEmitter<{ fieldId: string; value: boolean }>();
}
