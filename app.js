const icons = {
  compass: '<circle cx="12" cy="12" r="9"></circle><path d="m15.2 8.8-2.1 4.3-4.3 2.1 2.1-4.3 4.3-2.1Z"></path>',
  grid: '<rect x="4" y="4" width="6" height="6" rx="1"></rect><rect x="14" y="4" width="6" height="6" rx="1"></rect><rect x="4" y="14" width="6" height="6" rx="1"></rect><rect x="14" y="14" width="6" height="6" rx="1"></rect>',
  globe: '<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3Z"></path>',
  radar: '<circle cx="12" cy="12" r="8.5"></circle><path d="M12 3.5v8.5l6 3.5M5.9 5.9 12 12M3.5 12H12"></path>',
  shield: '<path d="M12 3 19 6v5c0 4.5-3 7.3-7 10-4-2.7-7-5.5-7-10V6l7-3Z"></path><path d="m9 12 2 2 4-4"></path>',
  plug: '<path d="M8 12h8M12 8v8"></path><path d="M6 8V5m12 3V5M8 19v-3m8 3v-3"></path><rect x="6" y="8" width="12" height="8" rx="2"></rect>',
  settings: '<path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"></path><path d="m19.4 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 .9v.1a1.8 1.8 0 0 1-3.6 0v-.1a1.8 1.8 0 0 0-3-.9l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-.9-3h-.1a1.8 1.8 0 0 1 0-3.6h.1a1.8 1.8 0 0 0 .9-3l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-.9v-.1a1.8 1.8 0 0 1 3.6 0v.1a1.8 1.8 0 0 0 3 .9l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 .9 3h.1a1.8 1.8 0 0 1 0 3.6h-.1a1.8 1.8 0 0 0-.9 3Z"></path>',
  bell: '<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8.5h18C21 16 18 16 18 9ZM10 21h4"></path>',
  plus: '<path d="M12 5v14M5 12h14"></path>',
  chevron: '<path d="m8 10 4 4 4-4"></path>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"></circle><path d="m16 16 4.2 4.2"></path>',
  download: '<path d="M12 4v11m-4-4 4 4 4-4M5 20h14"></path>',
  more: '<circle cx="5" cy="12" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle>',
  server: '<rect x="4" y="4" width="16" height="6" rx="1"></rect><rect x="4" y="14" width="16" height="6" rx="1"></rect><path d="M8 7h.01M8 17h.01"></path>',
  globe2: '<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c-2 2.3-3 5.3-3 9s1 6.7 3 9c2-2.3 3-5.3 3-9s-1-6.7-3-9Z"></path>',
  terminal: '<path d="m5 7 5 5-5 5M12 17h7"></path>',
  close: '<path d="m6 6 12 12M18 6 6 18"></path>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"></path>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"></path>',
  check: '<path d="m5 12 4 4L19 6"></path>'
};

const icon = (name, className = '') => `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.grid}</svg>`;
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));

const state = {
  currentPage: 'overview',
  scans: [
    { target: 'acme.com', template: 'Full surface', status: 'completed', findings: 24, duration: '08m 42s', started: 'Today, 09:42' },
    { target: '*.staging.acme.com', template: 'Web assets', status: 'running', findings: 8, duration: '04m 19s', started: 'Today, 09:38' },
    { target: 'api.acme.com', template: 'API discovery', status: 'completed', findings: 11, duration: '03m 07s', started: 'Yesterday, 18:26' },
    { target: 'acme.io', template: 'Full surface', status: 'completed', findings: 17, duration: '10m 12s', started: 'Yesterday, 15:12' }
  ],
  assets: [
    { name: 'acme.com', type: 'Root domain', tech: 'Cloudflare · Nginx', status: 'Active', findings: 14 },
    { name: 'app.acme.com', type: 'Web application', tech: 'Next.js · Vercel', status: 'Active', findings: 6 },
    { name: 'api.acme.com', type: 'API endpoint', tech: 'Node.js · AWS', status: 'Active', findings: 8 },
    { name: 'staging.acme.com', type: 'Web application', tech: 'React · Nginx', status: 'Review', findings: 12 },
    { name: 'cdn.acme.com', type: 'Cloud asset', tech: 'Amazon CloudFront', status: 'Active', findings: 2 },
    { name: 'mail.acme.com', type: 'Mail server', tech: 'Google Workspace', status: 'Active', findings: 0 }
  ]
};

