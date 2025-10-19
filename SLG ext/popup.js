// popup.js
document.addEventListener('DOMContentLoaded', () => {
    updateUI();

    // optional manual refresh
    document.getElementById('refresh').addEventListener('click', updateUI);
});

function updateUI() {
    chrome.storage.local.get(['lyrics', 'track'], data => {
        document.getElementById('lyrics').innerText = data.lyrics || 'No lyrics yet';
        document.getElementById('track').innerText = data.track || 'No track yet';
    });
}
