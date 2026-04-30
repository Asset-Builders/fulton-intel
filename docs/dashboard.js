/* =============================================================
 * FULTON COUNTY INTEL — Dashboard logic
 * Loads docs/data/records.json (refreshed by GitHub Action daily)
 * Falls back to inline demo data if the fetch fails (offline / first deploy)
 * ============================================================= */

// ---------- ICONS ----------
const ICON = {
  ga: `<svg viewBox="0 0 100 100"><path d="M22 22 L78 22 L78 28 L74 32 L74 40 L72 48 L70 58 L68 66 L62 74 L56 80 L48 80 L40 74 L36 66 L32 56 L26 46 L22 36 Z" /></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  calculator: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8.01" y2="10"/><line x1="12" y1="10" x2="12.01" y2="10"/><line x1="16" y1="10" x2="16.01" y2="10"/><line x1="8" y1="14" x2="8.01" y2="14"/><line x1="12" y1="14" x2="12.01" y2="14"/><line x1="16" y1="14" x2="16.01" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg>`,
  database: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  flame: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  thermometer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>`,
  activity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  scale: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 16h6l-3-9-3 9zM8 16H2l3-9 3 9zM7 21h10M12 3v18M3 7h18"/></svg>`,
  gavel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/></svg>`,
  receipt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2V2l-2 2-2-2-2 2-2-2-2 2-2-2-2 2Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>`,
  skull: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>`,
  scroll: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  zap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  chevL: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevR: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  ext: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
};

const SCORE_RULES = [
  { key: 'preforeclosure', label: 'Pre-foreclosure (NOSUP filed)', points: 40, hot: true },
  { key: 'taxDelinquent', label: 'Tax delinquent', points: 30 },
  { key: 'probate', label: 'Probate (decedent < 18mo)', points: 35, hot: true },
  { key: 'codeViolations', label: 'Active code violations', points: 20 },
  { key: 'vacant', label: 'Registered vacant property', points: 25 },
  { key: 'absenteeOwner', label: 'Out-of-state owner', points: 15 },
  { key: 'longTermOwner', label: 'Owned > 15 years', points: 10 },
  { key: 'highEquity', label: 'High equity (> 50%)', points: 15 },
  { key: 'multipleEvictions', label: 'Landlord — multiple evictions', points: 20 },
  { key: 'lien', label: 'Lien filed', points: 18 },
  { key: 'inheritedNotProbated', label: 'Heir property (no probate)', points: 22 },
  { key: 'divorce', label: 'Divorce filed', points: 18 },
];

const LEAD_TYPES = [
  { key: 'foreclosure', label: 'Foreclosure', icon: 'gavel', dotColor: '#f97316' },
  { key: 'tax', label: 'Tax', icon: 'receipt', dotColor: '#fbbf24' },
  { key: 'probate', label: 'Probate', icon: 'skull', dotColor: '#10b981' },
  { key: 'lis_pendens', label: 'Lis Pendens', icon: 'scale', dotColor: '#ef4444' },
  { key: 'judgment', label: 'Judgment', icon: 'scroll', dotColor: '#a855f7' },
  { key: 'lien', label: 'Lien', icon: 'alert', dotColor: '#3b82f6' },
];

const PIPELINE_STAGES = [
  { key: 'new', label: 'New' }, { key: 'researching', label: 'Researching' },
  { key: 'skipTraced', label: 'Skip Traced' }, { key: 'contacting', label: 'Contacting' },
  { key: 'discussion', label: 'In Discussion' }, { key: 'offer', label: 'Offer Made' },
  { key: 'contract', label: 'Under Contract' }, { key: 'closed', label: 'Closed' },
  { key: 'dead', label: 'Dead' },
];

const SETTINGS = { maoPercent: 70, wholesaleFee: 10000, closingCostPercent: 3, holdingMonths: 4, monthlyHoldingCost: 1500 };

const fmt$ = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-') : '—';
const fmtDateLong = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const calculateScore = lead => {
  const triggers = SCORE_RULES.filter(r => lead[r.key]);
  let raw = triggers.reduce((s, t) => s + t.points, 0);
  if (triggers.length >= 3) raw += 20;
  else if (triggers.length >= 2) raw += 10;
  return { score: Math.min(100, raw), triggers, stacked: triggers.length >= 2 };
};
const scoreClass = s => s >= 90 ? 'score-90' : s >= 70 ? 'score-70' : s >= 50 ? 'score-50' : s >= 30 ? 'score-30' : 'score-0';
const getPrimaryType = l => {
  if (l.preforeclosure) return 'foreclosure';
  if (l.divorce) return 'lis_pendens';
  if (l.lien && !l.taxDelinquent) return 'lien';
  if (l.taxDelinquent) return 'tax';
  if (l.probate || l.inheritedNotProbated) return 'probate';
  if (l.multipleEvictions) return 'judgment';
  return 'tax';
};
const getDocCode = t => ({ foreclosure: 'NOS', tax: 'TAX', probate: 'PR', lis_pendens: 'L/P', judgment: 'JD', lien: 'LN' }[t] || '—');
const getFiledDate = l => l.nosupDate || l.decedentDOD || l.addedAt;
const getAmount = (l, t) => {
  if (t === 'foreclosure') return l.mortgageBalance || 0;
  if (t === 'tax') return Math.round(l.assessedValue * 0.025 * 1.5);
  if (t === 'probate') return l.assessedValue;
  if (t === 'lien') return Math.round(5000 + (l.assessedValue * 0.05));
  if (t === 'lis_pendens') return Math.round(l.assessedValue * 0.4);
  if (t === 'judgment') return Math.round(15000 + (l.assessedValue * 0.08));
  return l.assessedValue;
};
const getFlags = lead => {
  const flags = [];
  const { stacked } = calculateScore(lead);
  const days = (Date.now() - new Date(lead.addedAt).getTime()) / 86400000;
  if (days <= 7) flags.push('New this week');
  if (lead.preforeclosure) flags.push('Pre-foreclosure');
  if (lead.taxDelinquent) flags.push('Tax delinquent');
  if (lead.probate) flags.push('Probate');
  if (lead.vacant) flags.push('Vacant');
  if (lead.absenteeOwner) flags.push('Absentee');
  if (/LLC|CORP|INC|TRUST|HOLDINGS|LP|REIT|LTD/i.test(lead.owner)) flags.push('LLC / corp owner');
  if (lead.highEquity) flags.push('High equity');
  if (stacked) flags.push('STACKED');
  return flags;
};
const flagClass = f => {
  if (f === 'STACKED') return 'flag-stacked';
  if (f === 'New this week') return 'flag-new';
  if (f === 'Pre-foreclosure') return 'flag-foreclosure';
  if (f === 'Tax delinquent') return 'flag-tax';
  if (f === 'Probate') return 'flag-probate';
  if (f === 'Vacant') return 'flag-vacant';
  if (f === 'High equity') return 'flag-equity';
  return 'flag-default';
};

const STORAGE_KEY = 'fulton-intel:v1';
let state = {
  leads: [], dataSource: 'demo', generatedAt: null,
  search: '', typeFilter: 'all', scoreFilter: 'all', sortBy: 'score-desc',
  page: 1, perPage: 25,
  openLead: null, drawerTab: 'overview',
  showCalc: false, showImport: false,
  comps: [], offer: null, notes: '',
};

async function loadData() {
  try {
    const res = await fetch('data/records.json?_=' + Date.now());
    if (!res.ok) throw new Error('fetch failed: ' + res.status);
    const data = await res.json();
    if (data.records && Array.isArray(data.records)) {
      mergeWithLocal(data.records);
      state.dataSource = data.source || 'live';
      state.generatedAt = data.generated_at || null;
      return;
    }
  } catch (e) {
    console.warn('Could not load records.json, using empty.', e);
  }
  state.leads = [];
}

function mergeWithLocal(records) {
  let local = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      (parsed.leads || []).forEach(l => { local[l.id] = { stage: l.stage, notes: l.notes }; });
    }
  } catch(e) {}
  state.leads = records.map(r => ({ ...r, stage: (local[r.id] && local[r.id].stage) || r.stage || 'new', notes: (local[r.id] && local[r.id].notes) || r.notes || '' }));
}

function saveLocal() {
  const minimal = state.leads.map(l => ({ id: l.id, stage: l.stage, notes: l.notes }));
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ leads: minimal })); } catch(e) {}
}

function updateLead(id, patch) {
  const i = state.leads.findIndex(l => l.id === id);
  if (i === -1) return;
  state.leads[i] = { ...state.leads[i], ...patch };
  saveLocal();
  if (state.openLead && state.openLead.id === id) state.openLead = state.leads[i];
  render();
}

function getFilteredLeads() {
  let r = state.leads.map(l => ({ ...l, _score: calculateScore(l).score, _type: getPrimaryType(l) }));
  if (state.search) {
    const s = state.search.toLowerCase();
    r = r.filter(l => l.address.toLowerCase().includes(s) || l.owner.toLowerCase().includes(s) || l.parcel.toLowerCase().includes(s) || l.city.toLowerCase().includes(s) || l.zip.includes(s) || (l.docNum || '').toLowerCase().includes(s) || (l.legalDesc || '').toLowerCase().includes(s));
  }
  if (state.typeFilter !== 'all') r = r.filter(l => l._type === state.typeFilter);
  if (state.scoreFilter === 'hot') r = r.filter(l => l._score >= 70);
  else if (state.scoreFilter === 'warm') r = r.filter(l => l._score >= 50 && l._score < 70);
  else if (state.scoreFilter === 'active') r = r.filter(l => l._score >= 30 && l._score < 50);
  if (state.sortBy === 'score-desc') r.sort((a, b) => b._score - a._score);
  else if (state.sortBy === 'score-asc') r.sort((a, b) => a._score - b._score);
  else if (state.sortBy === 'filed-desc') r.sort((a, b) => (getFiledDate(b) || '').localeCompare(getFiledDate(a) || ''));
  else if (state.sortBy === 'amount-desc') r.sort((a, b) => getAmount(b, b._type) - getAmount(a, a._type));
  return r;
}

function exportLeads(leads, format) {
  let headers, rows;
  if (format === 'skiptrace') {
    headers = ['First Name','Last Name','Property Address','Property City','Property State','Property Zip','Mailing Address','Parcel ID','Owner Type'];
    rows = leads.map(l => {
      const parts = l.owner.split(' ');
      return [parts[0] || '', parts.slice(1).join(' ') || '', l.address, l.city, 'GA', l.zip, l.ownerMailing, l.parcel, l.absenteeOwner ? 'Absentee' : 'Resident'];
    });
  } else {
    headers = ['firstName','lastName','companyName','address1','city','state','postalCode','tags','customField.parcel','customField.score','customField.triggers'];
    rows = leads.map(l => {
      const sc = calculateScore(l);
      const parts = l.owner.split(' ');
      const isCorp = /LLC|CORP|INC|TRUST|HOLDINGS/i.test(l.owner);
      return [
        isCorp ? '' : (parts[0] || ''), isCorp ? '' : (parts.slice(1).join(' ') || ''),
        isCorp ? l.owner : '', l.address, l.city, 'GA', l.zip,
        'score:' + sc.score + ';' + sc.triggers.map(t => t.key).join(','),
        l.parcel, sc.score, sc.triggers.map(t => t.label).join('; '),
      ];
    });
  }
  const csv = [headers.join(','), ...rows.map(r => r.map(c => {
    const s = String(c == null ? '' : c);
    return s.includes(',') || s.includes('"') ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fulton-' + format + '-' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function withColor(svg, color) { return svg.replace('<svg ', `<svg class="icon" style="color:${color};" `); }

function render() {
  const root = document.getElementById('app');
  root.innerHTML = renderHeader() + renderToolbar() + renderBody();
  if (state.openLead) root.insertAdjacentHTML('beforeend', renderDrawer());
  if (state.showCalc) root.insertAdjacentHTML('beforeend', renderCalcModal());
  if (state.showImport) root.insertAdjacentHTML('beforeend', renderImportModal());
  attachHandlers();
}

function renderHeader() {
  const updated = state.generatedAt ? new Date(state.generatedAt) : new Date();
  const time = updated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const date = updated.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `
    <div class="header">
      <div class="header-left">
        <div class="ga-logo">${ICON.ga}</div>
        <div>
          <div class="header-title">FULTON COUNTY INTEL</div>
          <div class="header-sub">Motivated Seller Intelligence</div>
        </div>
      </div>
      <div class="header-right">
        <div class="header-status">${ICON.clock}<span class="mono">Updated ${date}, ${time}</span><div class="pulse"></div></div>
        <button class="btn btn-primary" data-act="export-ghl">${ICON.download} GHL CSV</button>
      </div>
    </div>`;
}

function renderToolbar() {
  const total = state.leads.length;
  const stacked = state.leads.filter(l => calculateScore(l).stacked).length;
  return `
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="btn btn-primary" data-act="open-calc">${ICON.calculator} Calculator</button>
        <button class="btn btn-secondary" data-act="open-import">${ICON.upload} Import Tax List</button>
        <button class="btn btn-secondary" data-act="export-skip">${ICON.download} Skip Trace CSV</button>
        <button class="btn btn-secondary" data-act="export-ghl">${ICON.download} GHL CSV</button>
      </div>
      <div class="toolbar-right">
        <div class="pill">${ICON.database}<span class="label">RECORDS:</span><span class="value mono">${total.toLocaleString()}</span><span class="label">imported</span></div>
        <div class="pill pill-blue" style="color:#2563eb;">${ICON.layers}<span class="value mono" style="color:#2563eb;">${stacked}</span><span style="color:#2563eb;font-weight:700;letter-spacing:0.06em;">STACKED</span></div>
      </div>
    </div>`;
}

function renderBody() {
  return '<div class="body">' + renderSidebar() + renderMain() + '</div>';
}

function renderSidebar() {
  const counts = { all: state.leads.length, foreclosure: 0, tax: 0, probate: 0, lis_pendens: 0, judgment: 0, lien: 0 };
  state.leads.forEach(l => { const t = getPrimaryType(l); if (counts[t] != null) counts[t]++; });
  const sc = { all: state.leads.length, hot: 0, warm: 0, active: 0 };
  state.leads.forEach(l => {
    const s = calculateScore(l).score;
    if (s >= 70) sc.hot++; else if (s >= 50) sc.warm++; else if (s >= 30) sc.active++;
  });
  const isActive = v => v === state.typeFilter;
  const isActiveScore = v => v === state.scoreFilter;
  return `
    <div class="sidebar">
      <div class="sidebar-section">
        <div class="sidebar-heading">LEAD TYPES</div>
        <button class="side-item ${isActive('all') ? 'active' : ''}" data-act="filter-type" data-val="all">
          ${withColor(ICON.layers, isActive('all') ? 'white' : '#64748b')}<span class="label">All</span><span class="count">${counts.all.toLocaleString()}</span>
        </button>
        ${LEAD_TYPES.map(t => `
          <button class="side-item ${isActive(t.key) ? 'active' : ''}" data-act="filter-type" data-val="${t.key}">
            ${withColor(ICON[t.icon], isActive(t.key) ? 'white' : t.dotColor)}<span class="label">${t.label}</span><span class="count">${(counts[t.key] || 0).toLocaleString()}</span>
          </button>`).join('')}
      </div>
      <div class="sidebar-section">
        <div class="sidebar-heading">SCORE FILTERS</div>
        <button class="side-item ${isActiveScore('all') ? 'active' : ''}" data-act="filter-score" data-val="all">
          <span class="icon" style="color:${isActiveScore('all') ? 'white' : '#3b82f6'};font-size:16px;">★</span><span class="label">All Scores</span><span class="count">${sc.all.toLocaleString()}</span>
        </button>
        <button class="side-item ${isActiveScore('hot') ? 'active' : ''}" data-act="filter-score" data-val="hot">
          ${withColor(ICON.flame, isActiveScore('hot') ? 'white' : '#ef4444')}<span class="label">Hot (≥70)</span><span class="count">${sc.hot.toLocaleString()}</span>
        </button>
        <button class="side-item ${isActiveScore('warm') ? 'active' : ''}" data-act="filter-score" data-val="warm">
          ${withColor(ICON.thermometer, isActiveScore('warm') ? 'white' : '#f59e0b')}<span class="label">Warm (≥50)</span><span class="count">${sc.warm.toLocaleString()}</span>
        </button>
        <button class="side-item ${isActiveScore('active') ? 'active' : ''}" data-act="filter-score" data-val="active">
          ${withColor(ICON.activity, isActiveScore('active') ? 'white' : '#10b981')}<span class="label">Active (≥30)</span><span class="count">${sc.active.toLocaleString()}</span>
        </button>
      </div>
    </div>`;
}

function renderMain() {
  const total = state.leads.length;
  const hot = state.leads.filter(l => calculateScore(l).score >= 70).length;
  const warm = state.leads.filter(l => { const s = calculateScore(l).score; return s >= 50 && s < 70; }).length;
  const withAddr = state.leads.filter(l => l.address && l.ownerMailing).length;
  const dates = state.leads.map(l => getFiledDate(l)).filter(Boolean).sort();
  const dateRange = dates.length ? `${dates[0].replace(/-/g,'/')}–${dates[dates.length - 1].replace(/-/g,'/')}` : '—';
  const counts = { foreclosure: 0, tax: 0, probate: 0, lis_pendens: 0, judgment: 0, lien: 0 };
  state.leads.forEach(l => { const t = getPrimaryType(l); if (counts[t] != null) counts[t]++; });

  const isDemoData = state.dataSource === 'demo';
  const banner = isDemoData
    ? `<div class="demo-banner">${ICON.alert}<div><strong>Demo data.</strong> ${total} sample leads. To replace with live data, run a scraper or import a Tax List. See README.</div></div>`
    : `<div class="demo-banner live-banner">${ICON.check}<div><strong>Live data.</strong> ${total} records last refreshed ${state.generatedAt ? new Date(state.generatedAt).toLocaleString() : 'recently'}.</div></div>`;

  return `
    <div class="main">
      <div class="main-grid">
        ${banner}
        <div class="stat-row">
          ${statCard('database', '#2563eb', '#eff6ff', total.toLocaleString(), 'TOTAL RECORDS')}
          ${statCard('flame', '#ef4444', '#fef2f2', hot.toLocaleString(), 'HOT LEADS (≥70)')}
          ${statCard('thermometer', '#f59e0b', '#fffbeb', warm.toLocaleString(), 'WARM LEADS (50–69)')}
          ${statCard('home', '#059669', '#ecfdf5', withAddr.toLocaleString(), 'WITH ADDRESS')}
          ${statCard('calendar', '#2563eb', '#eff6ff', dateRange, 'DATE RANGE', true)}
        </div>
        <div class="legend">
          ${LEAD_TYPES.map(t => `<div class="legend-item"><div class="legend-dot" style="background:${t.dotColor}"></div><span class="legend-label">${t.label}</span><span class="legend-count">${(counts[t.key] || 0).toLocaleString()}</span></div>`).join('')}
        </div>
        <div class="filter-row">
          <div class="search-box">${ICON.search}<input id="search-input" placeholder="Search owner, address, doc number, legal..." value="${escapeHtml(state.search)}" /></div>
          <select class="select" id="sort-select">
            <option value="score-desc" ${state.sortBy === 'score-desc' ? 'selected' : ''}>Score: High → Low</option>
            <option value="score-asc" ${state.sortBy === 'score-asc' ? 'selected' : ''}>Score: Low → High</option>
            <option value="filed-desc" ${state.sortBy === 'filed-desc' ? 'selected' : ''}>Filed: Newest</option>
            <option value="amount-desc" ${state.sortBy === 'amount-desc' ? 'selected' : ''}>Amount: High → Low</option>
          </select>
          <button class="filter-btn ${state.typeFilter === 'all' ? 'active' : ''}" data-act="filter-type" data-val="all">All Scores</button>
          ${LEAD_TYPES.map(t => `<button class="filter-btn ${state.typeFilter === t.key ? 'active' : ''}" data-act="filter-type" data-val="${t.key}">${t.label}</button>`).join('')}
          <button class="filter-btn">${ICON.filter} Filters</button>
        </div>
        ${renderTable()}
      </div>
    </div>`;
}

function statCard(icon, color, bg, value, label, small) {
  return `<div class="stat-card"><div class="stat-icon" style="background:${bg};color:${color};">${ICON[icon]}</div><div style="min-width:0;flex:1;"><div class="stat-value ${small ? 'small' : ''}">${value}</div><div class="stat-label">${label}</div></div></div>`;
}

function renderTable() {
  const filtered = getFilteredLeads();
  const totalPages = Math.max(1, Math.ceil(filtered.length / state.perPage));
  if (state.page > totalPages) state.page = totalPages;
  const paged = filtered.slice((state.page - 1) * state.perPage, state.page * state.perPage);
  const start = filtered.length === 0 ? 0 : (state.page - 1) * state.perPage + 1;
  const end = Math.min(state.page * state.perPage, filtered.length);
  return `
    <div class="table-wrap">
      <div class="table-header"><span style="color:#64748b">Showing </span><span class="total">${start.toLocaleString()}–${end.toLocaleString()}</span><span style="color:#64748b"> of </span><span class="total">${filtered.length.toLocaleString()}</span><span style="color:#64748b"> records</span></div>
      <div class="table-scroll">
        <table>
          <thead><tr><th>SCORE</th><th>TYPE</th><th>DOC</th><th>FILED</th><th>OWNER / GRANTOR</th><th>PROPERTY ADDRESS</th><th>MAILING ADDRESS</th><th class="right">AMOUNT</th><th>FLAGS</th><th>LEGAL DESC</th><th>DOC LINK</th></tr></thead>
          <tbody>${paged.length === 0 ? `<tr><td colspan="11" style="text-align:center;padding:48px;color:#94a3b8;">No records match your filters.</td></tr>` : paged.map(renderRow).join('')}</tbody>
        </table>
      </div>
      ${renderPagination(totalPages)}
    </div>`;
}

function renderRow(lead) {
  const { score } = calculateScore(lead);
  const type = getPrimaryType(lead);
  const typeMeta = LEAD_TYPES.find(t => t.key === type);
  const flags = getFlags(lead).slice(0, 4);
  const mailing = lead.ownerMailing.split(',');
  return `
    <tr data-act="open-lead" data-id="${lead.id}">
      <td class="nowrap"><div class="score-badge ${scoreClass(score)}">${score}</div></td>
      <td class="nowrap"><span class="type-chip type-${type}">${ICON[typeMeta.icon]}${typeMeta.label.toUpperCase()}</span></td>
      <td class="nowrap doc-cell">${getDocCode(type)}</td>
      <td class="nowrap filed-cell">${fmtDate(getFiledDate(lead))}</td>
      <td><div class="owner-name">${escapeHtml(lead.owner)}</div>${lead.decedentName ? `<div class="owner-meta">via: ESTATE OF ${escapeHtml(lead.decedentName.toUpperCase())}</div>` : ''}</td>
      <td><div class="property-addr">${escapeHtml(lead.address)}</div><div class="property-meta">${escapeHtml(lead.city)}, GA ${lead.zip}</div></td>
      <td><div class="truncate" style="font-size:12px;color:#334155;">${escapeHtml(mailing[0])}</div><div class="truncate property-meta">${escapeHtml(mailing.slice(1).join(',').trim())}</div></td>
      <td class="right amount">${fmt$(getAmount(lead, type))}</td>
      <td><div class="flags-stack">${flags.map(f => `<span class="flag-chip ${flagClass(f)}">${f}</span>`).join('')}</div></td>
      <td class="legal-cell">${escapeHtml(lead.legalDesc || '—')}</td>
      <td class="nowrap"><a class="doc-link" href="https://qpublic.schneidercorp.com/Application.aspx?App=FultonCountyGA" target="_blank" rel="noopener" data-stop-propagation>qPublic ${ICON.ext}</a>${lead.docNum && lead.docNum !== '—' ? `<div class="doc-num">#${escapeHtml(lead.docNum)}</div>` : ''}</td>
    </tr>`;
}

function renderPagination(totalPages) {
  let pages = [];
  if (totalPages <= 7) for (let i = 1; i <= totalPages; i++) pages.push(i);
  else pages = [1, 2, 3, '...', totalPages];
  return `
    <div class="pagination">
      <div class="pag-left"><span>Rows per page:</span>
        <select class="select" id="perpage-select" style="padding:4px 8px;">
          <option value="10" ${state.perPage === 10 ? 'selected' : ''}>10</option>
          <option value="25" ${state.perPage === 25 ? 'selected' : ''}>25</option>
          <option value="50" ${state.perPage === 50 ? 'selected' : ''}>50</option>
          <option value="100" ${state.perPage === 100 ? 'selected' : ''}>100</option>
        </select></div>
      <div class="pag-right">
        <button class="pag-btn" data-act="page-prev" ${state.page === 1 ? 'disabled' : ''}>${ICON.chevL}</button>
        ${pages.map(p => p === '...' ? `<span class="ellipsis">…</span>` : `<button class="pag-btn ${state.page === p ? 'active' : ''}" data-act="page-set" data-val="${p}">${p}</button>`).join('')}
        <button class="pag-btn" data-act="page-next" ${state.page === totalPages ? 'disabled' : ''}>${ICON.chevR}</button>
      </div>
    </div>`;
}

function renderDrawer() {
  const lead = state.openLead;
  const { score, triggers, stacked } = calculateScore(lead);
  const type = getPrimaryType(lead);
  const typeMeta = LEAD_TYPES.find(t => t.key === type);
  const equity = lead.assessedValue - (lead.mortgageBalance || 0);
  const equityPct = lead.assessedValue ? Math.round((equity / lead.assessedValue) * 100) : 0;
  let bodyHtml = '';
  if (state.drawerTab === 'overview') bodyHtml = renderOverviewTab(lead, equity, equityPct);
  else if (state.drawerTab === 'triggers') bodyHtml = renderTriggersTab(lead, triggers, stacked);
  else if (state.drawerTab === 'comps') bodyHtml = renderCompsTab(lead);
  else if (state.drawerTab === 'offer') bodyHtml = renderOfferTab(lead);
  else if (state.drawerTab === 'notes') bodyHtml = renderNotesTab(lead);
  return `
    <div class="drawer-overlay" data-act="close-drawer-bg">
      <div class="drawer-backdrop"></div>
      <div class="drawer" data-stop-propagation>
        <div class="drawer-header">
          <div class="drawer-head-row">
            <div class="drawer-head-left">
              <div class="drawer-score ${scoreClass(score)}">${score}</div>
              <div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                  <span class="type-chip type-${type}">${ICON[typeMeta.icon]}${typeMeta.label.toUpperCase()}</span>
                  ${stacked ? `<span class="flag-chip flag-stacked">STACKED</span>` : ''}
                  <span style="font-size:12px;color:#94a3b8;font-family:'JetBrains Mono',monospace;">${lead.id}</span>
                </div>
                <h2 class="drawer-title">${escapeHtml(lead.address)}</h2>
                <p class="drawer-sub">${escapeHtml(lead.city)}, GA ${lead.zip} · <span class="mono" style="text-transform:none;">${escapeHtml(lead.parcel)}</span></p>
              </div>
            </div>
            <button class="close-btn" data-act="close-drawer">${ICON.x}</button>
          </div>
        </div>
        <div class="drawer-tabs">
          ${['overview','triggers','comps','offer','notes'].map(t => `<button class="drawer-tab ${state.drawerTab === t ? 'active' : ''}" data-act="set-tab" data-val="${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</button>`).join('')}
        </div>
        <div class="drawer-body">${bodyHtml}</div>
      </div>
    </div>`;
}

function renderOverviewTab(lead, equity, equityPct) {
  const mao = lead.estimatedARV * (SETTINGS.maoPercent / 100) - 25000 - SETTINGS.wholesaleFee;
  return `
    <div class="stack">
      <div class="grid-2">
        <div class="card"><div class="card-label">OWNER</div>
          <div style="font-weight:700;color:#0f172a;font-size:14px;">${escapeHtml(lead.owner)}</div>
          <div style="font-size:12px;color:#64748b;margin-top:4px;">${escapeHtml(lead.ownerMailing)}</div>
          ${lead.absenteeOwner ? `<div style="margin-top:8px;font-size:11px;display:inline-flex;gap:4px;color:#92400e;background:#fffbeb;padding:2px 8px;border-radius:4px;border:1px solid #fde68a;">⚠ Absentee owner</div>` : ''}</div>
        <div class="card"><div class="card-label">PROPERTY</div>
          <div class="grid-3">
            <div class="kv"><div class="kv-key">Beds</div><div class="kv-val">${lead.beds || '—'}</div></div>
            <div class="kv"><div class="kv-key">Baths</div><div class="kv-val">${lead.baths || '—'}</div></div>
            <div class="kv"><div class="kv-key">SqFt</div><div class="kv-val">${(lead.sqft || 0).toLocaleString()}</div></div>
            <div class="kv"><div class="kv-key">Built</div><div class="kv-val">${lead.yearBuilt}</div></div>
            <div class="kv" style="grid-column:span 2;"><div class="kv-key">Last Sale</div><div class="kv-val">${fmtDateLong(lead.lastSaleDate)} · ${fmt$(lead.lastSalePrice)}</div></div>
          </div></div>
      </div>
      <div class="grid-4">
        <div class="stat-mini"><div class="lbl">ASSESSED</div><div class="val">${fmt$(lead.assessedValue)}</div></div>
        <div class="stat-mini"><div class="lbl">EST. ARV</div><div class="val">${fmt$(lead.estimatedARV)}</div></div>
        <div class="stat-mini"><div class="lbl">MORTGAGE</div><div class="val">${fmt$(lead.mortgageBalance)}</div></div>
        <div class="stat-mini"><div class="lbl">EQUITY</div><div class="val ${equityPct > 50 ? 'green' : ''}">${fmt$(equity)} (${equityPct}%)</div></div>
      </div>
      <div class="mao-card">
        <div class="mao-label">QUICK MAO ESTIMATE</div>
        <div class="mao-value">${fmt$(mao)}</div>
        <div class="mao-formula">${SETTINGS.maoPercent}% × ${fmt$(lead.estimatedARV)} − repairs est. − fee</div>
        <button class="btn" style="margin-top:14px;background:#3b82f6;color:white;font-size:12px;padding:6px 12px;" data-act="set-tab" data-val="offer">Open full deal calculator →</button>
      </div>
      <div><div class="card-label" style="margin-bottom:8px;">PIPELINE STAGE</div>
        <div class="stage-row">${PIPELINE_STAGES.map(s => `<button class="stage-btn ${lead.stage === s.key ? 'active' : ''}" data-act="set-stage" data-val="${s.key}">${s.label}</button>`).join('')}</div>
      </div>
    </div>`;
}

function renderTriggersTab(lead, triggers, stacked) {
  return `
    <div class="stack-sm">
      <div style="font-size:13px;color:#64748b;margin-bottom:8px;">Score breakdown — ${triggers.length} trigger${triggers.length !== 1 ? 's' : ''}</div>
      ${triggers.map(t => `
        <div class="trigger-card ${t.hot ? 'hot' : ''}">
          <div style="flex:1;">
            <div class="trigger-name">${t.label}${t.hot ? `<span class="hot-badge">HOT</span>` : ''}</div>
            ${t.key === 'preforeclosure' && lead.nosupDate ? `<div class="trigger-meta" style="color:#b91c1c;">NOSUP filed ${fmtDateLong(lead.nosupDate)} · auction ${fmtDateLong(lead.auctionDate)}</div>` : ''}
            ${t.key === 'probate' && lead.decedentName ? `<div class="trigger-meta">Decedent: ${escapeHtml(lead.decedentName)} · DOD ${fmtDateLong(lead.decedentDOD)}</div>` : ''}
            ${t.key === 'codeViolations' && lead.codeIssues ? `<div class="trigger-meta">${lead.codeIssues.join(', ')}</div>` : ''}
          </div>
          <div class="trigger-points">+${t.points}</div>
        </div>`).join('')}
      ${stacked ? `<div class="stack-bonus">${ICON.zap}<div><strong>Stacking bonus: +${triggers.length >= 3 ? 20 : 10}</strong> for ${triggers.length} concurrent signals.</div></div>` : ''}
    </div>`;
}

function renderCompsTab(lead) {
  if (state.comps.length === 0) state.comps = [{}, {}, {}];
  const valid = state.comps.filter(c => c.soldPrice && c.sqft);
  const avgPSF = valid.length ? valid.reduce((s, c) => s + (Number(c.soldPrice) / Number(c.sqft)), 0) / valid.length : 0;
  const computedARV = avgPSF * lead.sqft;
  return `
    <div class="stack">
      <div class="info-banner"><strong>Comp tool:</strong> enter 3+ recent sold sales within 1 mile, similar bed/bath/sqft, sold in the last 6 months. Avg $/sqft × subject sqft = ARV.</div>
      <div class="comp-table">
        <div class="comp-row comp-head"><div>ADDRESS</div><div class="right">SOLD</div><div class="right">SQFT</div><div class="right">$/SQFT</div><div>DATE</div></div>
        ${state.comps.map((c, i) => `
          <div class="comp-row">
            <input class="comp-input" data-comp-i="${i}" data-comp-k="addr" value="${escapeHtml(c.addr || '')}" placeholder="123 Comp St" />
            <input class="comp-input right" data-comp-i="${i}" data-comp-k="soldPrice" value="${escapeHtml(c.soldPrice || '')}" placeholder="350000" />
            <input class="comp-input right" data-comp-i="${i}" data-comp-k="sqft" value="${escapeHtml(c.sqft || '')}" placeholder="1450" />
            <div class="right mono" style="font-size:12px;font-weight:600;">${c.soldPrice && c.sqft ? '$' + (c.soldPrice / c.sqft).toFixed(0) : '—'}</div>
            <input class="comp-input" type="date" data-comp-i="${i}" data-comp-k="date" value="${escapeHtml(c.date || '')}" />
          </div>`).join('')}
      </div>
      <button class="btn btn-secondary" data-act="add-comp" style="font-size:12px;color:#2563eb;border:none;padding:0;background:none;">${ICON.plus} Add comp</button>
      <div class="grid-3">
        <div class="stat-mini"><div class="lbl">AVG $/SQFT</div><div class="val">${avgPSF ? '$' + avgPSF.toFixed(0) : '—'}</div></div>
        <div class="stat-mini"><div class="lbl">SUBJECT SQFT</div><div class="val">${(lead.sqft || 0).toLocaleString()}</div></div>
        <div class="stat-mini" style="background:#ecfdf5;border-color:#a7f3d0;"><div class="lbl" style="color:#047857;">COMPUTED ARV</div><div class="val green">${computedARV ? fmt$(computedARV) : '—'}</div></div>
      </div>
      <div style="font-size:12px;color:#64748b;font-style:italic;">Originally listed est. ARV: <span class="mono" style="font-weight:600;">${fmt$(lead.estimatedARV)}</span>.</div>
    </div>`;
}

function renderOfferTab(lead) {
  if (!state.offer || state.offer.id !== lead.id) {
    state.offer = { id: lead.id, arv: lead.estimatedARV, repairs: Math.round((lead.estimatedARV - lead.assessedValue) * 0.4 + 25000), maoPct: SETTINGS.maoPercent, fee: SETTINGS.wholesaleFee };
  }
  const o = state.offer;
  const mao = o.arv * (o.maoPct / 100) - o.repairs - o.fee;
  const closingCosts = o.arv * (SETTINGS.closingCostPercent / 100);
  const totalIn = mao + o.repairs + closingCosts + (SETTINGS.holdingMonths * SETTINGS.monthlyHoldingCost) + o.fee;
  const flipProfit = o.arv - totalIn;
  const flipROI = totalIn ? (flipProfit / totalIn) * 100 : 0;
  return `
    <div class="stack">
      <div class="grid-2">
        ${offerField('arv', 'ARV', o.arv)}
        ${offerField('repairs', 'Estimated Repairs', o.repairs)}
        ${offerField('maoPct', 'MAO % of ARV', o.maoPct, '', '%')}
        ${offerField('fee', 'Wholesale Fee', o.fee, '$')}
      </div>
      <div class="mao-card">
        <div class="mao-label">MAXIMUM ALLOWABLE OFFER</div>
        <div class="mao-value" style="font-size:48px;">${fmt$(mao)}</div>
        <div class="grid-2" style="margin-top:8px;">
          <div class="mao-formula">${fmt$(o.arv)} × ${o.maoPct}% = ${fmt$(o.arv * o.maoPct / 100)}</div>
          <div class="mao-formula">− Repairs ${fmt$(o.repairs)}</div>
          <div class="mao-formula">− Fee ${fmt$(o.fee)}</div>
          <div class="mao-formula" style="color:#93c5fd;font-weight:700;">= MAO ${fmt$(mao)}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-label">FLIP SCENARIO (IF YOU TOOK IT DOWN)</div>
        <div class="grid-3">
          <div class="kv"><div class="kv-key">Total in</div><div class="kv-val">${fmt$(totalIn)}</div></div>
          <div class="kv"><div class="kv-key">Profit</div><div class="kv-val mono" style="color:${flipProfit > 0 ? '#059669' : '#dc2626'};font-size:16px;">${fmt$(flipProfit)}</div></div>
          <div class="kv"><div class="kv-key">ROI</div><div class="kv-val mono" style="color:${flipROI > 0 ? '#059669' : '#dc2626'};font-size:16px;">${flipROI.toFixed(1)}%</div></div>
        </div>
      </div>
    </div>`;
}
function offerField(key, label, value, prefix, suffix) {
  return `<div class="offer-field"><label>${label}</label><div class="offer-input-wrap">${prefix ? `<span class="affix">${prefix}</span>` : ''}<input type="number" data-offer-k="${key}" value="${value}" />${suffix ? `<span class="affix">${suffix}</span>` : ''}</div></div>`;
}

function renderNotesTab(lead) {
  if (state.notes !== lead.notes && state.notes === '') state.notes = lead.notes || '';
  return `
    <div class="stack-sm">
      <textarea id="notes-textarea" placeholder="Notes, contact attempts, conversations...">${escapeHtml(state.notes)}</textarea>
      <button class="btn btn-primary" data-act="save-notes" style="align-self:flex-start;">Save notes</button>
    </div>`;
}

function renderCalcModal() {
  if (!state.calc) state.calc = { arv: 300000, repairs: 35000, maoPct: SETTINGS.maoPercent, fee: SETTINGS.wholesaleFee };
  const c = state.calc;
  const mao = c.arv * (c.maoPct / 100) - c.repairs - c.fee;
  return `
    <div class="modal-overlay" data-act="close-calc-bg">
      <div class="modal-backdrop"></div>
      <div class="modal" data-stop-propagation>
        <div class="modal-head">
          <div><div class="modal-eyebrow">DEAL CALCULATOR</div><div class="modal-title">Make a quick offer</div></div>
          <button class="close-btn" data-act="close-calc">${ICON.x}</button>
        </div>
        <div class="modal-body">
          <div class="grid-2">
            ${calcField('arv', 'ARV', c.arv, '$')}
            ${calcField('repairs', 'Repairs', c.repairs, '$')}
            ${calcField('maoPct', 'MAO %', c.maoPct, '', '%')}
            ${calcField('fee', 'Fee', c.fee, '$')}
          </div>
          <div class="mao-card"><div class="mao-label">MAO</div><div class="mao-value" style="font-size:48px;">${fmt$(mao)}</div></div>
          <button class="btn btn-primary" data-act="close-calc" style="width:100%;justify-content:center;">Close</button>
        </div>
      </div>
    </div>`;
}
function calcField(key, label, value, prefix, suffix) {
  return `<div class="offer-field"><label>${label}</label><div class="offer-input-wrap">${prefix ? `<span class="affix">${prefix}</span>` : ''}<input type="number" data-calc-k="${key}" value="${value}" />${suffix ? `<span class="affix">${suffix}</span>` : ''}</div></div>`;
}

function renderImportModal() {
  return `
    <div class="modal-overlay" data-act="close-import-bg">
      <div class="modal-backdrop"></div>
      <div class="modal" data-stop-propagation>
        <div class="modal-head">
          <div><div class="modal-eyebrow">DATA INGESTION</div><div class="modal-title">Import from a source</div></div>
          <button class="close-btn" data-act="close-import">${ICON.x}</button>
        </div>
        <div class="modal-body">
          <div style="font-size:13px;color:#64748b;">Import a Tax List or other data file. In production, this would parse the file, match by parcel ID, and merge new records into your leads.</div>
          <div class="stack-sm">
            ${[
              ['Delinquent Tax List', 'Excel/CSV from Tax Commissioner Open Records'],
              ['Sheriff Tax Sale PDF', 'Monthly levy list'],
              ['Legal Organ Notices', 'NOSUPs and probate notices'],
              ['GSCCCA Lien Index export', 'CSV from paid acct'],
              ['Atlanta Accela code enforcement', 'CSV export'],
              ['Vacant Property Registry', 'CSV from Open Records'],
            ].map(([t, s]) => `<div style="padding:12px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;"><div style="font-weight:600;font-size:13px;color:#0f172a;">${t}</div><div style="font-size:11px;color:#64748b;margin-top:2px;">${s}</div></div>`).join('')}
          </div>
          <label class="upload-zone">${ICON.upload}<div class="ttl">Click to upload CSV / JSON / PDF</div><div class="sub">Records will be matched and merged (preview-only in this build)</div><input type="file" accept=".csv,.json,.pdf,.xlsx" style="display:none;" data-act="upload-file" /></label>
        </div>
      </div>
    </div>`;
}

function attachHandlers() {
  document.querySelectorAll('[data-act]').forEach(el => {
    const act = el.dataset.act;
    if (act === 'filter-type') el.onclick = () => { state.typeFilter = el.dataset.val; state.page = 1; render(); };
    else if (act === 'filter-score') el.onclick = () => { state.scoreFilter = el.dataset.val; state.page = 1; render(); };
    else if (act === 'open-lead') el.onclick = (e) => {
      if (e.target.closest('[data-stop-propagation]')) return;
      const lead = state.leads.find(l => l.id === el.dataset.id);
      state.openLead = lead; state.drawerTab = 'overview'; state.notes = lead.notes || ''; state.comps = [{},{},{}]; render();
    };
    else if (act === 'close-drawer' || act === 'close-drawer-bg') el.onclick = (e) => {
      if (act === 'close-drawer-bg' && e.target.closest('[data-stop-propagation]')) return;
      state.openLead = null; state.notes = ''; render();
    };
    else if (act === 'set-tab') el.onclick = () => { state.drawerTab = el.dataset.val; render(); };
    else if (act === 'set-stage') el.onclick = () => updateLead(state.openLead.id, { stage: el.dataset.val });
    else if (act === 'save-notes') el.onclick = () => updateLead(state.openLead.id, { notes: state.notes });
    else if (act === 'add-comp') el.onclick = () => { state.comps.push({}); render(); };
    else if (act === 'open-calc') el.onclick = () => { state.showCalc = true; render(); };
    else if (act === 'close-calc' || act === 'close-calc-bg') el.onclick = (e) => {
      if (act === 'close-calc-bg' && e.target.closest('[data-stop-propagation]')) return;
      state.showCalc = false; render();
    };
    else if (act === 'open-import') el.onclick = () => { state.showImport = true; render(); };
    else if (act === 'close-import' || act === 'close-import-bg') el.onclick = (e) => {
      if (act === 'close-import-bg' && e.target.closest('[data-stop-propagation]')) return;
      state.showImport = false; render();
    };
    else if (act === 'upload-file') el.onchange = () => { alert('In production: parse file, match by parcel, merge. (Preview only.)'); state.showImport = false; render(); };
    else if (act === 'export-skip') el.onclick = () => exportLeads(getFilteredLeads(), 'skiptrace');
    else if (act === 'export-ghl') el.onclick = () => exportLeads(getFilteredLeads(), 'ghl');
    else if (act === 'page-prev') el.onclick = () => { state.page = Math.max(1, state.page - 1); render(); };
    else if (act === 'page-next') el.onclick = () => { state.page++; render(); };
    else if (act === 'page-set') el.onclick = () => { state.page = Number(el.dataset.val); render(); };
  });
  const search = document.getElementById('search-input');
  if (search) {
    search.oninput = e => {
      state.search = e.target.value; state.page = 1;
      const tw = document.querySelector('.table-wrap');
      if (tw) tw.outerHTML = renderTable();
      attachHandlers();
      const s = document.getElementById('search-input');
      if (s) { s.focus(); s.setSelectionRange(state.search.length, state.search.length); }
    };
  }
  const sortSel = document.getElementById('sort-select');
  if (sortSel) sortSel.onchange = e => { state.sortBy = e.target.value; render(); };
  const ppSel = document.getElementById('perpage-select');
  if (ppSel) ppSel.onchange = e => { state.perPage = Number(e.target.value); state.page = 1; render(); };
  const notesTa = document.getElementById('notes-textarea');
  if (notesTa) notesTa.oninput = e => { state.notes = e.target.value; };
  document.querySelectorAll('[data-comp-i]').forEach(el => {
    el.oninput = e => {
      const i = Number(el.dataset.compI); const k = el.dataset.compK;
      state.comps[i] = { ...state.comps[i], [k]: e.target.value };
      const tab = document.querySelector('.drawer-body');
      if (tab) tab.innerHTML = renderCompsTab(state.openLead);
      attachHandlers();
    };
  });
  document.querySelectorAll('[data-offer-k]').forEach(el => {
    el.oninput = e => {
      state.offer[el.dataset.offerK] = Number(e.target.value);
      const tab = document.querySelector('.drawer-body');
      if (tab) tab.innerHTML = renderOfferTab(state.openLead);
      attachHandlers();
    };
  });
  document.querySelectorAll('[data-calc-k]').forEach(el => {
    el.oninput = e => { state.calc[el.dataset.calcK] = Number(e.target.value); render(); };
  });
}

(async () => { await loadData(); render(); })();
