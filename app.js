// =============================================================
//  LinguaMedia — Application Logic
// =============================================================

// ---- Language metadata ----------------------------------------
const LANGUAGES = {
  Spanish:    { code: 'es', wiki: 'es', flag: '🇪🇸', label: 'Español' },
  French:     { code: 'fr', wiki: 'fr', flag: '🇫🇷', label: 'Français' },
  German:     { code: 'de', wiki: 'de', flag: '🇩🇪', label: 'Deutsch' },
  Japanese:   { code: 'ja', wiki: 'ja', flag: '🇯🇵', label: '日本語' },
  Chinese:    { code: 'zh', wiki: 'zh', flag: '🇨🇳', label: '中文' },
  Korean:     { code: 'ko', wiki: 'ko', flag: '🇰🇷', label: '한국어' },
  Italian:    { code: 'it', wiki: 'it', flag: '🇮🇹', label: 'Italiano' },
  Portuguese: { code: 'pt', wiki: 'pt', flag: '🇧🇷', label: 'Português' },
  Russian:    { code: 'ru', wiki: 'ru', flag: '🇷🇺', label: 'Русский' },
  Arabic:     { code: 'ar', wiki: 'ar', flag: '🇸🇦', label: 'العربية' },
  Dutch:      { code: 'nl', wiki: 'nl', flag: '🇳🇱', label: 'Nederlands' },
  Swedish:    { code: 'sv', wiki: 'sv', flag: '🇸🇪', label: 'Svenska' },
  Polish:     { code: 'pl', wiki: 'pl', flag: '🇵🇱', label: 'Polski' },
  Turkish:    { code: 'tr', wiki: 'tr', flag: '🇹🇷', label: 'Türkçe' },
  Hindi:      { code: 'hi', wiki: 'hi', flag: '🇮🇳', label: 'हिन्दी' },
  English:    { code: 'en', wiki: 'en', flag: '🇬🇧', label: 'English' },
};

// ---- State ----------------------------------------------------
let state = {
  query: '',
  language: CONFIG.DEFAULT_LANGUAGE || 'Spanish',
  videos: [],
  articles: [],
  currentVideo: null,
  translateActive: false,
  lastTranslatedWord: '',
  translateTimer: null,
  lastSearch: null,
  activeTab: 'videos',
};

// ---- DOM refs -------------------------------------------------
const $ = id => document.getElementById(id);
const els = {
  header:          $('siteHeader'),
  menuBtn:         $('menuBtn'),
  logoLink:        $('logoLink'),
  langSelect:      $('languageSelect'),
  searchInput:     $('searchInput'),
  searchBtn:       $('searchBtn'),
  translateToggle: $('translateToggle'),
  sidebarNav:      $('sidebarNav'),
  homeScreen:      $('homeScreen'),
  resultsScreen:   $('resultsScreen'),
  resultsTitle:    $('resultsTitle'),
  playerScreen:    $('playerScreen'),
  videoGrid:       $('videoGrid'),
  articleGrid:     $('articleGrid'),
  videoSection:    $('videoSection'),
  articleSection:  $('articleSection'),
  tabVideos:       $('tabVideos'),
  tabArticles:     $('tabArticles'),
  tabAll:          $('tabAll'),
  youtubePlayer:   $('youtubePlayer'),
  playerTitle:     $('playerTitle'),
  playerMeta:      $('playerMeta'),
  playerDesc:      $('playerDesc'),
  backBtn:         $('backBtn'),
  sidebarList:     $('sidebarList'),
  suggestionsPanel:$('suggestionsPanel'),
  suggestionsList: $('suggestionsList'),
  loadingOverlay:  $('loadingOverlay'),
  loadingText:     $('loadingText'),
  errorState:      $('errorState'),
  errorMsg:        $('errorMsg'),
  retryBtn:        $('retryBtn'),
  apiWarning:      $('apiWarning'),
  chipRow:         $('chipRow'),
  popup:           $('translationPopup'),
  popupOriginal:   $('popupOriginal'),
  popupText:       $('popupText'),
  popupLoading:    $('popupLoading'),
  popupLang:       $('popupLang'),
};

