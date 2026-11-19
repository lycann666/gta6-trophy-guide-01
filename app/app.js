// Leonida Legend — GTA VI trophy guide and tracker.
// Loads app/data/trophies.json at run time (a local file, never the network),
// keeps earned ticks in localStorage, and renders the checklist, the roadmap
// to the platinum, the missable list, and one trophy's full guide at a time.
const STORAGE_KEY = 'leonida-legend-earned-v1';
const SPOILER_KEY = 'leonida-legend-spoilers-v1';
const POINTS = { platinum: 300, gold: 90, silver: 30, bronze: 15 };
const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online' };

const params = new URLSearchParams(window.location.search);
const listEl = document.getElementById('trophyList');
const listView = document.getElementById('listView');
const roadmapView = document.getElementById('roadmapView');
const missableView = document.getElementById('missableView');
const detailView = document.getElementById('detailView');
const detailBody = document.getElementById('detailBody');
const resultCount = document.getElementById('resultCount');
const searchInput = document.getElementById('searchInput');
const kindFilter = document.getElementById('kindFilter');
const gradeFilter = document.getElementById('gradeFilter');
const spoilerToggle = document.getElementById('spoilerToggle');
const earnedOnlyToggle = document.getElementById('earnedOnlyToggle');

let trophies = [];
let roadmap = [];
let earned = loadEarned();
let spoilersHidden = loadSpoilers();
let currentView = 'checklist';

function loadEarned() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return new Set(Array.isArray(saved) ? saved.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

function loadSpoilers() {
  try {
    return window.localStorage.getItem(SPOILER_KEY) === '1';
  } catch {
    return false;
  }
}

function saveEarned() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch { /* storage unavailable: progress lives only for this session */ }
}

function saveSpoilers() {
  try {
    window.localStorage.setItem(SPOILER_KEY, spoilersHidden ? '1' : '0');
  } catch { /* ignore */ }
}

