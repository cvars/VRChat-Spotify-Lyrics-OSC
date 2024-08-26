// Set an interval to fetch and send lyrics every (500 milliseconds)
const FETCH_INTERVAL_MS = 500; // 500 milliseconds

// Variables to track the last fetched lyrics and currently playing track
let lastFetchedLyrics = '';
let lastFetchedTrack = '';

let fetchInterval;

chrome.runtime.onInstalled.addListener(() => {
    console.log('Spotify Lyrics Grabber installed.');
    startFetchingLyrics();
});

chrome.runtime.onStartup.addListener(() => {
    startFetchingLyrics();
});

function startFetchingLyrics() {
    if (fetchInterval) {
        clearInterval(fetchInterval);
    }
    fetchInterval = setInterval(fetchAndSendLyrics, FETCH_INTERVAL_MS);
}

function fetchAndSendLyrics() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs.length === 0) return; // No active tab found

        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: getSpotifyLyrics
        }, (results) => {
            if (!results || results.length === 0) {
                console.log('No results returned from executeScript.');
                return;
            }

            const currentLyrics = results[0]?.result; // Use optional chaining to avoid errors
            if (currentLyrics && currentLyrics !== lastFetchedLyrics) {
                console.log('Fetched lyrics:', currentLyrics);
                // Save lyrics using local storage
                chrome.storage.local.set({ 'lyrics': currentLyrics }, () => {
                    console.log('Lyrics saved.');
                });
                // Send lyrics to Node.js server
                sendLyricsToServer(currentLyrics);
                // Update last fetched lyrics
                lastFetchedLyrics = currentLyrics;
            } else {
                console.log('Lyrics unchanged or not found!');
            }
        });

        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: getCurrentlyPlaying
        }, (results) => {
            if (!results || results.length === 0) {
                console.log('No results returned from executeScript.');
                return;
            }

            const currentTrack = results[0]?.result; // Use optional chaining to avoid errors
            if (currentTrack && currentTrack !== lastFetchedTrack) {
                console.log('Fetched track:', currentTrack);
                // Save track info using local storage
                chrome.storage.local.set({ 'currentTrack': currentTrack }, () => {
                    console.log('Track info saved.');
                });
                // Send track info to Node.js server
                sendTrackToServer(currentTrack);
                // Update last fetched track
                lastFetchedTrack = currentTrack;
            } else {
                console.log('Track info unchanged or not found!');
            }
        });
    });
}

function getSpotifyLyrics() {
    const lyricsContainer = document.querySelector('._Wna90no0o0dta47Heiw');
    if (lyricsContainer) {
        const visibleLyricDiv = lyricsContainer.querySelector('div[data-testid="fullscreen-lyric"].EhKgYshvOwpSrTv399Mw > div');
        if (visibleLyricDiv) {
            return visibleLyricDiv.innerText.trim();
        } else {
            return ''; //No visible lyrics found!
        }
    } else {
        return ''; //Lyrics container not found
    }
}

function getCurrentlyPlaying() {
    const nowPlayingContainer = document.querySelector('div[data-testid="now-playing-widget"]');
    if (nowPlayingContainer) {
        const trackTitleElement = nowPlayingContainer.querySelector('div[data-testid="context-item-info-title"] a');
        const artistNameElement = nowPlayingContainer.querySelector('div[data-testid="context-item-info-subtitles"] a');
        if (trackTitleElement && artistNameElement) {
            const trackTitle = trackTitleElement.innerText.trim();
            const artistName = artistNameElement.innerText.trim();
            return `${trackTitle} by ${artistName}`;
        } else {
            return ''; //Now playing information not found!
        }
    } else {
        return ''; //Now playing container not found!
    }
}

function sendLyricsToServer(lyrics) {
    fetch('http://localhost:3000?lyrics=' + encodeURIComponent(lyrics), {
        method: 'GET'
    })
    .then(response => response.text())
    .then(data => {
        console.log('Server response:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function sendTrackToServer(track) {
    fetch('http://localhost:3000?track=' + encodeURIComponent(track), {
        method: 'GET'
    })
    .then(response => response.text())
    .then(data => {
        console.log('Server response:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