const app = document.querySelector('#app');

function shell() {
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <div class="brand"><div class="brand-mark">${icon('radar')}</div><div class="brand-name">scout<span>base</span></div></div>
        <div class="workspace"><div class="workspace-avatar">AC</div><div class="workspace-copy"><strong>Acme Corporation</strong><span>Free workspace</span></div>${icon('chevron')}</div>
        <div class="nav-section">Workspace</div>
        <nav class="nav">
          <button class="nav-item active" data-page="overview">${icon('grid')}<span>Overview</span></button>
          <button class="nav-item" data-page="assets">${icon('globe')}<span>Assets</span><span class="nav-badge">142</span></button>
          <button class="nav-item" data-page="scans">${icon('radar')}<span>Scans</span></button>
          <button class="nav-item" data-page="findings">${icon('shield')}<span>Findings</span><span class="nav-badge">7</span></button>
        </nav>
        <div class="nav-section" style="margin-top:25px">Manage</div>
        <nav class="nav">
          <button class="nav-item" data-page="integrations">${icon('plug')}<span>Integrations</span></button>
          <button class="nav-item" data-page="settings">${icon('settings')}<span>Settings</span></button>
        </nav>
        <div class="sidebar-bottom">
          <div class="free-card"><strong>Free forever</strong><p>Discover your public attack surface with no credit card required.</p><button class="button-ghost" style="width:100%" data-page="settings">View plan ${icon('arrow')}</button></div>
          <div class="sidebar-user"><div class="user-avatar">GA</div><div><strong>Ghader Ahmadi</strong><span>Owner</span></div><button>${icon('more')}</button></div>
        </div>
      </aside>
      <main class="main">
        <header class="topbar"><div class="breadcrumb"><button class="icon-button mobile-toggle" id="menuButton">${icon('menu')}</button><span>Workspace /</span><strong id="breadcrumbPage">Overview</strong></div><div class="top-actions"><button class="icon-button">${icon('search')}</button><button class="icon-button">${icon('bell')}</button><button class="button-primary" id="newScanButton">${icon('plus')} New scan</button></div></header>
        <div class="content">
          <div id="pageContent"></div>
        </div>
      </main>
    </div>
    <div class="modal-backdrop" id="scanModal"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="scanTitle"><div class="modal-header"><div><h2 id="scanTitle">Start a new scan</h2><p>Map assets that you own or are authorized to test.</p></div><button class="modal-close" id="closeModal">${icon('close')}</button></div><form class="modal-form" id="scanForm"><div class="form-field"><label for="target">Target scope</label><input id="target" name="target" placeholder="example.com or *.example.com" required /><div class="form-help">Use a root domain, subdomain, or CIDR range from your authorized inventory.</div></div><div class="form-field"><label for="template">Scan template</label><select id="template" name="template"><option>Full surface</option><option>Web assets</option><option>API discovery</option><option>DNS intelligence</option></select></div><div class="form-field"><label for="schedule">Schedule</label><select id="schedule" name="schedule"><option>Run now</option><option>Every day</option><option>Every week</option></select></div><label class="check-row"><input type="checkbox" id="authorized" required /><span>I confirm this target is owned by my organization or I have explicit permission to scan it.</span></label><div class="modal-footer"><button type="button" class="button-ghost" id="cancelModal">Cancel</button><button class="button-primary" type="submit">${icon('radar')} Launch scan</button></div></form></div></div>
    <div class="toast" id="toast"></div>`;
}

function pageHeading(eyebrow, title, description, action = true) {
  return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div>${action ? `<div class="heading-actions"><button class="button-ghost" id="exportButton">${icon('download')} Export</button><button class="button-primary" id="headingScanButton">${icon('plus')} New scan</button></div>` : ''}</div>`;
}

function metricCard(label, value, change, iconName, tone = '') {
  return `<div class="metric-card"><div class="metric-top"><span>${label}</span>${icon(iconName, 'metric-icon')}</div><div class="metric-value">${value}</div><div class="metric-change ${tone}">${change}</div></div>`;
}

