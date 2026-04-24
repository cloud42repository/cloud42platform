import {
  Component, Inject, AfterViewInit, OnDestroy, ElementRef, ViewChild, signal, NgZone, effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MODULES, extractPathParams } from '../config/endpoints';

declare const monaco: any;

export interface ScriptEditorDialogData {
  code: string;
  title?: string;
  /** Script type so the help panel can show relevant docs */
  mode?: 'field-script' | 'field-onChange' | 'field-rowSelect' | 'action-script' | 'workflow-script' | 'dashboard-script';
  /** Extra global variables available in the script (e.g. { value: 'string', FormFields: 'Record<string, unknown>' }) */
  extraGlobals?: Record<string, string>;
}

@Component({
  selector: 'app-script-editor-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="editor-dialog">
      <div class="editor-header">
        <span class="title-group"><mat-icon>code</mat-icon> {{ data.title || 'Script Editor' }}</span>
        <div class="header-actions">
          <button mat-icon-button class="help-btn" [class.active]="showHelp()" (click)="showHelp.set(!showHelp())" matTooltip="Script Documentation">
            <mat-icon>help_outline</mat-icon>
          </button>
          <button mat-icon-button class="close-btn" (click)="cancel()"><mat-icon>close</mat-icon></button>
        </div>
      </div>
      <div class="editor-content">
        <div class="editor-body" #editorContainer>
          @if (loadError()) {
            <div class="editor-error">
              <mat-icon>error_outline</mat-icon>
              <span>Failed to load editor: {{ loadError() }}</span>
            </div>
          }
        </div>
        @if (showHelp()) {
          <div class="help-panel">
            <div class="help-scroll">
              <h3>Script Documentation</h3>

              <div class="help-section">
                <h4>Available Globals</h4>
                <table class="help-table">
                  @if (data.mode === 'field-onChange') {
                    <tr><td><code>value</code></td><td>Current value of the changed field</td></tr>
                  }
                  @if (data.mode === 'field-rowSelect') {
                    <tr><td><code>row</code></td><td>Selected row object (column name → value)</td></tr>
                    <tr><td><code>rowIndex</code></td><td>Zero-based index of the selected row</td></tr>
                  }
                  @if (data.mode === 'field-script' || data.mode === 'field-onChange' || data.mode === 'field-rowSelect' || data.mode === 'action-script') {
                    <tr><td><code>FormFields</code></td><td>All field values as <code>Record&lt;string, unknown&gt;</code> keyed by label</td></tr>
                  }
                  @if (data.mode === 'field-onChange' || data.mode === 'field-rowSelect' || data.mode === 'action-script') {
                    <tr><td><code>setFieldValue(name, val)</code></td><td>Set another field's value by label or ID</td></tr>
                    <tr><td><code>setFieldEnabled(name, enabled)</code></td><td>Enable or disable a field by label or ID</td></tr>
                  }
                  @if (data.mode === 'workflow-script') {
                    <tr><td><code>[input bindings]</code></td><td>Variables from connected steps (configured in Input Bindings)</td></tr>
                  }
                  @if (data.mode === 'field-script' || data.mode === 'workflow-script' || data.mode === 'dashboard-script') {
                    <tr><td><code>return</code></td><td>Return a value to set the result data</td></tr>
                  }
                  <tr><td><code>await</code></td><td>All scripts are async — use <code>await</code> for API calls</td></tr>
                  <tr><td colspan="2" style="color:#64748b;font-size:10px;border:none;padding-top:6px;">+ all API modules (see below)</td></tr>
                </table>
              </div>

              <div class="help-section">
                <h4>API Modules</h4>
                <p class="help-hint">Call any endpoint: <code>await ModuleName.EndpointName()</code></p>
                <div class="module-list">
                  @for (mod of moduleNames; track mod) {
                    <span class="module-chip">{{ mod }}</span>
                  }
                </div>
              </div>

              @if (data.mode === 'field-script') {
                <div class="help-section">
                  <h4>Data Source Script</h4>
                  <p class="help-hint">Return an array to populate the field. For select fields, items need display/value fields configured in the field settings.</p>
                  <div class="help-example">
                    <div class="example-title">Load contacts into a select</div>
                    <pre><code>const res = await ZohoBooks.ListContacts();
return res;</code></pre>
                  </div>
                  <div class="help-example">
                    <div class="example-title">Filter based on another field</div>
                    <pre><code>// Use FormFields to read other field values
const type = FormFields['Type'];
const items = await ZohoCRM.ListModuleRecords(
  &#123; module: type || 'Leads' &#125;
);
return items;</code></pre>
                  </div>
                  <div class="help-example">
                    <div class="example-title">Filter data with ChatGPT</div>
                    <pre><code>const contacts = await ZohoBooks.ListContacts();
const ai = await ChatGPT.ChatCompletion(&#123;&#125;, &#123;
  model: 'gpt-4o-mini',
  messages: [&#123;
    role: 'user',
    content: 'Return only active: '
      + JSON.stringify(contacts)
  &#125;]
&#125;);
return JSON.parse(ai.choices[0].message.content);</code></pre>
                  </div>
                </div>
              }

              @if (data.mode === 'field-onChange') {
                <div class="help-section">
                  <h4>On Change Script</h4>
                  <p class="help-hint">Runs when the user changes this field's value. Use it to update other fields, call APIs, or enable/disable fields.</p>
                  <div class="help-example">
                    <div class="example-title">Auto-fill from API</div>
                    <pre><code>// When "Email" changes, look up the contact
const res = await ZohoCRM.SearchContacts(&#123;
  criteria: 'Email:equals:' + value
&#125;);
if (res.length > 0) &#123;
  setFieldValue('Name', res[0].Full_Name);
  setFieldValue('Phone', res[0].Phone);
&#125;</code></pre>
                  </div>
                  <div class="help-example">
                    <div class="example-title">Conditional enable/disable</div>
                    <pre><code>// Enable "Discount" field only for VIP
if (value === 'VIP') &#123;
  setFieldEnabled('Discount', true);
  setFieldEnabled('Priority', true);
&#125; else &#123;
  setFieldEnabled('Discount', false);
  setFieldEnabled('Priority', false);
&#125;</code></pre>
                  </div>
                  <div class="help-example">
                    <div class="example-title">Compute derived value</div>
                    <pre><code>// price * quantity → total
const qty = FormFields['Quantity'] || 0;
setFieldValue('Total', Number(value) * Number(qty));</code></pre>
                  </div>
                </div>
              }

              @if (data.mode === 'field-rowSelect') {
                <div class="help-section">
                  <h4>On Row Select Script</h4>
                  <p class="help-hint">Runs when the user clicks a row in the datatable. Use the selected row data to populate other fields, call APIs, or enable/disable fields.</p>
                  <div class="help-example">
                    <div class="example-title">Populate fields from row</div>
                    <pre><code>setFieldValue('Customer', row['Name']);
setFieldValue('Email', row['Email']);
setFieldValue('Phone', row['Phone']);</code></pre>
                  </div>
                  <div class="help-example">
                    <div class="example-title">Look up details from API</div>
                    <pre><code>// Fetch full contact from Zoho CRM
const contact = await ZohoCRM.GetContact(&#123;
  id: row['Contact_ID']
&#125;);
setFieldValue('Company', contact.Account_Name);
setFieldValue('Owner', contact.Owner?.name);</code></pre>
                  </div>
                  <div class="help-example">
                    <div class="example-title">Enable fields conditionally</div>
                    <pre><code>// Enable edit fields only for "Draft" rows
const isDraft = row['Status'] === 'Draft';
setFieldEnabled('Edit Name', isDraft);
setFieldEnabled('Edit Price', isDraft);
setFieldEnabled('Submit', isDraft);</code></pre>
                  </div>
                  <div class="help-example">
                    <div class="example-title">Compute from row data</div>
                    <pre><code>const price = Number(row['Price']) || 0;
const qty = Number(row['Quantity']) || 0;
const tax = price * qty * 0.19;
setFieldValue('Subtotal', price * qty);
setFieldValue('Tax', tax.toFixed(2));
setFieldValue('Total', (price * qty + tax).toFixed(2));</code></pre>
                  </div>
                </div>
              }

              @if (data.mode === 'action-script') {
                <div class="help-section">
                  <h4>Action Script</h4>
                  <p class="help-hint">Runs when the user clicks the action button. Use FormFields to read all values, call APIs, and update the form.</p>
                  <div class="help-example">
                    <div class="example-title">Create a CRM lead</div>
                    <pre><code>const lead = await ZohoCRM.CreateLeads(&#123;&#125;, &#123;
  data: [&#123;
    Last_Name: FormFields['Name'],
    Email: FormFields['Email'],
    Company: FormFields['Company']
  &#125;]
&#125;);
setFieldValue('Lead ID', lead[0]?.details?.id);</code></pre>
                  </div>
                  <div class="help-example">
                    <div class="example-title">Create an invoice</div>
                    <pre><code>const inv = await ZohoBooks.CreateInvoice(&#123;&#125;, &#123;
  customer_id: FormFields['Customer ID'],
  line_items: [&#123;
    name: FormFields['Item'],
    rate: Number(FormFields['Price']),
    quantity: Number(FormFields['Quantity'])
  &#125;]
&#125;);
setFieldValue('Invoice #', inv.invoice_number);</code></pre>
                  </div>
                  <div class="help-example">
                    <div class="example-title">Lock form after submit</div>
                    <pre><code>await ZohoCRM.CreateLeads(&#123;&#125;, &#123;
  data: [&#123; Last_Name: FormFields['Name'] &#125;]
&#125;);
// Disable all input fields after submit
setFieldEnabled('Name', false);
setFieldEnabled('Email', false);
setFieldEnabled('Phone', false);</code></pre>
                  </div>
                  <div class="help-example">
                    <div class="example-title">AI-powered field fill</div>
                    <pre><code>const ai = await ChatGPT.ChatCompletion(&#123;&#125;, &#123;
  model: 'gpt-4o-mini',
  messages: [&#123;
    role: 'user',
    content: 'Suggest a category for: '
      + FormFields['Description']
  &#125;]
&#125;);
setFieldValue('Category',
  ai.choices[0].message.content);</code></pre>
                  </div>
                </div>
              }

              @if (data.mode === 'workflow-script') {
                <div class="help-section">
                  <h4>Workflow Script</h4>
                  <p class="help-hint">Runs as a step in the workflow pipeline. Input bindings from previous steps are available as variables. Return a value to pass it to the next step.</p>
                  <div class="help-example">
                    <div class="example-title">Transform data from previous step</div>
                    <pre><code>// 'contacts' comes from an input binding
const active = contacts.filter(
  c => c.status === 'active'
);
return active.map(c => (&#123;
  name: c.contact_name,
  email: c.email
&#125;));</code></pre>
                  </div>
                  <div class="help-example">
                    <div class="example-title">Enrich with API call</div>
                    <pre><code>// 'leadId' comes from an input binding
const lead = await ZohoCRM.GetLead(&#123;
  id: leadId
&#125;);
const company = lead.Company;

const contacts = await ZohoBooks.ListContacts();
return contacts.filter(
  c => c.company_name === company
);</code></pre>
                  </div>
                  <div class="help-example">
                    <div class="example-title">Aggregate and compute</div>
                    <pre><code>// 'invoices' from input binding
const total = invoices.reduce(
  (sum, inv) => sum + Number(inv.total), 0
);
const avg = total / invoices.length;
return &#123; total, average: avg,
  count: invoices.length &#125;;</code></pre>
                  </div>
                  <div class="help-example">
                    <div class="example-title">Conditional API calls</div>
                    <pre><code>// 'action' and 'data' from input bindings
if (action === 'create') &#123;
  return await ZohoCRM.CreateLeads(&#123;&#125;, &#123;
    data: [data]
  &#125;);
&#125; else &#123;
  return await ZohoCRM.UpdateLeads(&#123;&#125;, &#123;
    data: [data]
  &#125;);
&#125;</code></pre>
                  </div>
                  <div class="help-example">
                    <div class="example-title">AI processing</div>
                    <pre><code>// 'text' from input binding
const ai = await ChatGPT.ChatCompletion(&#123;&#125;, &#123;
  model: 'gpt-4o-mini',
  messages: [&#123;
    role: 'user',
    content: 'Summarize: ' + text
  &#125;]
&#125;);
return ai.choices[0].message.content;</code></pre>
                  </div>
                </div>
              }

              @if (data.mode === 'dashboard-script') {
                <div class="help-section">
                  <h4>Dashboard Widget Script</h4>
                  <p class="help-hint">Return an array to populate the widget's chart or table. All API modules are available. Use the widget's "Data Path" setting to extract nested data.</p>
                  <div class="help-example">
                    <div class="example-title">Load data for a chart</div>
                    <pre><code>const invoices = await ZohoBooks.ListInvoices();
return invoices.map(inv => (&#123;
  name: inv.customer_name,
  value: Number(inv.total)
&#125;));</code></pre>
                  </div>
                  <div class="help-example">
                    <div class="example-title">Aggregate by category</div>
                    <pre><code>const expenses = await ZohoExpense.ListExpenses();
const byCategory = &#123;&#125;;
for (const e of expenses) &#123;
  const cat = e.category_name || 'Other';
  byCategory[cat] = (byCategory[cat] || 0)
    + Number(e.total);
&#125;
return Object.entries(byCategory).map(
  ([name, value]) => (&#123; name, value &#125;)
);</code></pre>
                  </div>
                  <div class="help-example">
                    <div class="example-title">Combine multiple sources</div>
                    <pre><code>const [leads, deals] = await Promise.all([
  ZohoCRM.ListLeads(),
  ZohoCRM.ListDeals()
]);
return &#123;
  leads: leads.length,
  deals: deals.length,
  conversion: deals.length / leads.length
&#125;;</code></pre>
                  </div>
                  <div class="help-example">
                    <div class="example-title">Storage usage overview</div>
                    <pre><code>const accounts =
  await ImpossibleCloud.ListStorageAccounts();
return accounts.map(a => (&#123;
  name: a.name,
  usage: a.usage_bytes / 1e9  // GB
&#125;));</code></pre>
                  </div>
                  <div class="help-example">
                    <div class="example-title">Time series data</div>
                    <pre><code>const invoices = await ZohoBooks.ListInvoices();
// Group by month
const byMonth = &#123;&#125;;
for (const inv of invoices) &#123;
  const month = inv.date?.substring(0, 7);
  if (!month) continue;
  byMonth[month] = (byMonth[month] || 0)
    + Number(inv.total);
&#125;
return Object.entries(byMonth)
  .sort()
  .map(([month, total]) =>
    (&#123; name: month, value: total &#125;));</code></pre>
                  </div>
                </div>
              }

              <div class="help-section">
                <h4>API Call Patterns</h4>
                <div class="help-example">
                  <div class="example-title">GET (no params)</div>
                  <pre><code>await ZohoBooks.ListContacts();</code></pre>
                </div>
                <div class="help-example">
                  <div class="example-title">GET (with path params)</div>
                  <pre><code>await ZohoBooks.GetContact(&#123;
  contact_id: '12345'
&#125;);</code></pre>
                </div>
                <div class="help-example">
                  <div class="example-title">POST (with body)</div>
                  <pre><code>await ZohoBooks.CreateContact(&#123;&#125;, &#123;
  contact_name: 'John Doe',
  email: 'john&#64;example.com'
&#125;);</code></pre>
                </div>
                <div class="help-example">
                  <div class="example-title">Storage (Impossible Cloud)</div>
                  <pre><code>const regions = await ImpossibleCloud.ListRegions();
const accounts =
  await ImpossibleCloud.ListStorageAccounts();</code></pre>
                </div>
              </div>

              <div class="help-section">
                <h4>Tips</h4>
                <ul class="help-tips">
                  <li>All scripts run as <code>async</code> — use <code>await</code> for API calls</li>
                  @if (data.mode === 'field-script' || data.mode === 'dashboard-script') {
                    <li>Use <code>return</code> to set the result data</li>
                  }
                  @if (data.mode === 'workflow-script') {
                    <li>Use <code>return</code> to pass data to the next step</li>
                    <li>Input bindings provide variables from previous steps</li>
                  }
                  @if (data.mode === 'field-onChange' || data.mode === 'field-rowSelect' || data.mode === 'action-script') {
                    <li>Reference fields by their <strong>label</strong> or <strong>ID</strong></li>
                  }
                  @if (data.mode === 'field-rowSelect') {
                    <li>Access columns via <code>row['ColumnName']</code></li>
                  }
                  @if (data.mode === 'field-script') {
                    <li>Read existing values via <code>FormFields['Label']</code></li>
                  }
                  <li>API responses are auto-unwrapped — arrays are returned directly</li>
                  <li>Use <code>try/catch</code> for error handling</li>
                  <li>Use <code>console.log()</code> to debug (check browser DevTools)</li>
                  @if (data.mode === 'dashboard-script') {
                    <li>Return <code>[&#123; name, value &#125;]</code> arrays for chart widgets</li>
                  }
                  <li>Use <code>Promise.all()</code> for parallel API calls</li>
                </ul>
              </div>
            </div>
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
    .header-actions { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; gap: 2px; }
    .header-actions button { color: #d4d4d4; }
    .help-btn.active { color: #60a5fa; }
    .editor-content { display: flex; flex: 1; min-height: 0; overflow: hidden; }
    .editor-body { flex: 1; min-width: 0; min-height: 0; position: relative; }
    .editor-error {
      display: flex; align-items: center; gap: 8px; padding: 24px;
      color: #f87171; background: #1e1e1e; height: 100%;
    }
    .editor-footer {
      display: flex; justify-content: flex-end; gap: 8px; padding: 10px 16px;
      border-top: 1px solid #e2e8f0; background: #fafafa; flex-shrink: 0;
    }

    /* Help panel */
    .help-panel {
      width: 340px; max-width: 40%; flex-shrink: 0; background: #1e1e1e; border-left: 1px solid #333;
      overflow: hidden; display: flex; flex-direction: column;
    }
    .help-scroll {
      overflow-y: auto; padding: 16px; color: #d4d4d4; font-size: 12px; line-height: 1.6;
    }
    .help-scroll h3 { margin: 0 0 12px; font-size: 14px; color: #e2e8f0; }
    .help-section { margin-bottom: 16px; }
    .help-section h4 {
      font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;
      color: #60a5fa; margin: 0 0 6px; padding-bottom: 4px; border-bottom: 1px solid #333;
    }
    .help-hint { color: #94a3b8; margin: 0 0 8px; font-size: 11px; }
    .help-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    .help-table td { padding: 4px 6px; border-bottom: 1px solid #2d2d2d; vertical-align: top; }
    .help-table td:first-child { white-space: nowrap; width: 1%; }
    .help-table code { color: #ce9178; font-size: 11px; }
    .module-list { display: flex; flex-wrap: wrap; gap: 4px; }
    .module-chip {
      font-size: 10px; padding: 2px 6px; border-radius: 4px;
      background: #2d3748; color: #90cdf4; font-family: monospace;
    }
    .help-example {
      background: #252526; border-radius: 6px; padding: 8px 10px; margin-bottom: 8px;
      border: 1px solid #333;
    }
    .example-title { font-size: 11px; color: #9ca3af; margin-bottom: 4px; font-weight: 600; }
    .help-example pre { margin: 0; }
    .help-example code {
      font-size: 11px; color: #d4d4d4; font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
      white-space: pre-wrap; word-break: break-word;
    }
    .help-tips { margin: 0; padding-left: 16px; }
    .help-tips li { margin-bottom: 4px; color: #b0b0b0; }
    .help-tips code { color: #ce9178; font-size: 11px; }
  `],
})
export class ScriptEditorDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef<HTMLDivElement>;
  private editor: any;
  loadError = signal('');
  showHelp = signal(false);
  readonly moduleNames = MODULES.map(m => m.label.split(/\s+/).join(''));

  constructor(
    public dialogRef: MatDialogRef<ScriptEditorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ScriptEditorDialogData,
    private hostEl: ElementRef,
    private zone: NgZone,
  ) {
    effect(() => {
      this.showHelp(); // track
      setTimeout(() => this.editor?.layout(), 50);
    });
  }

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
