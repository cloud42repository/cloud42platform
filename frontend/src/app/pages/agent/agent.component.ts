import {
  Component, ElementRef, ViewChild, OnInit, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { firstValueFrom } from 'rxjs';

import { ApiService } from '../../services/api.service';
import { WorkflowService } from '../../services/workflow.service';
import { MODULES, extractPathParams } from '../../config/endpoints';
import { Workflow, WorkflowStep } from '../../config/workflow.types';

export interface AgentMessage {
  role: 'user' | 'agent';
  html: string;
  actions?: { label: string; route: string }[];
  timestamp: Date;
  /** Distinguish ChatGPT responses from normal agent messages */
  source?: 'agent' | 'chatgpt';
}

/** Lightweight ChatGPT message for conversation history */
interface ChatGPTMsg {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface NavTarget { route: string; label: string; }

@Component({
  selector: 'app-agent',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatDividerModule,
    MatTooltipModule, MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss'],
})
export class AgentComponent implements OnInit {
  @ViewChild('messagesArea') messagesArea!: ElementRef<HTMLDivElement>;

  private readonly router = inject(Router);
  private readonly workflowSvc = inject(WorkflowService);
  private readonly api = inject(ApiService);

  readonly messages = signal<AgentMessage[]>([]);
  readonly thinking = signal(false);
  readonly chatMode = signal(false);
  promptText = '';

  /** Multi-turn conversation history sent to ChatGPT */
  private chatHistory: ChatGPTMsg[] = [];

  // ── Navigation map ──────────────────────────────────────────────────────────
  private readonly NAV_MAP: { keywords: string[]; route: string; label: string }[] = [
    { keywords: ['workflows', 'my workflows', 'workflow list'],      route: '/workflows',           label: 'Workflows'         },
    { keywords: ['calendar', 'schedule', 'scheduled'],               route: '/workflows/calendar',  label: 'Schedule Calendar' },
    { keywords: ['new workflow', 'workflow builder', 'build workflow'], route: '/workflows/new',    label: 'New Workflow'       },
    { keywords: ['invoice dashboard', 'invoice'],                    route: '/invoice-dashboard',   label: 'Invoice Dashboard' },
    { keywords: ['ic dashboard', 'impossible cloud dashboard', 'ic dash'], route: '/ic-dashboard', label: 'IC Dashboard'      },
    { keywords: ['settings', 'configuration', 'config', 'auth'],    route: '/settings',            label: 'Settings'          },
    ...MODULES.map(m => ({
      keywords: [m.label.toLowerCase(), m.id.replace(/-/g, ' '), m.id],
      route: `/${m.id}`,
      label: m.label,
    })),
  ];

  // ── Lifecycle ───────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.chatMode.set(false);
    this.chatHistory = [];
    this.messages.set([{
      role: 'agent',
      html: `<strong>👋 Hello! I'm the Cloud42 Agent.</strong><br>
I can help you <strong>navigate</strong> the platform, <strong>create workflows</strong>, or <strong>chat with ChatGPT</strong>.<br><br>
<em>Example commands:</em><br>
&bull; <code>go to IC dashboard</code><br>
&bull; <code>open Zoho CRM</code><br>
&bull; <code>search mock</code> — search across all API data<br>
&bull; <code>create a workflow that lists Impossible Cloud storage accounts and gets usage</code><br>
&bull; <code>ask chatgpt what is cloud computing?</code><br>
&bull; Toggle <strong>ChatGPT mode</strong> for multi-turn AI conversation<br>
&bull; <code>help</code>`,
      actions: [
        { label: 'View Workflows', route: '/workflows' },
        { label: 'IC Dashboard',   route: '/ic-dashboard' },
      ],
      timestamp: new Date(),
    }]);
  }

  // ── Input handling ──────────────────────────────────────────────────────────
  send(): void {
    const text = this.promptText.trim();
    if (!text) return;

    this.messages.update(msgs => [...msgs, {
      role: 'user',
      html: this.escapeHtml(text),
      timestamp: new Date(),
    }]);
    this.promptText = '';
    this.scrollToBottom();

    this.thinking.set(true);

    // In ChatGPT mode, always route to ChatGPT (unless exiting)
    if (this.chatMode()) {
      const lower = text.toLowerCase().trim();
      if (/^(exit\s*chat|back\s*to\s*agent|agent\s*mode|quit\s*chat|stop\s*chat)/.test(lower)) {
        this.chatMode.set(false);
        this.chatHistory = [];
        this.thinking.set(false);
        this.messages.update(msgs => [...msgs, {
          role: 'agent',
          html: `Switched back to <strong>Agent mode</strong>. Your ChatGPT conversation history has been cleared.`,
          timestamp: new Date(),
        }]);
        this.scrollToBottom();
        return;
      }
      this.doChatGPT(text);
      return;
    }

    setTimeout(() => {
      const response = this.processInput(text);
      if (response) {
        this.thinking.set(false);
        this.messages.update(msgs => [...msgs, response]);
        this.scrollToBottom();
      }
    }, 600);
  }

  /** Toggle ChatGPT mode on/off */
  toggleChatMode(): void {
    const entering = !this.chatMode();
    this.chatMode.set(entering);

    if (entering) {
      this.chatHistory = [];
      this.messages.update(msgs => [...msgs, {
        role: 'agent',
        html: `<strong>🤖 ChatGPT mode activated.</strong><br>
All your messages will now be sent to ChatGPT. The conversation is multi-turn — I'll remember context.<br><br>
Type <code>exit chat</code> or toggle off to return to Agent mode.`,
        source: 'chatgpt',
        timestamp: new Date(),
      }]);
    } else {
      this.chatHistory = [];
      this.messages.update(msgs => [...msgs, {
        role: 'agent',
        html: `Switched back to <strong>Agent mode</strong>. ChatGPT conversation history cleared.`,
        timestamp: new Date(),
      }]);
    }
    this.scrollToBottom();
  }

  doAction(action: { label: string; route: string }): void {
    this.router.navigateByUrl(action.route);
  }

  clearChat(): void {
    this.ngOnInit();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesArea) {
        this.messagesArea.nativeElement.scrollTop =
          this.messagesArea.nativeElement.scrollHeight;
      }
    }, 80);
  }

  // ── Core NLP dispatcher ─────────────────────────────────────────────────────
  private processInput(input: string): AgentMessage | null {
    const lower = input.toLowerCase().trim();

    // Help
    if (/^(help|\?|what can you do|capabilities|commands?)/.test(lower)) {
      return this.helpMessage();
    }

    // List modules
    if (/\b(list|show|what are).*(module|service|api|integration)/i.test(lower)) {
      return this.listModules();
    }

    // Workflow creation
    if (/\b(create|build|make|generate|new)\b/.test(lower) && /\bworkflow\b/.test(lower)) {
      return this.createWorkflow(input);
    }

    // Explicit navigation verb
    if (/\b(go to|navigate to|open|show me|take me to|switch to|jump to)\b/.test(lower)) {
      return this.doNavigate(lower);
    }

    // Global data search
    if (/\b(search(?:\s+for)?|look\s*for|lookup)\b/i.test(lower)) {
      this.doGlobalSearch(input);
      return null;
    }

    // Implicit navigation (just a page name)
    const nav = this.findNavTarget(lower);
    if (nav) {
      setTimeout(() => this.router.navigateByUrl(nav.route), 800);
      return {
        role: 'agent',
        html: `Navigating you to <strong>${nav.label}</strong>…`,
        actions: [{ label: `Open ${nav.label}`, route: nav.route }],
        timestamp: new Date(),
      };
    }

    // One-shot ChatGPT query ("ask chatgpt ...", "chat gpt ...", "ask ai ...")
    if (/\b(ask\s*(chatgpt|gpt|ai|openai)|chat\s*gpt|chatgpt)\b/i.test(lower)) {
      const prompt = input
        .replace(/\b(ask\s*(chatgpt|gpt|ai|openai)|chat\s*gpt|chatgpt)\b/gi, '')
        .trim();
      if (!prompt) {
        return {
          role: 'agent',
          html: `Please provide a prompt after <code>ask chatgpt</code>.<br>
Example: <em>"ask chatgpt what is cloud computing?"</em>`,
          timestamp: new Date(),
        };
      }
      this.doChatGPT(prompt);
      return null; // async response
    }

    // Fallback
    return {
      role: 'agent',
      html: `I didn't quite understand that. Try:<br>
&bull; <em>"go to Workflows"</em> to navigate<br>
&bull; <em>"create a workflow that lists Zoho CRM contacts"</em> to build a workflow<br>
&bull; <code>help</code> for all options`,
      timestamp: new Date(),
    };
  }

  // ── Navigation ──────────────────────────────────────────────────────────────
  private doNavigate(lower: string): AgentMessage {
    const nav = this.findNavTarget(lower);
    if (nav) {
      setTimeout(() => this.router.navigateByUrl(nav.route), 800);
      return {
        role: 'agent',
        html: `Navigating you to <strong>${nav.label}</strong>…`,
        actions: [{ label: `Open ${nav.label}`, route: nav.route }],
        timestamp: new Date(),
      };
    }
    const moduleList = MODULES.slice(0, 6).map(m => `<em>${m.label}</em>`).join(', ');
    return {
      role: 'agent',
      html: `I couldn't find that page. Try: <br>
<em>Workflows, Calendar, IC Dashboard, Invoice Dashboard, Settings</em>, or a module like ${moduleList}…`,
      timestamp: new Date(),
    };
  }

  private findNavTarget(lower: string): NavTarget | null {
    for (const entry of this.NAV_MAP) {
      if (entry.keywords.some(k => lower.includes(k))) {
        return { route: entry.route, label: entry.label };
      }
    }
    return null;
  }

  // ── Workflow creation ───────────────────────────────────────────────────────
  private createWorkflow(input: string): AgentMessage {
    const lower = input.toLowerCase();
    const matchedSteps: WorkflowStep[] = [];

    for (const mod of MODULES) {
      const modLabel = mod.label.toLowerCase();
      const modIdSpaced = mod.id.replace(/-/g, ' ');
      const modMentioned =
        lower.includes(modLabel) ||
        lower.includes(modIdSpaced) ||
        lower.includes(mod.id);

      for (const ep of mod.endpoints) {
        const epLabel = ep.label.toLowerCase();
        const epIdSpaced = ep.id.replace(/-/g, ' ');

        // Score by counting label-word overlaps in prompt
        const labelWords = epLabel.split(/[\s\-]+/).filter(w => w.length > 2);
        const matchCount = labelWords.filter(w => lower.includes(w)).length;
        const threshold = Math.max(1, Math.floor(labelWords.length * 0.55));

        const matched =
          lower.includes(epIdSpaced) ||
          (modMentioned && matchCount >= 1) ||
          matchCount >= threshold;

        if (matched) {
          const stepId = `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const paramNames = extractPathParams(ep.pathTemplate);
          matchedSteps.push({
            id: stepId,
            kind: 'endpoint',
            moduleId: mod.id,
            moduleLabel: mod.label,
            moduleApiPrefix: mod.apiPrefix,
            endpointId: ep.id,
            endpointLabel: ep.label,
            method: ep.method,
            pathTemplate: ep.pathTemplate,
            pathParamNames: paramNames,
            hasBody: ep.hasBody ?? false,
            paramSources: Object.fromEntries(
              paramNames.map(p => [p, { type: 'hardcoded' as const, value: '' }])
            ),
            bodyKeys: [],
            bodySources: {},
          });
        }
      }
    }

    if (matchedSteps.length === 0) {
      return {
        role: 'agent',
        html: `I couldn't match any API endpoints from your description.<br><br>
Try mentioning module names and actions, e.g.:<br>
&bull; <em>"create a workflow that lists Impossible Cloud storage accounts"</em><br>
&bull; <em>"build a workflow to get Zoho Books invoices"</em><br>
&bull; <code>help</code> to see available modules`,
        timestamp: new Date(),
      };
    }

    // Deduplicate by moduleId:endpointId
    const seen = new Set<string>();
    const uniqueSteps = matchedSteps.filter(s => {
      const key = `${s.moduleId}:${s.endpointId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Derive a workflow name from the prompt
    const nameRaw = input
      .replace(/\b(create|build|make|generate|a|an|the|new|me|that|which|to|workflow)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    const name = nameRaw.length > 70
      ? nameRaw.slice(0, 70).trim() + '…'
      : nameRaw || 'Agent-generated Workflow';

    const workflow: Workflow = {
      id: `wf-agent-${Date.now()}`,
      name,
      description: `Created by Agent from prompt: "${input}"`,
      steps: uniqueSteps,
      status: 'draft',
      scheduledAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.workflowSvc.upsert(workflow);

    const stepsHtml = uniqueSteps.map(s =>
      `<li><strong>${s.moduleLabel}</strong> &rarr; <em>${s.endpointLabel}</em> &nbsp;<code>${s.method}</code></li>`
    ).join('');

    setTimeout(() => this.router.navigateByUrl(`/workflows/${workflow.id}/edit`), 1400);

    return {
      role: 'agent',
      html: `✅ Workflow <strong>"${this.escapeHtml(name)}"</strong> created with <strong>${uniqueSteps.length}</strong> step${uniqueSteps.length !== 1 ? 's' : ''}:<ul>${stepsHtml}</ul>Opening the workflow builder…`,
      actions: [{ label: 'Open in Builder', route: `/workflows/${workflow.id}/edit` }],
      timestamp: new Date(),
    };
  }

  // ── ChatGPT integration ────────────────────────────────────────────────────
  private async doChatGPT(prompt: string): Promise<void> {
    // Add user message to conversation history
    this.chatHistory.push({ role: 'user', content: prompt });

    try {
      const body = {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant integrated into the Cloud42 platform. Keep answers concise and practical.' },
          ...this.chatHistory,
        ],
        temperature: 0.7,
        max_tokens: 1024,
      };

      const raw: any = await firstValueFrom(
        this.api.post('/chatgpt', '/chat/completions', {}, body)
      );

      const reply =
        raw?.choices?.[0]?.message?.content ??
        raw?.choices?.[0]?.text ??
        'No response from ChatGPT.';

      // Add assistant reply to conversation history for multi-turn
      this.chatHistory.push({ role: 'assistant', content: reply });

      this.thinking.set(false);
      this.messages.update(msgs => [...msgs, {
        role: 'agent',
        html: this.formatChatGPTResponse(reply),
        source: 'chatgpt',
        timestamp: new Date(),
      }]);
    } catch (err: any) {
      this.thinking.set(false);
      const errMsg = err?.error?.message ?? err?.message ?? 'Unknown error';
      this.messages.update(msgs => [...msgs, {
        role: 'agent',
        html: `⚠️ ChatGPT request failed: <em>${this.escapeHtml(errMsg)}</em><br>
Make sure the backend is running and the ChatGPT module is configured.`,
        source: 'chatgpt',
        timestamp: new Date(),
      }]);
    }

    this.scrollToBottom();
  }

  /** Format ChatGPT plain-text response into displayable HTML */
  private formatChatGPTResponse(text: string): string {
    // Escape HTML first
    let html = this.escapeHtml(text);

    // Convert markdown-like code blocks  ```...```
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g,
      (_m, _lang, code) => `<pre style="background:#f5f5f5;padding:8px 12px;border-radius:6px;overflow-x:auto;font-size:12.5px;margin:8px 0"><code>${code.trim()}</code></pre>`);

    // Convert inline code `...`
    html = html.replace(/`([^`]+)`/g,
      '<code style="background:rgba(0,0,0,0.07);padding:1px 5px;border-radius:4px;font-size:12.5px">$1</code>');

    // Convert bold **...**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Convert newlines to <br>
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  // ── Help ────────────────────────────────────────────────────────────────────
  private helpMessage(): AgentMessage {
    const moduleItems = MODULES.slice(0, 7)
      .map(m => `<li><strong>${m.label}</strong> &mdash; ${m.endpoints.length} endpoint${m.endpoints.length !== 1 ? 's' : ''}</li>`)
      .join('');
    const moreCount = MODULES.length > 7 ? `<li>…and ${MODULES.length - 7} more modules</li>` : '';

    return {
      role: 'agent',
      html: `<strong>Here's what I can do:</strong><br><br>
<strong>🧭 Navigate</strong> — Say <em>"go to [page]"</em> or just type the page name.<br>
Available pages: <em>Workflows, Calendar, IC Dashboard, Invoice Dashboard, Settings</em>, plus any module page.<br><br>
<strong>⚙️ Create Workflows</strong> — Say <em>"create a workflow that [description]"</em>.<br>
&bull; Mention module names and actions: <em>"list Impossible Cloud regions then get storage account usage"</em><br>
&bull; Cross-module: <em>"get Zoho CRM contacts and create a Zoho Books invoice"</em><br><br>
<strong>🤖 ChatGPT</strong> — Talk to AI directly!<br>
&bull; <em>"ask chatgpt what is cloud computing?"</em> — one-shot query<br>
&bull; Toggle <strong>ChatGPT mode</strong> (header switch) for multi-turn conversation<br>
&bull; <code>exit chat</code> to return to Agent mode<br><br>
<strong>🔍 Search Data</strong> — Say <em>"search [term]"</em> to search across all API GET endpoints.<br>
&bull; <em>"search mock"</em> — find records containing "mock"<br>
&bull; <em>"search for invoice"</em> — find records mentioning "invoice"<br><br>
<strong>📋 Other commands</strong><br>
&bull; <code>list modules</code> — show all available API modules<br>
&bull; <code>help</code> — show this message<br><br>
<strong>📦 Available modules (top ${Math.min(7, MODULES.length)}):</strong><ul>${moduleItems}${moreCount}</ul>`,
      actions: [
        { label: 'View Workflows', route: '/workflows' },
        { label: 'New Workflow',   route: '/workflows/new' },
        { label: 'IC Dashboard',   route: '/ic-dashboard' },
      ],
      timestamp: new Date(),
    };
  }

  private listModules(): AgentMessage {
    const items = MODULES.map(m =>
      `<li><strong>${m.label}</strong> &mdash; ${m.endpoints.length} endpoint${m.endpoints.length !== 1 ? 's' : ''} &nbsp;
       <a href="/${m.id}">view</a></li>`
    ).join('');
    return {
      role: 'agent',
      html: `<strong>All available modules (${MODULES.length}):</strong><ul>${items}</ul>`,
      actions: MODULES.slice(0, 4).map(m => ({ label: m.label, route: `/${m.id}` })),
      timestamp: new Date(),
    };
  }

  // ── Global data search ──────────────────────────────────────────────────────
  private async doGlobalSearch(input: string): Promise<void> {
    const searchTerm = input
      .replace(/\b(search(?:\s+for)?|look\s*for|lookup)\b/gi, '')
      .replace(/\b(in|all|api|endpoints?|data|across|every|the|a|an)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!searchTerm || searchTerm.length < 2) {
      this.thinking.set(false);
      this.messages.update(msgs => [...msgs, {
        role: 'agent',
        html: `Please provide a search term (at least 2 characters).<br><em>Example:</em> <code>search John</code>`,
        timestamp: new Date(),
      }]);
      this.scrollToBottom();
      return;
    }

    // Collect GET endpoints without path params (list endpoints)
    const listEndpoints: { apiPrefix: string; pathTemplate: string; moduleLabel: string; endpointLabel: string }[] = [];
    for (const mod of MODULES) {
      for (const ep of mod.endpoints) {
        if (ep.method === 'GET' && extractPathParams(ep.pathTemplate).length === 0) {
          listEndpoints.push({
            apiPrefix: mod.apiPrefix,
            pathTemplate: ep.pathTemplate,
            moduleLabel: mod.label,
            endpointLabel: ep.label,
          });
        }
      }
    }

    interface SearchHit {
      moduleLabel: string;
      endpointLabel: string;
      record: Record<string, unknown>;
      matchedFields: string[];
    }

    const hits: SearchHit[] = [];
    const lowerTerm = searchTerm.toLowerCase();

    // Fire all GET calls in parallel
    await Promise.allSettled(
      listEndpoints.map(async (ep) => {
        try {
          const raw = await firstValueFrom(this.api.get(ep.apiPrefix, ep.pathTemplate));
          const records = this._extractRecords(raw);
          for (const record of records) {
            const matchedFields = this._getMatchedFields(record, lowerTerm);
            if (matchedFields.length > 0) {
              hits.push({ moduleLabel: ep.moduleLabel, endpointLabel: ep.endpointLabel, record, matchedFields });
            }
          }
        } catch { /* endpoint failed – skip */ }
      })
    );

    this.thinking.set(false);

    if (hits.length === 0) {
      this.messages.update(msgs => [...msgs, {
        role: 'agent',
        html: `🔍 No results found for <strong>"${this.escapeHtml(searchTerm)}"</strong> across <strong>${listEndpoints.length}</strong> endpoints.`,
        timestamp: new Date(),
      }]);
    } else {
      // Group by module → endpoint
      const grouped = new Map<string, SearchHit[]>();
      for (const h of hits) {
        const key = `${h.moduleLabel} → ${h.endpointLabel}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(h);
      }

      const MAX_PER_GROUP = 3;
      const MAX_TOTAL = 50;
      let shown = 0;

      let html = `🔍 Found <strong>${hits.length}</strong> result${hits.length !== 1 ? 's' : ''} for <strong>"${this.escapeHtml(searchTerm)}"</strong> across <strong>${grouped.size}</strong> endpoint${grouped.size !== 1 ? 's' : ''}:<br><br>`;

      for (const [group, items] of grouped) {
        if (shown >= MAX_TOTAL) {
          html += `<em>…results truncated (${MAX_TOTAL} shown of ${hits.length})</em>`;
          break;
        }
        html += `<strong>${this.escapeHtml(group)}</strong> (${items.length}):<ul>`;
        const slice = items.slice(0, MAX_PER_GROUP);
        for (const item of slice) {
          const preview = item.matchedFields.slice(0, 4)
            .map(f => {
              const val = item.record[f];
              const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
              const trunc = str.length > 80 ? str.slice(0, 80) + '…' : str;
              return `<em>${this.escapeHtml(f)}</em>: ${this.escapeHtml(trunc)}`;
            })
            .join(' &middot; ');
          html += `<li>${preview}</li>`;
          shown++;
        }
        if (items.length > MAX_PER_GROUP) {
          html += `<li><em>…and ${items.length - MAX_PER_GROUP} more</em></li>`;
        }
        html += '</ul>';
      }

      this.messages.update(msgs => [...msgs, { role: 'agent', html, timestamp: new Date() }]);
    }

    this.scrollToBottom();
  }

  /** Extract an array of records from any API response shape */
  private _extractRecords(data: unknown): Record<string, unknown>[] {
    if (Array.isArray(data)) return data as Record<string, unknown>[];
    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;
      for (const key of Object.keys(obj)) {
        if (Array.isArray(obj[key])) return obj[key] as Record<string, unknown>[];
      }
      if (Object.keys(obj).length > 1) return [obj];
    }
    return [];
  }

  /** Return field names whose values contain the search term */
  private _getMatchedFields(record: Record<string, unknown>, lowerTerm: string): string[] {
    const matched: string[] = [];
    for (const [key, value] of Object.entries(record)) {
      if (value == null) continue;
      const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
      if (str.toLowerCase().includes(lowerTerm)) {
        matched.push(key);
      }
    }
    return matched;
  }

  // ── Utils ───────────────────────────────────────────────────────────────────
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