function chart() {
  const values = [[40, 29], [58, 35], [45, 28], [73, 46], [64, 39], [91, 60], [77, 53], [83, 55], [68, 48], [95, 66], [86, 58], [100, 76]];
  return `<div class="card chart-card"><div class="card-header"><h2>Discovery activity</h2><span>Last 12 weeks</span></div><div class="chart"><div class="chart-legend"><span><i class="legend-dot green"></i>New assets</span><span><i class="legend-dot blue"></i>Findings</span></div><div class="chart-area"><div class="chart-bars">${values.map(([green, blue]) => `<div class="bar-group"><i class="bar" style="height:${green}%"></i><i class="bar blue" style="height:${blue}%"></i></div>`).join('')}</div></div><div class="x-axis"><span>Jan 08</span><span>Jan 22</span><span>Feb 05</span><span>Feb 19</span><span>Mar 04</span></div></div></div>`;
}

function activity() {
  const items = [
    ['New asset discovered', 'staging.acme.com was added to inventory', '12 min ago'],
    ['Scan completed', 'Full surface scan found 4 new services', '46 min ago'],
    ['Finding resolved', 'Exposed admin panel marked as resolved', '2 hrs ago'],
    ['Integration connected', 'Slack notifications are now active', 'Yesterday']
  ];
  return `<div class="card"><div class="card-header"><h2>Recent activity</h2><button class="button-ghost">View all ${icon('arrow')}</button></div><div class="activity-list">${items.map(([title, detail, time]) => `<div class="activity-item"><i class="activity-mark"></i><div class="activity-copy"><strong>${title}</strong><span>${detail}</span></div><time class="activity-time">${time}</time></div>`).join('')}</div></div>`;
}

function scanRows(rows = state.scans) {
  if (!rows.length) return '<div class="empty-state">No scans match this filter.</div>';
  return `<div class="table-wrap"><table><thead><tr><th>Target</th><th>Template</th><th>Status</th><th>Findings</th><th>Duration</th><th>Started</th><th></th></tr></thead><tbody>${rows.map((scan) => `<tr><td><div class="asset-cell">${icon('globe2', 'asset-icon')}${escapeHtml(scan.target)}</div></td><td>${escapeHtml(scan.template)}</td><td><span class="status ${scan.status === 'running' ? 'running' : ''}">${scan.status[0].toUpperCase() + scan.status.slice(1)}</span></td><td style="color:${scan.findings ? 'var(--orange)' : 'var(--muted)'}">${scan.findings}</td><td>${scan.duration}</td><td>${scan.started}</td><td>${icon('more')}</td></tr>`).join('')}</tbody></table></div>`;
}

function scanTable(limit = null) {
  const rows = limit ? state.scans.slice(0, limit) : state.scans;
  return `<div class="card table-card"><div class="card-header"><h2>${limit ? 'Recent scans' : 'All scans'}</h2><div class="table-tools">${limit ? '<button class="button-ghost" data-page="scans">View all</button>' : '<input class="search-input" id="scanSearch" placeholder="Search scans..." />'}<select class="filter-select" id="statusFilter"><option value="all">All statuses</option><option value="completed">Completed</option><option value="running">Running</option></select></div></div><div id="scanTableBody">${scanRows(rows)}</div></div>`;
}

function overviewPage() {
  return `${pageHeading('Command center', 'Good morning, Ghader.', 'Here is what is happening across your external attack surface.')}<div class="metric-grid">${metricCard('Total assets', '142', '+12.4% this month', 'globe')} ${metricCard('Active scans', '03', '2 running now', 'radar')} ${metricCard('Open findings', '27', '7 need attention', 'shield', 'warning')} ${metricCard('Coverage score', '86%', '+4.8% this month', 'grid')}</div><div class="dashboard-grid"><div>${chart()}${scanTable(3)}</div>${activity()}</div>`;
}

