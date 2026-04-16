import { Injectable } from '@angular/core';
import { MODULES } from '../config/endpoints';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Intent =
  | 'navigate'
  | 'create_workflow'
  | 'search'
  | 'ask_chatgpt'
  | 'help'
  | 'list_modules'
  | 'greet'
  | 'farewell'
  | 'status'
  | 'unknown';

export interface NluEntity {
  type: 'module' | 'page' | 'action' | 'search_term' | 'item_type' | 'freetext';
  value: string;
  canonical: string;
  confidence: number;
}

export interface NluResult {
  intent: Intent;
  confidence: number;
  entities: NluEntity[];
  rawTokens: string[];
  /** If intent is navigate, the best matched route */
  route?: string;
  routeLabel?: string;
}

// ── Intent training data (pattern → intent with weight) ──────────────────────

interface TrainingSample {
  tokens: string[];
  intent: Intent;
  weight: number;
}

// ── Synonym & stemming maps ──────────────────────────────────────────────────

const SYNONYMS: Record<string, string> = {
  // Navigation
  'goto': 'navigate', 'go': 'navigate', 'open': 'navigate', 'show': 'navigate',
  'take': 'navigate', 'switch': 'navigate', 'jump': 'navigate', 'view': 'navigate',
  'visit': 'navigate', 'display': 'navigate', 'browse': 'navigate',
  // Workflow
  'build': 'create', 'make': 'create', 'generate': 'create', 'new': 'create',
  'construct': 'create', 'setup': 'create', 'design': 'create', 'compose': 'create',
  'flow': 'workflow', 'automation': 'workflow', 'pipeline': 'workflow', 'process': 'workflow',
  // Search
  'find': 'search', 'lookup': 'search', 'look': 'search', 'locate': 'search',
  'query': 'search', 'filter': 'search', 'seek': 'search',
  // ChatGPT
  'gpt': 'chatgpt', 'ai': 'chatgpt', 'openai': 'chatgpt', 'assistant': 'chatgpt',
  'llm': 'chatgpt', 'bot': 'chatgpt',
  // Help
  'commands': 'help', 'capabilities': 'help', 'options': 'help', 'menu': 'help',
  'usage': 'help', 'guide': 'help', 'tutorial': 'help',
  // Items
  'dashboard': 'dashboard', 'dashboards': 'dashboard', 'dash': 'dashboard',
  'form': 'form', 'forms': 'form', 'formulaire': 'form',
  'workflows': 'workflow', 'wf': 'workflow',
  'module': 'module', 'modules': 'module', 'services': 'module', 'apis': 'module',
  'integration': 'module', 'integrations': 'module', 'connector': 'module',
  'share': 'share', 'shares': 'share', 'shared': 'share', 'sharing': 'share',
  'settings': 'settings', 'setting': 'settings', 'config': 'settings',
  'configuration': 'settings', 'preferences': 'settings',
  'users': 'users', 'user': 'users', 'management': 'users',
  'calendar': 'calendar', 'schedule': 'calendar', 'scheduled': 'calendar', 'cron': 'calendar',
  'tester': 'api-tester', 'testing': 'api-tester', 'test': 'api-tester',
  // Greetings
  'hi': 'hello', 'hey': 'hello', 'bonjour': 'hello', 'hallo': 'hello',
  'greetings': 'hello', 'howdy': 'hello', 'yo': 'hello', 'sup': 'hello',
  // Farewell
  'bye': 'goodbye', 'cya': 'goodbye', 'later': 'goodbye', 'ciao': 'goodbye',
  'au revoir': 'goodbye', 'tschüss': 'goodbye',
};

// Stop words to ignore in scoring
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
  'should', 'may', 'might', 'must', 'can', 'could', 'of', 'in', 'to',
  'for', 'with', 'on', 'at', 'from', 'by', 'up', 'about', 'into',
  'through', 'during', 'it', 'its', 'this', 'that', 'these', 'those',
  'i', 'me', 'my', 'we', 'us', 'our', 'you', 'your', 'he', 'she',
  'they', 'them', 'and', 'but', 'or', 'not', 'no', 'so', 'if', 'then',
  'please', 'just', 'also', 'like', 'want', 'need', 'let', 'get',
]);

// ── Navigation targets ───────────────────────────────────────────────────────

