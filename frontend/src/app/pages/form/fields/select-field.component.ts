import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormField } from '../../../config/form.types';
import { DataSourceTagComponent } from './data-source-tag.component';

@Component({
  selector: 'app-select-field',
  standalone: true,
  imports: [CommonModule, MatIconModule, DataSourceTagComponent],
  template: `
    <div class="select-wrapper" [class.field-disabled]="disabled" (click)="$event.stopPropagation()">
      <select class="native-select"
              [value]="value"
              [disabled]="disabled"
              (change)="valueChange.emit($any($event.target).value)">
        <option value="" disabled selected>{{ field.placeholder || 'Select…' }}</option>
        @for (opt of options; track $index) {
          <option [value]="opt.value">{{ opt.display }}</option>
        }
      </select>
      <span class="select-arrow">▾</span>
    </div>
    <app-data-source-tag [field]="field" />
    @if (field.lastData && isArray(field.lastData) && options.length > 0) {
      <div class="select-options-preview">
        @for (opt of options; track $index) {
          <div class="select-option-item">
            <span class="option-label">{{ opt.display }}</span>
            <span class="option-value">{{ opt.value }}</span>
          </div>
        }
        @if (totalCount > options.length) {
          <div class="select-option-more">+{{ totalCount - options.length }} more</div>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .select-wrapper {
      position: relative; display: flex; align-items: center;
      border: 1px solid #e2e8f0; border-radius: 6px;
      background: #f8fafc; padding: 0;
    }
    .native-select {
      width: 100%; border: none; outline: none; background: transparent;
      color: #1e293b; font-size: 12px; padding: 8px 28px 8px 12px;
      appearance: none; cursor: pointer;
    }
    .select-arrow {
      position: absolute; right: 10px; pointer-events: none;
      color: #94a3b8; font-size: 14px;
    }

    .select-options-preview {
      margin-top: 4px; border: 1px solid #e2e8f0; border-radius: 6px;
      max-height: 120px; overflow-y: auto; background: white;
    }
    .select-option-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 5px 10px; font-size: 11px; border-bottom: 1px solid #f1f5f9;
    }
    .select-option-item:last-child { border-bottom: none; }
    .select-option-item:hover { background: #f0f9ff; }
    .option-label { color: #1e293b; font-weight: 500; }
    .option-value { color: #94a3b8; font-size: 10px; font-family: monospace; }
    .select-option-more {
      padding: 4px 10px; font-size: 10px; color: #64748b;
      text-align: center; background: #f8fafc;
      border-top: 1px solid #e2e8f0; border-radius: 0 0 6px 6px;
    }
    .field-disabled { opacity: 0.5; pointer-events: none; }
  `],
})
export class SelectFieldComponent {
  @Input() field!: FormField;
  @Input() value = '';
  @Input() options: { display: string; value: string }[] = [];
  @Input() totalCount = 0;
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();

  isArray(data: unknown): boolean { return Array.isArray(data); }
}
