const http = require('http');
const url = require('url');
const osc = require('osc');

// VRChat IP address and port
const VRCHAT_IP = '127.0.0.1';
const VRCHAT_PORT = 9000;

// Create an OSC client
const client = new osc.UDPPort({
    localAddress: '0.0.0.0',
    localPort: 41234,
    remoteAddress: VRCHAT_IP,
    remotePort: VRCHAT_PORT
});

// Open the OSC client
client.open();

// Variables to store the latest lyrics and track information
let storedLyrics = '';
let storedTrack = '';
let lastTrack = '';

let BlankEgg = "\u0003\u001f"; // Credits @BoiHanny for this Unicode character that allows for thinner chatbox size

// Function to send combined message to chatbox
function sendTextToChatbox(message) {
    const oscMessage = {
        address: '/chatbox/input',
        args: [
            {
                type: "s", // chatbox text itself
                value: message
            },
            {
                type: "i", // don't open keyboard (post straight to chatbox)
                value: 1
            },
            {
                type: "b", // don't play notification sound
                value: new Uint8Array([0x00]) // I HATE VRCHAT
            },
        ]
    };
    client.send(oscMessage, (error) => {
        if (error) {
            console.error('Error sending text to chatbox:', error);
        } else {
            //console.log(`Text sent to chatbox: ${message}`);
        }
    });
}


// Create an HTTP server
const server = http.createServer((req, res) => {
    const queryObject = url.parse(req.url, true).query;

    if (req.method === 'GET') {
        let messageToSend = '';

        if (queryObject.lyrics) {
            storedLyrics = queryObject.lyrics; // Keep Unicode characters
            //console.log('Updated lyrics:', storedLyrics);
        }

        if (queryObject.track) {
            const currentTrack = queryObject.track;
            if (currentTrack !== lastTrack) {
                lastTrack = currentTrack; // Update the last track
                storedLyrics = ''; // Reset lyrics if the track changes
                //console.log('Track changed. Resetting lyrics.');
            }
            storedTrack = currentTrack;
            //console.log('Updated track:', storedTrack);
        }

        // Combine track and lyrics for sending and logging
        if (storedTrack || storedLyrics) {
            messageToSend = `${storedTrack}\n\n${storedLyrics}${BlankEgg}`;
            sendTextToChatbox(messageToSend); // Send the combined message to chatbox
        }

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Data received, logged to console, and sent to chatbox.');
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
    }
});

// Start the server
server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