function trophyIsHidden(trophy) {
  return spoilersHidden && trophy.kind === 'story' && !earned.has(trophy.id);
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function sourceLinks(trophy) {
  const sources = trophy.sources && trophy.sources.length ? trophy.sources : [];
  if (!sources.length) return '';
  const links = sources.map((s) => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.name)}</a>`).join(' &middot; ');
  return `<p class="sources">Sources: ${links}</p>`;
}

function gradeChip(trophy) {
  return `<span class="grade grade-${escapeHtml(trophy.grade)}">${escapeHtml(trophy.grade)}</span>`;
}

function kindChip(trophy) {
  return `<span class="kind-tag">${escapeHtml(KIND_LABELS[trophy.kind] || trophy.kind)}</span>`;
}

function missableFlag(trophy) {
  return trophy.missable ? '<span class="flag-missable">Missable</span>' : '';
}

function countBadge(trophy) {
  if (!trophy.count) return '';
  const label = trophy.count >= 1000 ? `$${trophy.count.toLocaleString('en-US')}` : String(trophy.count);
  return `<span class="kind-tag">Target: ${escapeHtml(label)}</span>`;
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.id)).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('progressCount').textContent = `${done} / ${total}`;
  document.getElementById('progressFill').style.width = `${percent}%`;
  document.getElementById('progressBarWrap').setAttribute('aria-valuenow', String(done));
  const byGrade = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const inGrade = trophies.filter((t) => t.grade === g);
    const got = inGrade.filter((t) => earned.has(t.id)).length;
    return `<span class="stat-chip">${escapeHtml(g)} ${got}/${inGrade.length}</span>`;
  }).join('');
  document.getElementById('progressStats').innerHTML = byGrade;
  const points = trophies.filter((t) => earned.has(t.id)).reduce((sum, t) => sum + (POINTS[t.grade] || 0), 0);
  const maxPoints = trophies.reduce((sum, t) => sum + (POINTS[t.grade] || 0), 0);
  document.getElementById('pointsLine').textContent =
    `Estimated points: ${points.toLocaleString('en-US')} / ${maxPoints.toLocaleString('en-US')} — ${percent}% to the platinum.`;
}

function filteredTrophies() {
  const query = searchInput.value.trim().toLowerCase();
  const kind = kindFilter.value;
  const grade = gradeFilter.value;
  return trophies.filter((t) => {
    if (kind === 'missable' && !t.missable) return false;
    if (kind !== 'all' && kind !== 'missable' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (earnedOnlyToggle.checked && !earned.has(t.id)) return false;
    if (query) {
      const haystack = `${t.name} ${t.description} ${t.guide} ${t.kind} ${t.grade}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

function renderList() {
  const shown = filteredTrophies();
  resultCount.textContent = `Showing ${shown.length} of ${trophies.length} trophies` +
    (spoilersHidden ? ' — story spoilers hidden until earned.' : '.');
  if (!shown.length) {
    listEl.innerHTML = '<li class="empty">No trophies match these filters. Clear the search or widen the filters.</li>';
    return;
  }
  listEl.innerHTML = shown.map((t) => {
    const isEarned = earned.has(t.id);
    const hidden = trophyIsHidden(t);
    const nameHtml = hidden
      ? '<span class="spoiler-hidden">Hidden story trophy — tick it earned to reveal it.</span>'
      : `<button type="button" data-trophy="${t.id}">${escapeHtml(t.name)}</button>`;
    const descHtml = hidden
      ? '<p class="trophy-desc spoiler-hidden">Description hidden until earned.</p>'
      : `<p class="trophy-desc">${escapeHtml(t.description)}</p>`;
    const guideHtml = hidden ? '' : `<details class="guide-preview"><summary>Guide &amp; sources</summary><p>${escapeHtml(t.guide)}</p>${sourceLinks(t)}</details>`;
    return `<li class="trophy${isEarned ? ' earned' : ''}" data-id="${t.id}">
      <input type="checkbox" data-earned="${t.id}" ${isEarned ? 'checked' : ''} aria-label="Earned: ${escapeHtml(t.name)}">
      <div>
        <h3 class="trophy-name">${nameHtml}</h3>
        ${descHtml}
        <div class="trophy-meta">${gradeChip(t)}${kindChip(t)}${missableFlag(t)}${countBadge(t)}</div>
        ${guideHtml}
      </div>
    </li>`;
  }).join('');
}

function renderRoadmap() {
  roadmapView.innerHTML = roadmap.map((stage) => {
    const items = stage.trophies.map((id) => {
      const t = trophies.find((x) => x.id === id);
      if (!t) return '';
      const done = earned.has(id);
      const label = trophyIsHidden(t) ? 'Hidden story trophy' : escapeHtml(t.name);
      return `<li class="${done ? 'done' : ''}">${done ? '✓ ' : ''}${label} ${gradeChip(t)}${t.missable ? ' ' + missableFlag(t) : ''}</li>`;
    }).join('');
    return `<article class="stage"><h3>${escapeHtml(stage.title)}</h3><p>${escapeHtml(stage.text)}</p><ul>${items}</ul></article>`;
  }).join('');
}

function renderMissable() {
  const missable = trophies.filter((t) => t.missable);
  document.getElementById('missableList').innerHTML = missable.map((t) => {
    const isEarned = earned.has(t.id);
    return `<div class="trophy${isEarned ? ' earned' : ''}">
      <input type="checkbox" data-earned="${t.id}" ${isEarned ? 'checked' : ''} aria-label="Earned: ${escapeHtml(t.name)}">
      <div>
        <h3 class="trophy-name"><button type="button" data-trophy="${t.id}">${escapeHtml(t.name)}</button></h3>
        <p class="trophy-desc">${escapeHtml(t.description)}</p>
        <div class="trophy-meta">${gradeChip(t)}${kindChip(t)}${missableFlag(t)}</div>
        <p>${escapeHtml(t.guide)}</p>
        ${sourceLinks(t)}
      </div>
    </div>`;
  }).join('');
}

function showDetail(id) {
  const t = trophies.find((x) => x.id === id);
  if (!t) return;
  detailBody.innerHTML = `
    <div class="trophy-meta">${gradeChip(t)}${kindChip(t)}${missableFlag(t)}${countBadge(t)}</div>
    <h2>${escapeHtml(t.name)}</h2>
    <p class="trophy-desc">Official description: ${escapeHtml(t.description)}</p>
    <h3>Guide</h3>
    <p class="guide-text">${escapeHtml(t.guide)}</p>
    <h3>Sources</h3>
    ${sourceLinks(t)}
    <p><label class="check-label"><input type="checkbox" data-earned="${t.id}" ${earned.has(t.id) ? 'checked' : ''}> I earned this trophy</label></p>`;
  listView.hidden = true;
  roadmapView.hidden = true;
  missableView.hidden = true;
  detailView.hidden = false;
  detailView.scrollIntoView({ behavior: 'smooth' });
  const url = new URL(window.location.href);
  url.searchParams.set('trophy', String(t.id));
  window.history.replaceState(null, '', url);
}

function hideDetail() {
  detailView.hidden = true;
  const url = new URL(window.location.href);
  url.searchParams.delete('trophy');
  window.history.replaceState(null, '', url);
  showView(currentView);
}

function showView(view) {
  currentView = view;
  document.querySelectorAll('.view-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  hideDetailOnly();
  listView.hidden = view !== 'checklist';
  roadmapView.hidden = view !== 'roadmap';
  missableView.hidden = view !== 'missable';
  if (view === 'roadmap') renderRoadmap();
  if (view === 'missable') renderMissable();
  if (view === 'checklist') renderList();
}

function hideDetailOnly() {
  detailView.hidden = true;
}

function refreshAll() {
  renderProgress();
  renderList();
  if (currentView === 'roadmap') renderRoadmap();
  if (currentView === 'missable') renderMissable();
}

function exportProgress() {
  const payload = {
    game: 'Grand Theft Auto VI',
    exported: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
    total: trophies.length,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(ids)) throw new Error('no earned list');
      const valid = new Set(trophies.map((t) => t.id));
      const next = new Set(ids.filter((n) => Number.isInteger(n) && valid.has(n)));
      earned = next;
      saveEarned();
      refreshAll();
      resultCount.textContent = `Imported ${earned.size} earned trophies.`;
    } catch {
      resultCount.textContent = 'That file could not be imported — it is not a progress export from this guide.';
    }
  };
  reader.readAsText(file);
}