// ==============================================================
//  INITIALISE
// ==============================================================
function init() {
  // Set language selector to default
  els.langSelect.value = state.language;

  // Show API key warning if key is not set
  if (!CONFIG.YOUTUBE_API_KEY || CONFIG.YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
    els.apiWarning.classList.remove('hidden');
  }

  // Wire up events
  els.searchBtn.addEventListener('click', onSearch);
  els.searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') onSearch(); });
  els.langSelect.addEventListener('change', e => { state.language = e.target.value; });
  els.menuBtn.addEventListener('click', toggleSidebar);
  els.logoLink.addEventListener('click', e => { e.preventDefault(); showHome(); });
  els.backBtn.addEventListener('click', showResults);
  els.retryBtn.addEventListener('click', () => performSearch(state.query));
  els.translateToggle.addEventListener('click', toggleTranslate);
  els.tabVideos.addEventListener('click', () => switchTab('videos'));
  els.tabArticles.addEventListener('click', () => switchTab('articles'));
  els.tabAll.addEventListener('click', () => switchTab('all'));

  // Quick-search chips
  document.querySelectorAll('.chip, .nav-item').forEach(el => {
    el.addEventListener('click', () => {
      const q = el.dataset.query;
      if (q) { els.searchInput.value = q; onSearch(); }
    });
  });

  // Translation: mousemove on document
  document.addEventListener('mousemove', onMouseMove);

  // Show home
  showHome();
}

// ==============================================================
//  NAVIGATION HELPERS
// ==============================================================
function showHome() {
  els.homeScreen.classList.remove('hidden');
  els.resultsScreen.classList.add('hidden');
  els.playerScreen.classList.add('hidden');
  els.suggestionsPanel.classList.add('hidden');
  els.loadingOverlay.classList.add('hidden');
  els.errorState.classList.add('hidden');
  stopPlayer();
}

function showResults() {
  els.homeScreen.classList.add('hidden');
  els.resultsScreen.classList.remove('hidden');
  els.playerScreen.classList.add('hidden');
  els.loadingOverlay.classList.add('hidden');
  els.errorState.classList.add('hidden');
  stopPlayer();
  if (state.videos.length > 0) {
    els.suggestionsPanel.classList.remove('hidden');
    renderSuggestions(state.videos.slice(0, 12));
  }
}