interface NavTarget {
  keywords: string[];
  route: string;
  label: string;
}

// ── Engine ────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class NluEngine {
  private readonly trainingData: TrainingSample[] = [];
  private readonly idfCache = new Map<string, number>();
  private readonly navTargets: NavTarget[] = [];
  private readonly moduleNames: { id: string; label: string; aliases: string[] }[] = [];
  private readonly contextHistory: Intent[] = [];

  constructor() {
    this.buildTrainingData();
    this.buildNavTargets();
    this.buildModuleVocab();
    this.computeIdf();
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  classify(input: string): NluResult {
    const rawTokens = this.tokenize(input);
    const normalizedTokens = rawTokens.map(t => this.normalize(t));
    const expandedTokens = this.expandSynonyms(normalizedTokens);
    const bigrams = this.generateNgrams(expandedTokens, 2);
    const allFeatures = [...expandedTokens, ...bigrams];

    // Score each intent
    const scores = new Map<Intent, number>();
    for (const sample of this.trainingData) {
      const similarity = this.cosineSimilarity(allFeatures, sample.tokens) * sample.weight;
      const current = scores.get(sample.intent) ?? 0;
      if (similarity > current) {
        scores.set(sample.intent, similarity);
      }
    }

    // Apply context boost (recent intents get a small bonus)
    for (const recentIntent of this.contextHistory.slice(-3)) {
      const current = scores.get(recentIntent) ?? 0;
      if (current > 0.1) {
        scores.set(recentIntent, current * 1.05);
      }
    }

    // Apply signal boosters for specific pattern detectors
    this.applySignalBoosters(expandedTokens, input.toLowerCase(), scores);

    // Find best intent
    let bestIntent: Intent = 'unknown';
    let bestScore = 0;
    for (const [intent, score] of scores) {
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }

    // Confidence normalization (sigmoid-like scaling)
    const confidence = Math.min(1, bestScore / (bestScore + 0.3));

    // Extract entities
    const entities = this.extractEntities(expandedTokens, input, bestIntent);

    // Resolve navigation route
    let route: string | undefined;
    let routeLabel: string | undefined;
    if (bestIntent === 'navigate') {
      const nav = this.resolveNavTarget(expandedTokens, input.toLowerCase());
      if (nav) {
        route = nav.route;
        routeLabel = nav.label;
      }
    }

    // Update context history
    if (bestIntent !== 'unknown') {
      this.contextHistory.push(bestIntent);
      if (this.contextHistory.length > 10) {
        this.contextHistory.shift();
      }
    }

    return { intent: bestIntent, confidence, entities, rawTokens, route, routeLabel };
  }

  // ── Tokenization & normalization ────────────────────────────────────────────

  private tokenize(input: string): string[] {
    return input
      .toLowerCase()
      .replaceAll(/[^\w\s'-]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 0);
  }

  private normalize(token: string): string {
    // Lightweight stemmer — suffix rules as a lookup table
    const suffixRules: [string, number, number][] = [
      ['ing',  3, 5],
      ['tion', 4, 6],
      ['ment', 4, 6],
      ['ness', 4, 6],
      ['able', 4, 6],
      ['ful',  3, 5],
      ['ly',   2, 4],
      ['ed',   2, 4],
      ['es',   2, 4],
    ];
    for (const [suffix, cut, minLen] of suffixRules) {
      if (token.endsWith(suffix) && token.length > minLen) {
        return token.slice(0, -cut);
      }
    }
    if (token.endsWith('s') && !token.endsWith('ss') && token.length > 3) {
      return token.slice(0, -1);
    }
    return token;
  }

  private expandSynonyms(tokens: string[]): string[] {
    const expanded: string[] = [];
    for (const t of tokens) {
      expanded.push(t);
      const syn = SYNONYMS[t];
      if (syn && syn !== t) {
        expanded.push(syn);
      }
    }
    return expanded;
  }

  private generateNgrams(tokens: string[], n: number): string[] {
    const ngrams: string[] = [];
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join('_'));
    }
    return ngrams;
  }

  // ── TF-IDF cosine similarity ────────────────────────────────────────────────

  private computeIdf(): void {
    const docCount = this.trainingData.length;
    const termDocs = new Map<string, number>();

    for (const sample of this.trainingData) {
      const uniqueTokens = new Set(sample.tokens);
      for (const t of uniqueTokens) {
        termDocs.set(t, (termDocs.get(t) ?? 0) + 1);
      }
    }

    for (const [term, df] of termDocs) {
      this.idfCache.set(term, Math.log((docCount + 1) / (df + 1)) + 1);
    }
  }

  private tfidf(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>();
    for (const t of tokens) {
      if (STOP_WORDS.has(t)) continue;
      tf.set(t, (tf.get(t) ?? 0) + 1);
    }
    const tfidfMap = new Map<string, number>();
    for (const [term, freq] of tf) {
      const idf = this.idfCache.get(term) ?? 1;
      tfidfMap.set(term, freq * idf);
    }
    return tfidfMap;
  }

  private cosineSimilarity(tokensA: string[], tokensB: string[]): number {
    const vecA = this.tfidf(tokensA);
    const vecB = this.tfidf(tokensB);

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    const allTerms = new Set([...vecA.keys(), ...vecB.keys()]);
    for (const term of allTerms) {
      const a = vecA.get(term) ?? 0;
      const b = vecB.get(term) ?? 0;
      dotProduct += a * b;
      normA += a * a;
      normB += b * b;
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // ── Signal boosters (rule-based feature detectors) ──────────────────────────

  private applySignalBoosters(tokens: string[], lower: string, scores: Map<Intent, number>): void {
    const boost = (intent: Intent, amount: number) => {
      scores.set(intent, (scores.get(intent) ?? 0) + amount);
    };

    // Pattern-based booster rules: [pattern, intent, boost amount]
    const regexBoosters: [RegExp, Intent, number][] = [
      [/\b(go\s+to|navigate\s+to|open|show\s+me|take\s+me|switch\s+to|jump\s+to)\b/,       'navigate',        0.4],
      [/\b(build|make|generate|design)\b.*\b(workflow|pipeline|automation|flow)\b/,           'create_workflow',  0.4],
      [/\b(search|find|lookup|look\s+for|locate)\b/,                                          'search',          0.4],
      [/\b(ask\s*(chatgpt|gpt|ai|openai)|chat\s*gpt|chatgpt)\b/,                              'ask_chatgpt',     0.6],
      [/\b(status|how many|count|summary|overview|stats)\b/,                                   'status',          0.3],
    ];
    for (const [pattern, intent, amount] of regexBoosters) {
      if (pattern.test(lower)) boost(intent, amount);
    }

    // Exact-match boosters (anchored to full input)
    const trimmed = lower.trim();
    const exactBoosters: [RegExp, Intent, number][] = [
      [/^(help|\?|what can you do|how do|capabilities|commands?)$/i,                            'help',  0.7],
      [/^(hello|hi|hey|bonjour|hallo|howdy|good\s+(morning|afternoon|evening))$/i,              'greet', 0.8],
    ];
    for (const [pattern, intent, amount] of exactBoosters) {
      if (pattern.test(trimmed)) boost(intent, amount);
    }

    // Combo boosters
    if (tokens.includes('create') && tokens.includes('workflow')) boost('create_workflow', 0.5);
    if (/\b(list|show|what)\b/.test(lower) && /\b(module|service|api|integration|connector)\b/.test(lower)) boost('list_modules', 0.5);

    // Page name detection — boost navigate if a known page/module name is mentioned
    this.boostNavigateIfPageDetected(tokens, lower, scores);
  }

  private boostNavigateIfPageDetected(tokens: string[], lower: string, scores: Map<Intent, number>): void {
    const navTarget = this.resolveNavTarget(tokens, lower);
    if (!navTarget) return;
    const currentNav = scores.get('navigate') ?? 0;
    // Only boost if no stronger intent detected
    if (currentNav < 0.3 && !tokens.includes('create') && !tokens.includes('search')) {
      scores.set('navigate', currentNav + 0.25);
    }
  }

  // ── Entity extraction ───────────────────────────────────────────────────────

  private extractEntities(tokens: string[], rawInput: string, intent: Intent): NluEntity[] {
    const entities: NluEntity[] = [];
    const lower = rawInput.toLowerCase();
    this.extractModuleEntities(tokens, lower, entities);
    this.extractPageEntities(tokens, entities);
    this.extractIntentSpecificEntities(rawInput, tokens, intent, entities);
    return this.deduplicateEntities(entities);
  }

  private extractModuleEntities(tokens: string[], lower: string, entities: NluEntity[]): void {
    for (const mod of this.moduleNames) {
      const mentioned = lower.includes(mod.label.toLowerCase()) || mod.aliases.some(a => lower.includes(a));
      if (mentioned) {
        entities.push({ type: 'module', value: mod.label, canonical: mod.id, confidence: 0.9 });
        continue;
      }
      this.fuzzyMatchModule(tokens, mod, entities);
    }
  }

  private fuzzyMatchModule(tokens: string[], mod: { id: string; label: string; aliases: string[] }, entities: NluEntity[]): void {
    for (const token of tokens) {
      for (const alias of mod.aliases) {
        if (this.levenshtein(token, alias) <= Math.max(1, Math.floor(alias.length * 0.25))) {
          entities.push({ type: 'module', value: mod.label, canonical: mod.id, confidence: 0.7 });
          return;
        }
      }
    }
  }

  private readonly pageKeywords: Record<string, { canonical: string; name: string }> = {
    'dashboard': { canonical: 'dashboard', name: 'Dashboards' },
    'form':      { canonical: 'form', name: 'Forms' },
    'workflow':  { canonical: 'workflow', name: 'Workflows' },
    'calendar':  { canonical: 'calendar', name: 'Calendar' },
    'settings':  { canonical: 'settings', name: 'Settings' },
    'users':     { canonical: 'users', name: 'User Management' },
    'share':     { canonical: 'shares', name: 'Shared Views' },
    'api-tester': { canonical: 'api-tester', name: 'API Tester' },
  };

  private extractPageEntities(tokens: string[], entities: NluEntity[]): void {
    for (const t of tokens) {
      const page = this.pageKeywords[t];
      if (page) {
        entities.push({ type: 'page', value: page.name, canonical: page.canonical, confidence: 0.85 });
      }
    }
  }

  private extractIntentSpecificEntities(rawInput: string, tokens: string[], intent: Intent, entities: NluEntity[]): void {
    if (intent === 'search') {
      const searchMatch = rawInput.replaceAll(/\b(search(?:\s+for)?|find|lookup|look\s+for|locate)\b/gi, '')
        .replaceAll(/\b(in|all|api|endpoints?|data|across|every|the|a|an)\b/gi, '').trim();
      if (searchMatch.length >= 2) {
        entities.push({ type: 'search_term', value: searchMatch, canonical: searchMatch.toLowerCase(), confidence: 0.9 });
      }
    }

    if (intent === 'ask_chatgpt') {
      const prompt = rawInput.replaceAll(/\b(ask\s*(chatgpt|gpt|ai|openai)|chat\s*gpt|chatgpt)\b/gi, '').trim();
      if (prompt) {
        entities.push({ type: 'freetext', value: prompt, canonical: prompt, confidence: 0.95 });
      }
    }

    for (const itemType of ['dashboard', 'form', 'workflow']) {
      if (tokens.includes(itemType)) {
        entities.push({ type: 'item_type', value: itemType, canonical: itemType, confidence: 0.85 });
      }
    }
  }

  private deduplicateEntities(entities: NluEntity[]): NluEntity[] {
    const seen = new Set<string>();
    return entities.filter(e => {
      const key = `${e.type}:${e.canonical}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // ── Navigation resolution ───────────────────────────────────────────────────

  private resolveNavTarget(tokens: string[], lower: string): NavTarget | null {
    let bestMatch: NavTarget | null = null;
    let bestScore = 0;

    for (const target of this.navTargets) {
      const score = this.scoreNavTarget(target, tokens, lower);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = target;
      }
    }

    return bestScore >= 1 ? bestMatch : null;
  }

  private scoreNavTarget(target: NavTarget, tokens: string[], lower: string): number {
    let score = 0;
    for (const kw of target.keywords) {
      if (lower.includes(kw)) {
        score += kw.split(/\s+/).length * 2;
      }
      score += this.scoreTokenOverlap(kw, tokens);
    }
    return score;
  }

  private scoreTokenOverlap(keyword: string, inputTokens: string[]): number {
    let score = 0;
    for (const kt of keyword.split(/\s+/)) {
      if (inputTokens.includes(kt)) score += 0.5;
      for (const inputToken of inputTokens) {
        if (this.levenshtein(inputToken, kt) <= 1 && inputToken !== kt) score += 0.3;
      }
    }
    return score;
  }

  // ── Levenshtein distance ────────────────────────────────────────────────────

  private levenshtein(a: string, b: string): number {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = [];

    for (let i = 0; i <= a.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost,
        );
      }
    }

    return matrix[a.length][b.length];
  }

  // ── Training data builder ───────────────────────────────────────────────────

  private buildTrainingData(): void {
    const add = (tokens: string[], intent: Intent, weight = 1) => {
      this.trainingData.push({ tokens, intent, weight });
    };

    // ── Navigate ──
    add(['navigate', 'go', 'to', 'page'], 'navigate', 1.2);
    add(['open', 'dashboard'], 'navigate', 1.2);
    add(['show', 'me', 'workflow'], 'navigate', 1.1);
    add(['go', 'to', 'settings'], 'navigate', 1.3);
    add(['take', 'me', 'to', 'form'], 'navigate', 1.2);
    add(['switch', 'to', 'calendar'], 'navigate', 1.2);
    add(['open', 'ic', 'dashboard'], 'navigate', 1.3);
    add(['show', 'invoice', 'dashboard'], 'navigate', 1.2);
    add(['navigate', 'share', 'view'], 'navigate', 1.2);
    add(['go', 'to', 'api', 'tester'], 'navigate', 1.2);
    add(['open', 'user', 'management'], 'navigate', 1.2);
    add(['view', 'zoho', 'crm'], 'navigate', 1.1);
    add(['browse', 'module'], 'navigate', 1);

    // ── Create workflow ──
    add(['create', 'workflow'], 'create_workflow', 1.5);
    add(['build', 'workflow', 'that', 'list'], 'create_workflow', 1.4);
    add(['make', 'workflow', 'get', 'data'], 'create_workflow', 1.3);
    add(['generate', 'automation', 'pipeline'], 'create_workflow', 1.3);
    add(['create', 'workflow', 'zoho', 'crm', 'contact'], 'create_workflow', 1.4);
    add(['build', 'workflow', 'impossible', 'cloud', 'storage'], 'create_workflow', 1.4);
    add(['new', 'workflow', 'invoice', 'book'], 'create_workflow', 1.3);
    add(['design', 'flow', 'api', 'call'], 'create_workflow', 1.2);
    add(['create', 'automation', 'fetch', 'record'], 'create_workflow', 1.3);

    // ── Search ──
    add(['search', 'data'], 'search', 1.3);
    add(['find', 'record'], 'search', 1.3);
    add(['search', 'for', 'invoice'], 'search', 1.3);
    add(['lookup', 'contact'], 'search', 1.2);
    add(['look', 'for', 'john'], 'search', 1.2);
    add(['locate', 'record', 'mock'], 'search', 1.2);
    add(['query', 'all', 'endpoint'], 'search', 1.1);
    add(['search', 'across', 'api'], 'search', 1.2);

    // ── ChatGPT ──
    add(['ask', 'chatgpt'], 'ask_chatgpt', 1.5);
    add(['ask', 'ai', 'question'], 'ask_chatgpt', 1.4);
    add(['chatgpt', 'what', 'is'], 'ask_chatgpt', 1.3);
    add(['ask', 'gpt', 'explain'], 'ask_chatgpt', 1.3);
    add(['chat', 'gpt', 'help', 'me'], 'ask_chatgpt', 1.2);
    add(['ai', 'tell', 'me', 'about'], 'ask_chatgpt', 1.2);

    // ── Help ──
    add(['help'], 'help', 1.5);
    add(['what', 'can', 'you', 'do'], 'help', 1.4);
    add(['capabilities'], 'help', 1.3);
    add(['show', 'commands'], 'help', 1.3);
    add(['how', 'do', 'use'], 'help', 1.2);
    add(['guide'], 'help', 1.2);

    // ── List modules ──
    add(['list', 'module'], 'list_modules', 1.4);
    add(['show', 'all', 'module'], 'list_modules', 1.3);
    add(['what', 'module', 'available'], 'list_modules', 1.3);
    add(['show', 'api', 'service'], 'list_modules', 1.2);
    add(['list', 'integration'], 'list_modules', 1.2);
    add(['what', 'api', 'connector'], 'list_modules', 1.2);

    // ── Greet ──
    add(['hello'], 'greet', 1.5);
    add(['hi', 'there'], 'greet', 1.4);
    add(['good', 'morning'], 'greet', 1.3);
    add(['good', 'afternoon'], 'greet', 1.3);
    add(['hey'], 'greet', 1.3);

    // ── Farewell ──
    add(['goodbye'], 'farewell', 1.5);
    add(['bye'], 'farewell', 1.4);
    add(['see', 'you'], 'farewell', 1.3);
    add(['exit'], 'farewell', 1.2);
    add(['quit'], 'farewell', 1.2);

    // ── Status ──
    add(['how', 'many', 'workflow'], 'status', 1.2);
    add(['status', 'overview'], 'status', 1.3);
    add(['summary', 'count'], 'status', 1.2);
    add(['stats', 'dashboard'], 'status', 1.1);
  }

  private buildNavTargets(): void {
    this.navTargets.push(
      { keywords: ['workflows', 'workflow list', 'my workflows'],         route: '/workflows',          label: 'Workflows' },
      { keywords: ['calendar', 'schedule', 'scheduled', 'cron'],          route: '/workflows/calendar', label: 'Schedule Calendar' },
      { keywords: ['new workflow', 'workflow builder', 'build workflow'],  route: '/workflows/new',      label: 'New Workflow' },
      { keywords: ['dashboards', 'dashboard list', 'my dashboards'],      route: '/dashboards',         label: 'Dashboards' },
      { keywords: ['new dashboard', 'dashboard builder'],                 route: '/dashboards/new',     label: 'New Dashboard' },
      { keywords: ['forms', 'form list', 'my forms'],                     route: '/forms',              label: 'Forms' },
      { keywords: ['new form', 'form builder'],                           route: '/forms/new',          label: 'New Form' },
      { keywords: ['shares', 'shared views', 'sharing', 'my shares'],     route: '/shares',             label: 'Shared Views' },
      { keywords: ['settings', 'configuration', 'config', 'preferences'], route: '/settings',           label: 'Settings' },
      { keywords: ['users', 'user management', 'manage users'],           route: '/users',              label: 'User Management' },
      { keywords: ['api tester', 'api testing', 'test api'],              route: '/api-tester',         label: 'API Tester' },
      { keywords: ['invoice dashboard', 'invoices overview'],             route: '/invoice-dashboard',  label: 'Invoice Dashboard' },
      { keywords: ['ic dashboard', 'impossible cloud dashboard'],         route: '/ic-dashboard',       label: 'IC Dashboard' },
      { keywords: ['ic management', 'impossible cloud management'],       route: '/ic-management',      label: 'IC Management' },
      { keywords: ['books dashboard', 'zoho books dashboard'],            route: '/books-dashboard',    label: 'Books Dashboard' },
      { keywords: ['books management', 'zoho books management'],          route: '/books-management',   label: 'Books Management' },
      { keywords: ['analytics dashboard', 'zoho analytics dashboard'],    route: '/analytics-dashboard', label: 'Analytics Dashboard' },
      { keywords: ['analytics management', 'zoho analytics management'],  route: '/analytics-management', label: 'Analytics Management' },
      { keywords: ['campaigns dashboard', 'zoho campaigns dashboard'],    route: '/campaigns-dashboard', label: 'Campaigns Dashboard' },
      { keywords: ['campaigns management', 'zoho campaigns management'],  route: '/campaigns-management', label: 'Campaigns Management' },
      { keywords: ['invoice management'],                                 route: '/invoice-management', label: 'Invoice Management' },
    );

    // Add module pages
    for (const m of MODULES) {
      this.navTargets.push({
        keywords: [m.label.toLowerCase(), m.id.replaceAll('-', ' '), m.id],
        route: `/${m.id}`,
        label: m.label,
      });
    }
  }

  private buildModuleVocab(): void {
    for (const m of MODULES) {
      this.moduleNames.push({
        id: m.id,
        label: m.label,
        aliases: [
          m.label.toLowerCase(),
          m.id.replaceAll('-', ' '),
          m.id,
          // Additional aliases from individual words
          ...m.label.toLowerCase().split(/[\s-]+/).filter(w => w.length > 2),
        ],
      });
    }
  }
}
