const pageImg = document.getElementById('pageImg');
const pageInput = document.getElementById('pageInput');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const surahSelect = document.getElementById('surahSelect');
const translationPanel = document.getElementById('translationPanel');
const translationHeader = document.getElementById('translationHeader');
const translationList = document.getElementById('translationList');
const toggleTranslationBtn = document.getElementById('toggleTranslation');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const wordsView = document.getElementById('wordsView');
const toggleWordsBtn = document.getElementById('toggleWords');
const toggleVerbsOnlyBtn = document.getElementById('toggleVerbsOnly');
const wordTooltip = document.getElementById('wordTooltip');
const offlineBtn = document.getElementById('offlineBtn');
const offlineBar = document.getElementById('offlineBar');
const offlineBarText = document.getElementById('offlineBarText');
const offlineBarFill = document.getElementById('offlineBarFill');

let zoomPct = parseInt(localStorage.getItem('hifz_zoom') || '75', 10);

function pdfPathForMushafPage(mushafPage) {
  const pdfPage = mushafPage + PDF_OFFSET;
  return `pages/${String(pdfPage).padStart(3, '0')}.jpg`;
}

function renderTranslation(mushafPage) {
  const verses = TRANSLATION_BY_PAGE[String(mushafPage)];
  translationList.innerHTML = '';
  if (!verses || verses.length === 0) {
    translationHeader.textContent = `Страница ${mushafPage}`;
    translationList.innerHTML = '<div class="empty-note">Для этой страницы нет привязанных аятов.</div>';
    return;
  }
  const firstSurah = verses[0].surah;
  const chapter = CHAPTERS[String(firstSurah)];
  translationHeader.textContent = `Страница ${mushafPage} — ${chapter ? chapter.name_ru + ' (' + chapter.name_arabic + ')' : ''}`;
  let prevSurah = null;
  for (const v of verses) {
    const chapterInfo = CHAPTERS[String(v.surah)];
    const label = chapterInfo ? chapterInfo.name_ru : ('Сура ' + v.surah);
    if (v.surah !== prevSurah) {
      const divider = document.createElement('div');
      divider.className = 'surah-divider';
      divider.innerHTML = `<span class="surah-divider-line"></span><span class="surah-divider-name">${label}${chapterInfo ? ' — ' + chapterInfo.name_arabic : ''}</span><span class="surah-divider-line"></span>`;
      translationList.appendChild(divider);
      prevSurah = v.surah;
    }
    const div = document.createElement('div');
    div.className = 'ayah-item';
    div.innerHTML = `<span class="ayah-num">${label} ${v.surah}:${v.ayah}</span><span class="ayah-ru">${v.ru}</span>`;
    translationList.appendChild(div);
  }
}

function renderWords(mushafPage) {
  const words = (typeof WORDS_BY_PAGE !== 'undefined') ? WORDS_BY_PAGE[String(mushafPage)] : null;
  wordsView.innerHTML = '';
  const note = document.createElement('div');
  note.className = 'wbw-note';
  note.textContent = 'Пословный перевод приблизительный (в основном машинный). Для точного смысла аята — перевод справа.';
  wordsView.appendChild(note);
  if (!words || words.length === 0) {
    wordsView.innerHTML += '<div class="empty-note">Пословный разбор недоступен для этой страницы.</div>';
    return;
  }
  let curAyah = null;
  let curSurah = null;
  for (const w of words) {
    if (curAyah !== null && w.ayah !== curAyah) {
      const marker = document.createElement('span');
      marker.className = 'wbw-ayah-end';
      marker.textContent = `۝${toArabicDigits(curAyah)}`;
      wordsView.appendChild(marker);
    }
    if (w.surah !== curSurah) {
      const chapterInfo = CHAPTERS[String(w.surah)];
      const divider = document.createElement('div');
      divider.className = 'wbw-surah-divider';
      divider.innerHTML = `<span class="surah-divider-line"></span><span class="surah-divider-name">${chapterInfo ? chapterInfo.name_ru + ' — ' + chapterInfo.name_arabic : 'Сура ' + w.surah}</span><span class="surah-divider-line"></span>`;
      wordsView.appendChild(divider);
      curSurah = w.surah;
    }
    curAyah = w.ayah;
    const span = document.createElement('span');
    span.className = 'wbw-word' + (w.v ? ' wbw-verb' : '');
    span.textContent = w.ar;
    span.dataset.ar = w.ar;
    span.dataset.ru = w.ru || '';
    span.dataset.tr = w.tr || '';
    span.dataset.surah = w.surah;
    span.dataset.ayah = w.ayah;
    if (w.v) span.dataset.verb = '1';
    wordsView.appendChild(span);
    wordsView.appendChild(document.createTextNode(' '));
  }
  if (curAyah !== null) {
    const marker = document.createElement('span');
    marker.className = 'wbw-ayah-end';
    marker.textContent = `۝${toArabicDigits(curAyah)}`;
    wordsView.appendChild(marker);
  }
}