function showPlayer(video) {
  state.currentVideo = video;
  els.homeScreen.classList.add('hidden');
  els.resultsScreen.classList.add('hidden');
  els.playerScreen.classList.remove('hidden');
  els.errorState.classList.add('hidden');

  // Fill player info
  els.youtubePlayer.src = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`;
  els.playerTitle.textContent = video.title;
  els.playerMeta.textContent = `${video.channel}  ·  ${video.published}`;

  const descEl = els.playerDesc;
  descEl.innerHTML = '';
  const descText = document.createElement('span');
  descText.textContent = video.description;
  descEl.appendChild(descText);

  // Show more button for long descriptions
  if (video.description && video.description.length > 200) {
    const moreBtn = document.createElement('span');
    moreBtn.className = 'show-more';
    moreBtn.textContent = 'Show more';
    moreBtn.addEventListener('click', () => {
      descEl.classList.toggle('expanded');
      moreBtn.textContent = descEl.classList.contains('expanded') ? 'Show less' : 'Show more';
    });
    descEl.appendChild(moreBtn);
  }

  // Sidebar: other videos from results
  const others = state.videos.filter(v => v.id !== video.id);
  renderSidebarCards(els.sidebarList, others.slice(0, 15));
  els.suggestionsPanel.classList.remove('hidden');
  renderSuggestions(others.slice(0, 12));
}

function stopPlayer() {
  els.youtubePlayer.src = '';
}

function toggleSidebar() {
  els.sidebarNav.classList.toggle('open');
  els.sidebarNav.classList.toggle('hidden');
}

// ==============================================================
//  SEARCH
// ==============================================================
function onSearch() {
  const q = els.searchInput.value.trim();
  if (!q) return;
  state.language = els.langSelect.value;
  performSearch(q);
}

async function performSearch(query) {
  state.query = query;
  state.lastSearch = query;
  showResults();

  // Show loading
  els.loadingOverlay.classList.remove('hidden');
  els.loadingText.textContent = `Searching "${query}" in ${state.language}…`;
  els.errorState.classList.add('hidden');
  els.videoGrid.innerHTML = '';
  els.articleGrid.innerHTML = '';

  // Render skeleton placeholders while loading
  renderSkeletons(els.videoGrid, 8);

  const lang = LANGUAGES[state.language] || LANGUAGES['Spanish'];

  try {
    const [videos, articles] = await Promise.all([
      fetchVideos(query, lang),
      fetchArticles(query, lang),
    ]);

    state.videos = videos;
    state.articles = articles;

    els.loadingOverlay.classList.add('hidden');
    els.resultsTitle.textContent = `Results for "${query}" · ${lang.flag} ${state.language}`;

    renderVideos(videos);
    renderArticles(articles);
    switchTab(state.activeTab);

    if (videos.length > 0) {
      els.suggestionsPanel.classList.remove('hidden');
      renderSuggestions(videos.slice(0, 12));
    }

  } catch (err) {
    els.loadingOverlay.classList.add('hidden');
    showError(err.message || 'Something went wrong. Please try again.');
    console.error(err);
  }
}

// ==============================================================
//  YOUTUBE API
// ==============================================================
async function fetchVideos(query, lang) {
  if (!CONFIG.YOUTUBE_API_KEY || CONFIG.YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
    // Return demo placeholder cards if no key set
    return getDemoVideos(query, lang);
  }

  const params = new URLSearchParams({
    part: 'snippet',
    q: `${query}`,
    type: 'video',
    relevanceLanguage: lang.code,
    maxResults: CONFIG.VIDEO_RESULTS || 20,
    key: CONFIG.YOUTUBE_API_KEY,
    videoEmbeddable: 'true',
    safeSearch: 'moderate',
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `YouTube API error: ${res.status}`);
  }
  const data = await res.json();
  return (data.items || []).map(item => parseVideo(item));
}

function parseVideo(item) {
  const s = item.snippet;
  return {
    id: item.id?.videoId || item.id,
    title: s.title,
    channel: s.channelTitle,
    published: formatDate(s.publishedAt),
    description: s.description,
    thumb: s.thumbnails?.medium?.url || s.thumbnails?.default?.url || '',
    thumb_hq: s.thumbnails?.high?.url || s.thumbnails?.medium?.url || '',
    duration: s.duration || '',
  };
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return ''; }
}

// Demo videos (shown when no API key is configured)
function getDemoVideos(query, lang) {
  const demos = [];
  const titles = [
    `Introduction to ${query} — Learn ${lang.label}`,
    `${query} vocabulary in ${lang.label} for beginners`,
    `${lang.flag} ${lang.label} lesson: ${query} explained`,
    `How to talk about ${query} in ${lang.label}`,
    `${query} in ${lang.label}: real-life examples`,
    `${lang.label} for beginners — ${query} special`,
  ];
  titles.forEach((t, i) => {
    demos.push({
      id: `demo_${i}`,
      title: t,
      channel: 'LinguaMedia Demo',
      published: 'Demo content',
      description: `This is a demo card. Add your YouTube API key in config.js to see real videos about "${query}" in ${lang.label}.`,
      thumb: `https://picsum.photos/seed/${query}${i}/320/180`,
      thumb_hq: `https://picsum.photos/seed/${query}${i}/640/360`,
      duration: '',
      demo: true,
    });
  });
  return demos;
}

// ==============================================================
//  WIKIPEDIA ARTICLES
// ==============================================================
async function fetchArticles(query, lang) {
  const wikiLang = lang.wiki;
  const searchUrl = `https://${wikiLang}.wikipedia.org/w/api.php?` + new URLSearchParams({
    action: 'opensearch',
    search: query,
    limit: CONFIG.ARTICLE_RESULTS || 6,
    format: 'json',
    origin: '*',
  });

  const res = await fetch(searchUrl);
  if (!res.ok) return [];
  const [, titles, excerpts, urls] = await res.json();

  const articles = titles.slice(0, CONFIG.ARTICLE_RESULTS || 6).map((title, i) => ({
    title,
    excerpt: excerpts[i] || '',
    url: urls[i] || '',
    lang: lang.label,
    flag: lang.flag,
  }));

  // Fetch summaries for the first 3 articles
  await Promise.all(articles.slice(0, 3).map(async (art) => {
    try {
      const slug = encodeURIComponent(art.title.replace(/ /g, '_'));
      const sRes = await fetch(`https://${wikiLang}.wikipedia.org/api/rest_v1/page/summary/${slug}`);
      if (sRes.ok) {
        const s = await sRes.json();
        if (s.extract) art.excerpt = s.extract;
        if (s.thumbnail?.source) art.image = s.thumbnail.source;
      }
    } catch { /* best effort */ }
  }));

  return articles;
}