function assetsPage() {
  return `${pageHeading('Asset inventory', 'Know everything you own.', 'Continuously discovered assets from your authorized domains and cloud accounts.')}<div class="metric-grid">${metricCard('Total assets', '142', '+12.4% this month', 'globe')} ${metricCard('Domains', '18', '+3 this month', 'globe2')} ${metricCard('Web apps', '64', '45% of inventory', 'server')} ${metricCard('Cloud assets', '60', '98% monitored', 'grid')}</div><div class="card table-card" style="margin-top:0"><div class="card-header"><h2>Asset inventory</h2><div class="table-tools"><input class="search-input" id="assetSearch" placeholder="Search assets..." /><select class="filter-select"><option>All types</option><option>Web application</option><option>API endpoint</option><option>Cloud asset</option></select></div></div><div class="table-wrap"><table><thead><tr><th>Asset</th><th>Type</th><th>Technology</th><th>Status</th><th>Findings</th><th></th></tr></thead><tbody id="assetTableBody">${assetRows(state.assets)}</tbody></table></div></div>`;
}

function assetRows(rows) {
  if (!rows.length) return '<tr><td colspan="6"><div class="empty-state">No assets match your search.</div></td></tr>';
  return rows.map((asset) => `<tr><td><div class="asset-cell">${icon(asset.type === 'API endpoint' ? 'terminal' : 'globe2', 'asset-icon')}${escapeHtml(asset.name)}</div></td><td>${escapeHtml(asset.type)}</td><td>${escapeHtml(asset.tech)}</td><td><span class="status ${asset.status === 'Review' ? 'warning' : ''}">${asset.status}</span></td><td style="color:${asset.findings ? 'var(--orange)' : 'var(--muted)'}">${asset.findings}</td><td>${icon('more')}</td></tr>`).join('');
}

function findingsPage() {
  const findings = [['Public admin endpoint', 'app.acme.com/admin', 'high', 'Web application', '12 min ago'], ['Outdated TLS configuration', 'api.acme.com:443', 'medium', 'API endpoint', '46 min ago'], ['Exposed source map', 'staging.acme.com', 'medium', 'Web application', '2 hrs ago'], ['Missing security headers', 'cdn.acme.com', 'low', 'Cloud asset', 'Yesterday'], ['Dangling DNS record', 'old.acme.com', 'low', 'Domain', 'Yesterday']];
  return `${pageHeading('Risk center', 'Findings that need focus.', 'Prioritize the signals that can make the biggest difference to your security posture.')}<div class="metric-grid">${metricCard('Open findings', '27', '-6.2% this month', 'shield', 'warning')} ${metricCard('High severity', '04', '2 new this week', 'shield', 'warning')} ${metricCard('Resolved', '118', '+18 this month', 'check')} ${metricCard('Mean time to fix', '3.4d', '-0.8d this month', 'radar')}</div><div class="card table-card" style="margin-top:0"><div class="card-header"><h2>Open findings</h2><div class="table-tools"><input class="search-input" placeholder="Search findings..." /><select class="filter-select"><option>All severities</option><option>High</option><option>Medium</option><option>Low</option></select></div></div><div class="table-wrap"><table><thead><tr><th>Finding</th><th>Asset</th><th>Severity</th><th>Type</th><th>Detected</th><th></th></tr></thead><tbody>${findings.map(([finding, asset, severity, type, detected]) => `<tr><td style="color:var(--text);font-weight:600">${finding}</td><td>${asset}</td><td><span class="severity ${severity}">${severity[0].toUpperCase() + severity.slice(1)}</span></td><td>${type}</td><td>${detected}</td><td>${icon('more')}</td></tr>`).join('')}</tbody></table></div></div>`;
}

function integrationsPage() {
  const integrations = [['Slack', 'Send new findings to a dedicated channel.', 'Connected', 'plug'], ['GitHub', 'Create issues from high-severity findings.', 'Connect', 'terminal'], ['AWS', 'Discover cloud assets across your accounts.', 'Connect', 'server'], ['Webhook', 'Send scan events to any endpoint.', 'Connect', 'arrow']];
  return `${pageHeading('Connected tools', 'Bring discovery into your workflow.', 'Connect the services your team already uses to keep response moving.', false)}<div class="inventory-grid">${integrations.map(([name, description, status, iconName]) => `<div class="inventory-card"><div class="inventory-card-top"><div class="asset-icon">${icon(iconName)}</div><span class="status ${status === 'Connect' ? 'warning' : ''}">${status}</span></div><h3>${name}</h3><p>${description}</p><button class="${status === 'Connected' ? 'button-ghost' : 'button-primary'}" style="width:100%">${status === 'Connected' ? 'Manage connection' : 'Connect'} ${icon('arrow')}</button></div>`).join('')}</div>`;
}

