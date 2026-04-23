import {
  Component, Inject, AfterViewInit, OnDestroy, ElementRef, ViewChild, signal, NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MODULES, extractPathParams } from '../config/endpoints';

declare const monaco: any;

export interface ScriptEditorDialogData {
  code: string;
  title?: string;
  /** Extra global variables available in the script (e.g. { value: 'string', FormFields: 'Record<string, unknown>' }) */
  extraGlobals?: Record<string, string>;
}

@Component({
  selector: 'app-script-editor-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="editor-dialog">
      <div class="editor-header">
        <span class="title-group"><mat-icon>code</mat-icon> {{ data.title || 'Script Editor' }}</span>
        <button mat-icon-button class="close-btn" (click)="cancel()"><mat-icon>close</mat-icon></button>
      </div>
      <div class="editor-body" #editorContainer>
        @if (loadError()) {
          <div class="editor-error">
            <mat-icon>error_outline</mat-icon>
            <span>Failed to load editor: {{ loadError() }}</span>
          </div>
        }
      </div>
      <div class="editor-footer">
        <button mat-stroked-button (click)="cancel()">Cancel</button>
        <button mat-flat-button color="primary" (click)="save()">
          <mat-icon>check</mat-icon> Apply
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; width: 100%; }
    .editor-dialog { display: flex; flex-direction: column; flex: 1; min-height: 0; width: 100%; }
    .editor-header {
      display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 16px;
      background: #1e1e1e; color: #d4d4d4; font-weight: 600; font-size: 14px;
      position: relative; flex-shrink: 0;
    }
    .editor-header .title-group { display: flex; align-items: center; gap: 8px; }
    .editor-header .close-btn { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); color: #d4d4d4; }
    .editor-body { flex: 1; min-height: 0; position: relative; }
    .editor-error {
      display: flex; align-items: center; gap: 8px; padding: 24px;
      color: #f87171; background: #1e1e1e; height: 100%;
    }
    .editor-footer {
      display: flex; justify-content: flex-end; gap: 8px; padding: 10px 16px;
      border-top: 1px solid #e2e8f0; background: #fafafa; flex-shrink: 0;
    }
  `],
})
export class ScriptEditorDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef<HTMLDivElement>;
  private editor: any;
  loadError = signal('');

  constructor(
    public dialogRef: MatDialogRef<ScriptEditorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ScriptEditorDialogData,
    private hostEl: ElementRef,
    private zone: NgZone,
  ) {}

  ngAfterViewInit() {
    this.loadMonaco().then(() => {
      this.zone.runOutsideAngular(() => this.initEditor());
    }).catch((err) => {
      this.zone.run(() => this.loadError.set(String(err?.message || err)));
    });
  }

  ngOnDestroy() {
    this.editor?.dispose();
  }

  private loadMonaco(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof monaco !== 'undefined') { resolve(); return; }
      const script = document.createElement('script');
      script.src = '/assets/monaco/vs/loader.js';
      script.onerror = () => reject(new Error('Failed to load Monaco loader'));
      script.onload = () => {
        const monacoRequire = (window as any).require;
        if (!monacoRequire?.config) { reject(new Error('AMD require not available')); return; }
        monacoRequire.config({ paths: { vs: '/assets/monaco/vs' } });
        monacoRequire(['vs/editor/editor.main'], () => resolve(),
          (err: any) => reject(err));
      };
      document.head.appendChild(script);
    });
  }

  private initEditor() {
    this.registerCompletions();

    this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
      value: this.data.code || '',
      language: 'javascript',
      theme: 'vs-dark',
      minimap: { enabled: false },
      automaticLayout: true,
      fontSize: 13,
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      tabSize: 2,
      wordWrap: 'on',
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      parameterHints: { enabled: true },
      fixedOverflowWidgets: true,
    });

    // Force layout once the dialog animation finishes, then focus
    setTimeout(() => {
      this.editor?.layout();
      this.editor?.focus();
    }, 400);
  }

  private registerCompletions() {
    // Build type declarations for all API modules
    const typeDeclarations = this.buildTypeDeclarations();

    // Add extra lib so JS IntelliSense knows about our globals
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      allowJs: true,
      checkJs: false,
    });
    monaco.languages.typescript.javascriptDefaults.addExtraLib(typeDeclarations, 'cloud42-api.d.ts');

    // Register a completion provider for dot-access on module names
    monaco.languages.registerCompletionItemProvider('javascript', {
      triggerCharacters: ['.'],
      provideCompletionItems: (model: any, position: any) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        const suggestions: any[] = [];

        // Check if typing after a module name e.g. "ZohoBooks."
        const dotMatch = textUntilPosition.match(/(\w+)\.(\w*)$/);
        if (dotMatch) {
          const moduleName = dotMatch[1];
          const partial = (dotMatch[2] || '').toLowerCase();
          for (const mod of MODULES) {
            const proxyName = mod.label.split(/\s+/).join('');
            if (proxyName === moduleName) {
              for (const ep of mod.endpoints) {
                const methodName = ep.label.split(/\s+/).join('');
                if (!partial || methodName.toLowerCase().includes(partial)) {
                  const params = extractPathParams(ep.pathTemplate);
                  const hasBody = ep.hasBody ?? false;
                  const sig = this.buildSignature(params, hasBody);
                  suggestions.push({
                    label: methodName,
                    kind: monaco.languages.CompletionItemKind.Method,
                    insertText: `${methodName}(${this.buildSnippetArgs(params, hasBody)})`,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    detail: `${ep.method} ${ep.pathTemplate}`,
                    documentation: `${ep.label}\n\n${sig}`,
                    range: {
                      startLineNumber: position.lineNumber,
                      startColumn: position.column - (dotMatch[2]?.length || 0),
                      endLineNumber: position.lineNumber,
                      endColumn: position.column,
                    },
                  });
                }
              }
              break;
            }
          }
        }

        // Top-level: module names + globals
        if (!dotMatch) {
          const wordMatch = textUntilPosition.match(/(\w+)$/);
          const partial = (wordMatch?.[1] || '').toLowerCase();

          for (const mod of MODULES) {
            const proxyName = mod.label.split(/\s+/).join('');
            if (!partial || proxyName.toLowerCase().includes(partial)) {
              suggestions.push({
                label: proxyName,
                kind: monaco.languages.CompletionItemKind.Module,
                insertText: proxyName,
                detail: `${mod.endpoints.length} endpoints`,
                documentation: mod.label,
              });
            }
          }

          // Extra globals
          if (this.data.extraGlobals) {
            for (const [name, type] of Object.entries(this.data.extraGlobals)) {
              if (!partial || name.toLowerCase().includes(partial)) {
                const isFunc = type.startsWith('(');
                suggestions.push({
                  label: name,
                  kind: isFunc ? monaco.languages.CompletionItemKind.Function : monaco.languages.CompletionItemKind.Variable,
                  insertText: isFunc ? `${name}(\${1})` : name,
                  insertTextRules: isFunc ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
                  detail: type,
                  documentation: isFunc ? `${name}${type}` : undefined,
                });
              }
            }
          }

          // Keywords
          for (const kw of ['await', 'return', 'const', 'let', 'if', 'else', 'for', 'of', 'async', 'try', 'catch']) {
            if (!partial || kw.includes(partial)) {
              suggestions.push({
                label: kw,
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: kw,
              });
            }
          }
        }

        return { suggestions };
      },
    });
  }

  private buildTypeDeclarations(): string {
    const lines: string[] = [];

    // API module types
    for (const mod of MODULES) {
      const proxyName = mod.label.split(/\s+/).join('');
      lines.push(`declare const ${proxyName}: {`);
      for (const ep of mod.endpoints) {
        const methodName = ep.label.split(/\s+/).join('');
        const params = extractPathParams(ep.pathTemplate);
        const hasBody = ep.hasBody ?? false;
        const paramParts: string[] = [];
        if (params.length > 0) {
          paramParts.push(`params: { ${params.map(p => `${p}: string`).join('; ')} }`);
        }
        if (hasBody) {
          paramParts.push('body?: Record<string, unknown>');
        }
        lines.push(`  /** ${ep.method} ${ep.pathTemplate} */`);
        lines.push(`  ${methodName}(${paramParts.join(', ')}): Promise<any>;`);
      }
      lines.push(`};\n`);
    }

    // Extra globals
    if (this.data.extraGlobals) {
      for (const [name, type] of Object.entries(this.data.extraGlobals)) {
        lines.push(`declare const ${name}: ${type};`);
      }
    }

    return lines.join('\n');
  }

  private buildSignature(params: string[], hasBody: boolean): string {
    const parts: string[] = [];
    if (params.length) parts.push(`{ ${params.join(', ')} }`);
    if (hasBody) parts.push('body?');
    return parts.length ? `(${parts.join(', ')})` : '()';
  }

  private buildSnippetArgs(params: string[], hasBody: boolean): string {
    const parts: string[] = [];
    let idx = 1;
    if (params.length) {
      parts.push(`{ ${params.map(p => `${p}: \${${idx++}:''}`).join(', ')} }`);
    }
    if (hasBody) {
      parts.push(`\${${idx}:{}}`);
    }
    return parts.join(', ');
  }

  save() {
    this.dialogRef.close(this.editor?.getValue() ?? this.data.code);
  }

  cancel() {
    this.dialogRef.close(undefined);
  }
}