// ==============================================================
//  RENDER — VIDEOS
// ==============================================================
function renderVideos(videos) {
  els.videoGrid.innerHTML = '';
  if (!videos.length) {
    els.videoGrid.innerHTML = '<p style="color:var(--text2);padding:20px">No videos found. Try a different topic or language.</p>';
    return;
  }
  videos.forEach(v => {
    const card = createVideoCard(v, 'full');
    card.addEventListener('click', () => {
      if (v.demo) {
        alert('This is a demo card. Add your YouTube API key in config.js to watch real videos.');
        return;
      }
      showPlayer(v);
    });
    els.videoGrid.appendChild(card);
  });
}

function createVideoCard(v, size = 'full') {
  const card = document.createElement('div');
  card.className = 'video-card';

  const thumbUrl = v.thumb || `https://img.youtube.com/vi/${v.id}/mqdefault.jpg`;

  card.innerHTML = `
    <div class="video-thumb">
      <img src="${escapeHtml(thumbUrl)}" alt="${escapeHtml(v.title)}" loading="lazy" />
      ${v.duration ? `<span class="video-duration">${escapeHtml(v.duration)}</span>` : ''}
      ${v.demo ? '<span class="video-duration" style="left:8px;right:auto;background:var(--accent)">DEMO</span>' : ''}
    </div>
    <div class="video-info">
      <div class="video-title">${escapeHtml(v.title)}</div>
      <div class="video-channel">${escapeHtml(v.channel)}</div>
      <div class="video-meta">${escapeHtml(v.published)}</div>
    </div>`;
  return card;
}

// ==============================================================
//  RENDER — ARTICLES
// ==============================================================
function renderArticles(articles) {
  els.articleGrid.innerHTML = '';
  if (!articles.length) {
    els.articleGrid.innerHTML = '<p style="color:var(--text2);padding:20px">No articles found. Try a different topic.</p>';
    return;
  }
  articles.forEach(art => {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.innerHTML = `
      <span class="article-lang-badge">${escapeHtml(art.flag)} ${escapeHtml(art.lang)}</span>
      <div class="article-title">${escapeHtml(art.title)}</div>
      <div class="article-excerpt translatable">${escapeHtml(art.excerpt)}</div>
      <div class="article-meta">Wikipedia · ${escapeHtml(art.lang)}</div>
      <a class="article-link" href="${escapeHtml(art.url)}" target="_blank" rel="noopener">
        Read full article
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </a>`;
    els.articleGrid.appendChild(card);
  });
}

// ==============================================================
//  RENDER — SIDEBAR / SUGGESTIONS
// ==============================================================
function renderSidebarCards(container, videos) {
  container.innerHTML = '';
  videos.forEach(v => {
    const card = createSidebarCard(v);
    card.addEventListener('click', () => {
      if (v.demo) return;
      showPlayer(v);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    container.appendChild(card);
  });
}

function renderSuggestions(videos) {
  renderSidebarCards(els.suggestionsList, videos);
}

function createSidebarCard(v) {
  const card = document.createElement('div');
  card.className = 'sidebar-card';
  const thumbUrl = v.thumb || `https://img.youtube.com/vi/${v.id}/mqdefault.jpg`;
  card.innerHTML = `
    <div class="sidebar-thumb">
      <img src="${escapeHtml(thumbUrl)}" alt="${escapeHtml(v.title)}" loading="lazy" />
      ${v.duration ? `<span class="video-duration">${escapeHtml(v.duration)}</span>` : ''}
    </div>
    <div class="sidebar-info">
      <div class="sidebar-title">${escapeHtml(v.title)}</div>
      <div class="sidebar-channel">${escapeHtml(v.channel)}</div>
      <div class="sidebar-meta">${escapeHtml(v.published)}</div>
    </div>`;
  return card;
}

// ==============================================================
//  SKELETON LOADING
// ==============================================================
function renderSkeletons(container, count) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    container.innerHTML += `
      <div class="skeleton-card">
        <div class="skeleton-thumb"></div>
        <div class="skeleton-info">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line shorter"></div>
        </div>
      </div>`;
  }
}

// ==============================================================
//  TABS
// ==============================================================
function switchTab(tab) {
  state.activeTab = tab;
  [els.tabVideos, els.tabArticles, els.tabAll].forEach(b => b.classList.remove('active'));

  if (tab === 'videos') {
    els.tabVideos.classList.add('active');
    els.videoSection.classList.remove('hidden');
    els.articleSection.classList.add('hidden');
  } else if (tab === 'articles') {
    els.tabArticles.classList.add('active');
    els.videoSection.classList.add('hidden');
    els.articleSection.classList.remove('hidden');
  } else {
    els.tabAll.classList.add('active');
    els.videoSection.classList.remove('hidden');
    els.articleSection.classList.remove('hidden');
  }
}