function toArabicDigits(n) {
  const digits = '٠١٢٣٤٥٦٧٨٩';
  return String(n).split('').map(d => digits[+d] || d).join('');
}

function goToPage(mushafPage) {
  mushafPage = Math.max(1, Math.min(MUSHAF_PAGES, mushafPage));
  pageImg.src = pdfPathForMushafPage(mushafPage);
  pageInput.value = mushafPage;
  renderTranslation(mushafPage);
  renderWords(mushafPage);
  localStorage.setItem('hifz_last_page', String(mushafPage));
}

function currentPage() {
  return parseInt(pageInput.value, 10) || 1;
}

prevBtn.addEventListener('click', () => goToPage(currentPage() - 1));
nextBtn.addEventListener('click', () => goToPage(currentPage() + 1));
pageInput.addEventListener('change', () => goToPage(currentPage()));

document.addEventListener('keydown', (e) => {
  if (document.activeElement === pageInput) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') { goToPage(currentPage() + 1); e.preventDefault(); }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') { goToPage(currentPage() - 1); e.preventDefault(); }
});

toggleTranslationBtn.addEventListener('click', () => {
  translationPanel.classList.toggle('hidden');
});

toggleWordsBtn.addEventListener('click', () => {
  wordsView.classList.toggle('hidden');
  if (!wordsView.classList.contains('hidden')) {
    wordsView.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

toggleVerbsOnlyBtn.addEventListener('click', () => {
  wordsView.classList.toggle('verbs-only');
  toggleVerbsOnlyBtn.classList.toggle('active', wordsView.classList.contains('verbs-only'));
  if (wordsView.classList.contains('hidden')) {
    wordsView.classList.remove('hidden');
  }
  wordsView.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

let pinnedWord = null;

function showTooltip(span, x, y) {
  const ru = span.dataset.ru || '(нет перевода)';
  const tr = span.dataset.tr;
  const isVerb = span.dataset.verb === '1';
  wordTooltip.innerHTML = `
    <div class="wt-ar">${span.dataset.ar}</div>
    ${isVerb ? '<div class="wt-pos">глагол</div>' : ''}
    <div class="wt-ru">${ru}</div>
    ${tr ? `<div class="wt-tr">${tr}</div>` : ''}
  `;
  wordTooltip.classList.remove('hidden');
  const pad = 14;
  let left = x + pad;
  let top = y + pad;
  const maxLeft = window.innerWidth - 300;
  const maxTop = window.innerHeight - 120;
  if (left > maxLeft) left = x - 300;
  if (top > maxTop) top = y - 120;
  wordTooltip.style.left = left + 'px';
  wordTooltip.style.top = top + 'px';
}

function hideTooltip() {
  wordTooltip.classList.add('hidden');
}

wordsView.addEventListener('mouseover', (e) => {
  const span = e.target.closest('.wbw-word');
  if (!span || pinnedWord) return;
  showTooltip(span, e.clientX, e.clientY);
});
wordsView.addEventListener('mousemove', (e) => {
  const span = e.target.closest('.wbw-word');
  if (!span || pinnedWord) return;
  showTooltip(span, e.clientX, e.clientY);
});
wordsView.addEventListener('mouseleave', () => {
  if (!pinnedWord) hideTooltip();
});
wordsView.addEventListener('click', (e) => {
  const span = e.target.closest('.wbw-word');
  if (!span) return;
  if (pinnedWord === span) {
    pinnedWord.classList.remove('pinned');
    pinnedWord = null;
    hideTooltip();
    return;
  }
  if (pinnedWord) pinnedWord.classList.remove('pinned');
  pinnedWord = span;
  span.classList.add('pinned');
  showTooltip(span, e.clientX, e.clientY);
});
document.addEventListener('click', (e) => {
  if (pinnedWord && !e.target.closest('.wbw-word')) {
    pinnedWord.classList.remove('pinned');
    pinnedWord = null;
    hideTooltip();
  }
});

function applyZoom() {
  pageImg.style.width = zoomPct + '%';
  localStorage.setItem('hifz_zoom', String(zoomPct));
}
zoomInBtn.addEventListener('click', () => { zoomPct = Math.min(200, zoomPct + 10); applyZoom(); });
zoomOutBtn.addEventListener('click', () => { zoomPct = Math.max(30, zoomPct - 10); applyZoom(); });

// Build surah dropdown
const surahIds = Object.keys(CHAPTERS).map(Number).sort((a, b) => a - b);
for (const id of surahIds) {
  const c = CHAPTERS[String(id)];
  const opt = document.createElement('option');
  opt.value = String(id);
  opt.textContent = `${id}. ${c.name_ru} — ${c.name_arabic}`;
  surahSelect.appendChild(opt);
}
surahSelect.addEventListener('change', () => {
  const page = SURAH_FIRST_PAGE[surahSelect.value];
  if (page) goToPage(page);
});

// Init
applyZoom();
const lastPage = parseInt(localStorage.getItem('hifz_last_page') || '1', 10);
goToPage(lastPage);

// ---- PWA: service worker + offline page download ----

let swReady = null;
if ('serviceWorker' in navigator) {
  swReady = navigator.serviceWorker.register('sw.js').catch(() => null);
}

function setOfflineBtnState(cachedCount) {
  const total = (typeof ALL_PAGE_IMAGES !== 'undefined') ? ALL_PAGE_IMAGES.length : 681;
  if (cachedCount >= total) {
    offlineBtn.textContent = 'Скачано офлайн ✓';
    offlineBtn.classList.add('done');
  } else if (cachedCount > 0) {
    offlineBtn.textContent = `Скачать офлайн (${cachedCount}/${total})`;
    offlineBtn.classList.remove('done');
  } else {
    offlineBtn.textContent = 'Скачать офлайн';
    offlineBtn.classList.remove('done');
  }
}

async function getCachedImageCount() {
  if (!('caches' in window)) return 0;
  try {
    const cacheNames = await caches.keys();
    const imgCacheName = cacheNames.find((n) => n.includes('-images'));
    if (!imgCacheName) return 0;
    const cache = await caches.open(imgCacheName);
    const keys = await cache.keys();
    return keys.length;
  } catch {
    return 0;
  }
}

async function refreshOfflineButton() {
  const count = await getCachedImageCount();
  setOfflineBtnState(count);
}

let downloading = false;
offlineBtn.addEventListener('click', async () => {
  if (downloading) return;
  if (offlineBtn.classList.contains('done')) {
    setOfflineBtnState(await getCachedImageCount());
    return;
  }
  downloading = true;
  offlineBar.classList.remove('hidden');
  const total = ALL_PAGE_IMAGES.length;
  const already = await getCachedImageCount();
  let done = already;
  offlineBarText.textContent = `Скачивание страниц: ${done}/${total}`;
  offlineBarFill.style.width = `${Math.round((done / total) * 100)}%`;

  const CONCURRENCY = 6;
  let idx = 0;
  async function worker() {
    while (idx < total) {
      const myIdx = idx++;
      const path = ALL_PAGE_IMAGES[myIdx];
      try {
        await fetch(path, { cache: 'default' });
      } catch {
        // ignore, user can retry later
      }
      done++;
      offlineBarText.textContent = `Скачивание страниц: ${done}/${total}`;
      offlineBarFill.style.width = `${Math.round((done / total) * 100)}%`;
      setOfflineBtnState(done);
    }
  }
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) workers.push(worker());
  await Promise.all(workers);

  downloading = false;
  offlineBarText.textContent = 'Готово — все страницы сохранены для офлайн-режима';
  setTimeout(() => offlineBar.classList.add('hidden'), 3000);
  setOfflineBtnState(await getCachedImageCount());
});

if (swReady) {
  swReady.then(() => refreshOfflineButton());
} else {
  refreshOfflineButton();
}

// ---- Home screen navigation ----

const homeScreen = document.getElementById('homeScreen');
const quranApp = document.getElementById('quranApp');
const azkarApp = document.getElementById('azkarApp');

function showScreen(name) {
  homeScreen.classList.toggle('hidden', name !== 'home');
  quranApp.classList.toggle('hidden', name !== 'quran');
  azkarApp.classList.toggle('hidden', name !== 'azkar');
}

document.getElementById('goQuran').addEventListener('click', () => showScreen('quran'));
document.getElementById('goAzkar').addEventListener('click', () => { showScreen('azkar'); renderAzkarList(); });
document.getElementById('homeBtn1').addEventListener('click', () => showScreen('home'));
document.getElementById('homeBtn2').addEventListener('click', () => showScreen('home'));

showScreen('home');

// ---- Azkar ----

const azkarList = document.getElementById('azkarList');
const azkarMorningTab = document.getElementById('azkarMorningTab');
const azkarEveningTab = document.getElementById('azkarEveningTab');
let azkarMode = 'morning'; // morning -> type 0 or 1, evening -> type 0 or 2

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getAzkarCount(id) {
  return parseInt(localStorage.getItem(`azkar_${todayKey()}_${id}`) || '0', 10);
}
function setAzkarCount(id, val) {
  localStorage.setItem(`azkar_${todayKey()}_${id}`, String(val));
}

function renderAzkarList() {
  if (typeof AZKAR_ITEMS === 'undefined') {
    azkarList.innerHTML = '<div class="empty-note">Данные азкаров не загружены.</div>';
    return;
  }
  const wantType = azkarMode === 'morning' ? [0, 1] : [0, 2];
  const items = AZKAR_ITEMS.filter((it) => wantType.includes(it.type));
  azkarList.innerHTML = '';
  for (const it of items) {
    const card = document.createElement('div');
    card.className = 'azkar-item';
    const done = getAzkarCount(it.id) >= it.count;
    if (done) card.classList.add('azkar-done');
    card.innerHTML = `
      <div class="azkar-ar">${it.ar}</div>
      <div class="azkar-tr">${it.tr}</div>
      <div class="azkar-ru">${it.ru}</div>
      <details class="azkar-source">
        <summary>Довод (источник хадиса)</summary>
        <p>${it.source}</p>
      </details>
      <details class="azkar-hadith">
        <summary>Текст хадиса</summary>
        ${it.hadithAr ? `<div class="hadith-ar">${it.hadithAr}</div>` : ''}
        <p>${it.hadithRu}</p>
      </details>
      <div class="azkar-footer">
        <span class="azkar-count-label">${it.countLabel}</span>
        <div class="azkar-counter">
          <button class="azkar-reset" title="Сбросить">↺</button>
          <button class="azkar-tap">
            <span class="azkar-tap-val">${getAzkarCount(it.id)}</span>/<span>${it.count}</span>
          </button>
        </div>
      </div>
    `;
    const tapBtn = card.querySelector('.azkar-tap');
    const valSpan = card.querySelector('.azkar-tap-val');
    const resetBtn = card.querySelector('.azkar-reset');
    tapBtn.addEventListener('click', () => {
      let v = getAzkarCount(it.id);
      if (v < it.count) {
        v++;
        setAzkarCount(it.id, v);
        valSpan.textContent = v;
        if (v >= it.count) card.classList.add('azkar-done');
      }
    });
    resetBtn.addEventListener('click', () => {
      setAzkarCount(it.id, 0);
      valSpan.textContent = '0';
      card.classList.remove('azkar-done');
    });
    azkarList.appendChild(card);
  }
}

azkarMorningTab.addEventListener('click', () => {
  azkarMode = 'morning';
  azkarMorningTab.classList.add('active');
  azkarEveningTab.classList.remove('active');
  renderAzkarList();
});
azkarEveningTab.addEventListener('click', () => {
  azkarMode = 'evening';
  azkarEveningTab.classList.add('active');
  azkarMorningTab.classList.remove('active');
  renderAzkarList();
});
