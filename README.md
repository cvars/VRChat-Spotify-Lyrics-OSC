# Spotify Lyrics Grabber (SLG)

## Overview
Spotify Lyrics Grabber (SLG) is a tool designed to enhance your Spotify experience by synchronizing lyrics with the music you're playing. It consists of two main components:

- **SLG Extension**: A browser extension that captures lyrics from Spotify when used through the browser.
- **SLG Server + OSC**: A local server that retrieves the lyrics information and sends it via VRCHAT OSC to `127.0.0.1:9000` for real-time display.

## How It Works
1. **Use Spotify in your Browser**: For the best synchronization, it's recommended to use Spotify through a web browser with the SLG extension installed.
2. **SLG Server + OSC**: This component fetches the lyrics data and transmits it via OSC to be displayed in VRChat or other applications that support OSC.

## Installation & Usage
1. Install the SLG browser extension.
2. Run the SLG Server on your local machine.
3. Ensure that your VRChat or other OSC-compatible application is listening on `127.0.0.1:9000`.

## Credits
Feel free to credit me for any use cases where you utilize this tool.