// ==============================================================
//  ERROR
// ==============================================================
function showError(msg) {
  els.errorState.classList.remove('hidden');
  els.errorMsg.textContent = msg;
  els.videoGrid.innerHTML = '';
  els.articleGrid.innerHTML = '';
}

// ==============================================================
//  TRANSLATION
// ==============================================================
function toggleTranslate() {
  state.translateActive = !state.translateActive;
  els.translateToggle.classList.toggle('active', state.translateActive);
  if (!state.translateActive) {
    hidePopup();
  }
}

// Get the word under the mouse cursor
function getWordAtPoint(x, y) {
  let range;
  try {
    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(x, y);
    } else if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(x, y);
      if (!pos) return null;
      range = document.createRange();
      range.setStart(pos.offsetNode, pos.offset);
      range.setEnd(pos.offsetNode, pos.offset);
    }
    if (!range) return null;
    range.expand('word');
    const word = range.toString().trim();
    return cleanWord(word) || null;
  } catch {
    return null;
  }
}

// Strip punctuation, keep letters from any script
function cleanWord(w) {
  return w.replace(/^[\s\p{P}]+|[\s\p{P}]+$/gu, '').trim();
}

// Mousemove handler
function onMouseMove(e) {
  if (!state.translateActive) return;

  // Don't translate UI elements
  const target = e.target;
  if (target.closest('header, button, select, input, a.article-link, .logo, .chip, .nav-item')) {
    hidePopup();
    return;
  }

  const word = getWordAtPoint(e.clientX, e.clientY);
  if (!word || word.length < 2 || word === state.lastTranslatedWord) return;

  // Show popup immediately with loading state
  state.lastTranslatedWord = word;
  showPopupLoading(word, e.clientX, e.clientY);

  // Debounce API call
  clearTimeout(state.translateTimer);
  state.translateTimer = setTimeout(() => translateWord(word, e.clientX, e.clientY), 350);
}

function positionPopup(x, y) {
  const popup = els.popup;
  popup.classList.remove('hidden');
  const pw = popup.offsetWidth;
  const ph = popup.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = x + 14;
  let top = y - ph / 2;

  if (left + pw > vw - 12) left = x - pw - 14;
  if (top < 8) top = 8;
  if (top + ph > vh - 8) top = vh - ph - 8;

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}

function showPopupLoading(word, x, y) {
  els.popupOriginal.textContent = word;
  els.popupText.textContent = '';
  els.popupLoading.classList.remove('hidden');
  els.popupLang.textContent = '';
  positionPopup(x, y);
}

function showPopupResult(word, translation, fromLang, toLang, x, y) {
  els.popupOriginal.textContent = word;
  els.popupText.textContent = translation;
  els.popupLoading.classList.add('hidden');
  els.popupLang.textContent = `${fromLang} → ${toLang}`;
  positionPopup(x, y);
}

function hidePopup() {
  els.popup.classList.add('hidden');
  state.lastTranslatedWord = '';
}

// Translation cache to avoid repeated API calls
const translationCache = {};

async function translateWord(word, x, y) {
  const learningLang = LANGUAGES[state.language] || LANGUAGES['Spanish'];
  const nativeLang   = LANGUAGES[CONFIG.NATIVE_LANGUAGE] || LANGUAGES['English'];
  const langpair     = `${learningLang.code}|${nativeLang.code}`;
  const cacheKey     = `${langpair}:${word.toLowerCase()}`;

  if (translationCache[cacheKey]) {
    const cached = translationCache[cacheKey];
    showPopupResult(word, cached, learningLang.label, nativeLang.label, x, y);
    return;
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${langpair}`;
    const res  = await fetch(url);
    const data = await res.json();
    const translated = data?.responseData?.translatedText;

    if (translated && translated.toLowerCase() !== word.toLowerCase()) {
      translationCache[cacheKey] = translated;
      if (state.lastTranslatedWord === word) {
        showPopupResult(word, translated, learningLang.label, nativeLang.label, x, y);
      }
    } else {
      hidePopup();
    }
  } catch {
    hidePopup();
  }
}

// ---- Hide popup when mouse stops near an empty area ----------
document.addEventListener('mouseleave', hidePopup);
let idleTimer;
document.addEventListener('mousemove', () => {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { if (state.translateActive) hidePopup(); }, 3000);
});

// ==============================================================
//  UTILITY
// ==============================================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ==============================================================
//  BOOT
// ==============================================================
document.addEventListener('DOMContentLoaded', init);
