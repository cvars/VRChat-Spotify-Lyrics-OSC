// background.js
const FETCH_INTERVAL_MS = 100;
let lastLyrics = '';
let lastTrack = '';
let fetchInterval;

chrome.runtime.onInstalled.addListener(startFetching);
chrome.runtime.onStartup.addListener(startFetching);

function startFetching() {
    if (fetchInterval) clearInterval(fetchInterval);
    fetchInterval = setInterval(fetchAndSend, FETCH_INTERVAL_MS);
}

function fetchAndSend() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (!tabs.length) return;
        const tabId = tabs[0].id;

        chrome.scripting.executeScript({ target: { tabId }, func: scrapeLyrics }, res => {
            const lyrics = res?.[0]?.result;
            if (lyrics && lyrics !== lastLyrics) {
                lastLyrics = lyrics;
                chrome.storage.local.set({ lyrics });
                send('lyrics', lyrics);
            }
        });

        chrome.scripting.executeScript({ target: { tabId }, func: scrapeTrack }, res => {
            const track = res?.[0]?.result;
            if (track && track !== lastTrack) {
                lastTrack = track;
                chrome.storage.local.set({ track });
                send('track', track);
            }
        });
    });
}

// ✅ fixed: gets all lyric lines, skips empty or ♪
function scrapeAllLyrics() {
    const nodes = document.querySelectorAll('div[data-testid="fullscreen-lyric"] div.MmIREVIj8A2aFVvBZ2Ev');
    return Array.from(nodes)
        .map(n => n.innerText.trim())
        .filter(line => line && line !== '♪')
        .join('\n');
}

function scrapeLyrics() {
    // all lyric containers
    const containers = Array.from(document.querySelectorAll('div[data-testid="fullscreen-lyric"]'));

    if (!containers.length) return '';

    // 1) Prefer container that has a class token starting with '_'
    const byUnderscoreClass = containers.find(c =>
        Array.from(c.classList).some(tok => tok.startsWith('_'))
    );
    if (byUnderscoreClass) {
        const inner = byUnderscoreClass.querySelector('div.MmIREVIj8A2aFVvBZ2Ev');
        if (inner) return inner.innerText.trim();
    }

    // 2) Newer Spotify builds may mark the active line explicitly
    const explicit = document.querySelector('div[data-testid="fullscreen-lyric"] div[data-testid="fullscreen-lyric-line-current"]');
    if (explicit) return explicit.innerText.trim();

    // 3) Heuristic: pick the lyric line that looks "active" by computed style
    for (const c of containers) {
        const inner = c.querySelector('div.MmIREVIj8A2aFVvBZ2Ev');
        if (!inner) continue;
        const cs = window.getComputedStyle(inner);
        // active line often has stronger font-weight or higher opacity
        const weight = parseInt(cs.fontWeight) || 400;
        const opacity = parseFloat(cs.opacity || '1');
        if (weight >= 600 || opacity > 0.95) return inner.innerText.trim();
    }

    // 4) fallback: return first non-empty lyric line
    for (const c of containers) {
        const inner = c.querySelector('div.MmIREVIj8A2aFVvBZ2Ev');
        if (inner && inner.innerText.trim()) return inner.innerText.trim();
    }

    return '';
}


function scrapeTrack() {
    const title = document.querySelector('div[data-testid="context-item-info-title"] a');
    const artist = document.querySelector('div[data-testid="context-item-info-subtitles"] a');
    return (title && artist) ? `${title.innerText.trim()} by ${artist.innerText.trim()}` : '';
}

function send(type, value) {
    fetch(`http://localhost:3000?${type}=` + encodeURIComponent(value))
        .then(r => r.text())
        .then(console.log)
        .catch(console.error);
}