function settingsPage() {
  return `${pageHeading('Workspace settings', 'Make Scoutbase yours.', 'Configure your workspace, notifications, and scanning preferences.', false)}<div class="card" style="max-width:720px"><div class="card-header"><h2>Workspace preferences</h2></div><div class="modal-form"><div class="form-field"><label>Workspace name</label><input value="Acme Corporation" /></div><div class="form-field"><label>Default scan template</label><select><option>Full surface</option><option>Web assets</option></select></div><div class="form-field"><label>Notification email</label><input value="security@acme.com" /></div><label class="check-row"><input type="checkbox" checked /><span>Email me when high-severity findings are discovered.</span></label><button class="button-primary">Save changes ${icon('check')}</button></div></div>`;
}

function renderPage(page = state.currentPage) {
  state.currentPage = page;
  const pageMap = { overview: overviewPage, assets: assetsPage, scans: () => `${pageHeading('Scan history', 'See every discovery run.', 'Automated scans keep your inventory fresh and your team informed.')}${scanTable()}`, findings: findingsPage, integrations: integrationsPage, settings: settingsPage };
  document.querySelector('#pageContent').innerHTML = (pageMap[page] || overviewPage)();
  document.querySelector('#breadcrumbPage').textContent = page.charAt(0).toUpperCase() + page.slice(1);
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.page === page));
  document.querySelectorAll('[data-page]').forEach((item) => item.onclick = () => { renderPage(item.dataset.page); document.querySelector('#sidebar').classList.remove('open'); });
  document.querySelector('#headingScanButton')?.addEventListener('click', openModal);
  document.querySelector('#exportButton')?.addEventListener('click', () => showToast('Export prepared. Your CSV is ready to download.'));
  document.querySelector('#scanSearch')?.addEventListener('input', filterScans);
  document.querySelector('#statusFilter')?.addEventListener('change', filterScans);
  document.querySelector('#assetSearch')?.addEventListener('input', filterAssets);
}

function filterScans() {
  const search = document.querySelector('#scanSearch')?.value.toLowerCase() || '';
  const status = document.querySelector('#statusFilter')?.value || 'all';
  const results = state.scans.filter((scan) => (status === 'all' || scan.status === status) && `${scan.target} ${scan.template}`.toLowerCase().includes(search));
  document.querySelector('#scanTableBody').innerHTML = scanRows(results);
}

function filterAssets(event) {
  const search = event.target.value.toLowerCase();
  document.querySelector('#assetTableBody').innerHTML = assetRows(state.assets.filter((asset) => `${asset.name} ${asset.type} ${asset.tech}`.toLowerCase().includes(search)));
}

function openModal() { document.querySelector('#scanModal').classList.add('open'); document.querySelector('#target').focus(); }
function closeModal() { document.querySelector('#scanModal').classList.remove('open'); document.querySelector('#scanForm').reset(); }
function showToast(message) { const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); }

shell();
renderPage();
document.querySelector('#newScanButton').addEventListener('click', openModal);
document.querySelector('#closeModal').addEventListener('click', closeModal);
document.querySelector('#cancelModal').addEventListener('click', closeModal);
document.querySelector('#scanModal').addEventListener('click', (event) => { if (event.target.id === 'scanModal') closeModal(); });
document.querySelector('#menuButton').addEventListener('click', () => document.querySelector('#sidebar').classList.toggle('open'));
document.querySelector('#scanForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  const target = form.get('target').trim();
  const template = form.get('template');
  state.scans.unshift({ target, template, status: 'running', findings: 0, duration: '00m 00s', started: 'Just now' });
  closeModal();
  renderPage('scans');
  showToast(`Scan started for ${target}`);
});