function applyUrlParams() {
  const grade = params.get('grade');
  if (grade && ['platinum', 'gold', 'silver', 'bronze'].includes(grade)) gradeFilter.value = grade;
  const filter = params.get('filter');
  if (filter === 'missable') kindFilter.value = 'missable';
  else if (filter && ['story', 'collectibles', 'activities', 'online'].includes(filter)) kindFilter.value = filter;
  const query = params.get('q');
  if (query) searchInput.value = query;
  const view = params.get('view');
  if (view === 'roadmap' || view === 'missable') currentView = view;
  if (params.get('spoilers') === 'on') {
    spoilersHidden = true;
    spoilerToggle.checked = true;
  }
}

async function init() {
  const response = await fetch('data/trophies.json');
  const data = await response.json();
  trophies = data.trophies || [];
  roadmap = data.roadmap || [];
  spoilerToggle.checked = spoilersHidden;
  applyUrlParams();
  showView(currentView);
  renderProgress();

  searchInput.addEventListener('input', renderList);
  kindFilter.addEventListener('change', renderList);
  gradeFilter.addEventListener('change', renderList);
  earnedOnlyToggle.addEventListener('change', renderList);
  spoilerToggle.addEventListener('change', () => {
    spoilersHidden = spoilerToggle.checked;
    saveSpoilers();
    refreshAll();
  });
  document.querySelectorAll('.view-btn').forEach((b) => b.addEventListener('click', () => showView(b.dataset.view)));
  document.getElementById('detailClose').addEventListener('click', hideDetail);
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) importProgress(file);
    event.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (window.confirm('Clear all earned ticks? This cannot be undone unless you exported a backup.')) {
      earned = new Set();
      saveEarned();
      refreshAll();
    }
  });
  document.addEventListener('change', (event) => {
    const box = event.target.closest('[data-earned]');
    if (!box) return;
    const id = Number(box.dataset.earned);
    if (box.checked) earned.add(id); else earned.delete(id);
    saveEarned();
    refreshAll();
  });
  document.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-trophy]');
    if (btn) showDetail(Number(btn.dataset.trophy));
  });

  const trophyParam = params.get('trophy');
  if (trophyParam) showDetail(Number(trophyParam));
}

init();
