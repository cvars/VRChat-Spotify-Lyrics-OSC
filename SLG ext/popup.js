document.getElementById('fetchLyrics').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: getSpotifyLyrics
        }, (results) => {
            const lyrics = results[0]?.result;
            if (lyrics) {
                document.getElementById('lyrics').innerText = lyrics;
                // Optionally, send lyrics to Node.js server
                sendLyricsToServer(lyrics);
            } else {
                document.getElementById('lyrics').innerText = 'No lyrics found!';
            }
        });
    });
});

document.getElementById('fetchTrack').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: getCurrentlyPlaying
        }, (results) => {
            const track = results[0]?.result;
            if (track) {
                document.getElementById('track').innerText = track;
                // Optionally, send track info to Node.js server
                sendTrackToServer(track);
            } else {
                document.getElementById('track').innerText = 'No track info found!';
            }
        });
    });
});

function getSpotifyLyrics() {
    const lyricsContainer = document.querySelector('._Wna90no0o0dta47Heiw');
    if (lyricsContainer) {
        const visibleLyricDiv = lyricsContainer.querySelector('div[data-testid="fullscreen-lyric"].EhKgYshvOwpSrTv399Mw > div');
        if (visibleLyricDiv) {
            return visibleLyricDiv.innerText.trim();
        } else {
            return 'No visible lyrics found!';
        }
    } else {
        return 'Lyrics container not found!';
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
            return 'Now playing information not found!';
        }
    } else {
        return 'Now playing container not found!';
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
