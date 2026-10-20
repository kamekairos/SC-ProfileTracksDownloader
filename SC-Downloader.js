// ==UserScript==
// @name         SoundCloud Bulk Original Downloader
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Automates downloading original tracks from your SoundCloud profile tracks page with safety checks and latency delays.
// @match        https://soundcloud.com/*/tracks
// @match        https://soundcloud.com/*/albums
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Configuration parameters (adjust delays in milliseconds if your connection/browser lags)
    const CONFIG = {
        delayBetweenTracks: 3500, // Time to wait after triggering a download before moving to the next track
        modalWaitTimeout: 3000,   // Max time to wait for edit modal/dropdown to render
        scrollStepDelay: 1500     // Delay after scrolling down to load lazy content
    };

    let isRunning = false;

    // Create a floating control panel in the corner of the page
    function createControlPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 99999;
            background: #111;
            color: #fff;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            font-family: Interstate, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Garuda, Verdana, Tahoma, sans-serif;
            font-size: 13px;
            width: 240px;
        `;

        panel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; font-size: 14px; border-bottom: 1px solid #333; padding-bottom: 5px; color: #ff5500;">
                SC Original Downloader
            </div>
            <div id="sc-dl-status" style="margin-bottom: 12px; color: #aaa;">Status: Idle</div>
            <button id="sc-dl-toggle" style="
                background: #ff5500;
                color: white;
                border: none;
                padding: 8px 12px;
                width: 100%;
                border-radius: 4px;
                font-weight: bold;
                cursor: pointer;
            ">Start Batch Download</button>
        `;

        document.body.appendChild(panel);

        document.getElementById('sc-dl-toggle').addEventListener('click', () => {
            if (!isRunning) {
                startBatchDownload();
            } else {
                stopBatchDownload("Stopped by user.");
            }
        });
    }

    function updateStatus(text) {
        const statusEl = document.getElementById('sc-dl-status');
        if (statusEl) statusEl.innerText = `Status: ${text}`;
        console.log(`[SC Downloader] ${text}`);
    }

    function setButtonState(running, text) {
        isRunning = running;
        const btn = document.getElementById('sc-dl-toggle');
        if (btn) {
            btn.innerText = text;
            btn.style.background = running ? '#cc2200' : '#ff5500';
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function startBatchDownload() {
        setButtonState(true, 'Stop Batch Download');
        updateStatus('Initializing...');

        try {
            // Optional: Auto-scroll down a few times to load tracks if lazy-loaded
            updateStatus('Expanding track list...');
            let previousHeight = 0;
            let scrolls = 0;
            while (scrolls < 10) {
                window.scrollTo(0, document.documentElement.scrollHeight);
                await sleep(CONFIG.scrollStepDelay);
                let currentHeight = document.documentElement.scrollHeight;
                if (currentHeight === previousHeight) break;
                previousHeight = currentHeight;
                scrolls++;
            }

            // Select all track list items (adjust selectors based on current SC DOM structure)
            const trackItems = document.querySelectorAll('.soundList__item, .trackItem');
            updateStatus(`Found ${trackItems.length} track items.`);

            if (trackItems.length === 0) {
                stopBatchDownload("No tracks found on this page.");
                return;
            }

            for (let i = 0; i < trackItems.length; i++) {
                if (!isRunning) break;

                const item = trackItems[i];
                updateStatus(`Processing track ${i + 1} of ${trackItems.length}`);

                // Scroll track into view smoothly
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await sleep(600);

                // Find and click the edit/more options button on the track row
                const editButton = item.querySelector('button.sc-button-edit, button[aria-label*="Edit"], button.moreActions');
                if (!editButton) {
                    console.warn(`[SC Downloader] Edit button not found for track index ${i}. Skipping.`);
                    continue;
                }

                editButton.click();

                // Wait for dropdown menu or edit modal to open
                let modalOrMenu = null;
                const startTime = Date.now();
                while (Date.now() - startTime < CONFIG.modalWaitTimeout) {
                    modalOrMenu = document.getElementsByClassName('g-z-index-modal-content');
                    if (modalOrMenu) break;
                    await sleep(150);
                }

                if (!modalOrMenu) {
                    console.warn(`[SC Downloader] Modal/menu failed to open for track index ${i}. Skipping.`);
                    // Try to click anywhere to clear state
                    document.body.click();
                    continue;
                }

                await sleep(400); // UI stabilization delay

                // Find and click the "Download original" option inside the modal or menu
                const downloadOriginalBtn = Array.from(document.getElementsByClassName('sc-button-download'));

                if (downloadOriginalBtn) {
                    downloadOriginalBtn[0].click();
                    updateStatus(`Triggered download for track ${i + 1}`);
                } else {
                    console.warn(`[SC Downloader] "Download original" option missing for track index ${i} (may not have an original uploaded).`);
                }

                await sleep(600);

                // Close modal / dismiss menu if still open (hit Cancel, Close, or Escape key)
                const closeBtn = document.querySelector('.sc-modal__close, button[aria-label="Close"], .editModal__cancel');
                if (closeBtn) {
                    closeBtn.click();
                } else {
                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
                }

                // Buffer time between successive track operations to handle server / browser lag
                await sleep(CONFIG.delayBetweenTracks);
            }

            stopBatchDownload("Batch download complete!");

        } catch (err) {
            console.error(err);
            stopBatchDownload("Error occurred (check console).");
        }
    }

    function stopBatchDownload(message) {
        setButtonState(false, 'Start Batch Download');
        updateStatus(message);
    }

    // Initialize UI on page load
    window.addEventListener('load', () => {
        setTimeout(createControlPanel, 2000);
    });

})();