# SC-ProfileTracksDownloader By KameKairos

Okay so I made this userscript to more easily download the original audio files from all the uploads on my /tracks page. 

This script creates a button to run it, logs to console, and will autoscroll the page to load all tracks, **though I recommend doing this manually first**, then open each edit dialog and click the "Download Original" button for each track.

It should check everything at every step but I recommend running it and not doing anything else while it runs. You don't have to but seems to error less from lagging and such. I ran this script on my profile with 360 tracks, and it downloaded 353, so might error on a couple but overall pretty decent. Feel free to fork and improve this. Or make a pull request and I'll approve it.

Hopefully this helps some people out there!

Oh and to run it do the following:
1. Download and Install the Tampermonkey(Or other userscript extension) to your browser. Confirmed working in Chrome and Firefox Only.
2. Open the Dashboard of Tampermonkey by clicking on it's icon in the extension toolbar area and selecting dashboard.
3. In the top tabs hit the [+] button and pase the contents or SC-Downloader.js into the editor. (Be sure to delete what's there first!)
4. Go to File>Save and wait for it to confirm.
5. Log into soundcloud and navigate to https://soundcloud.com/*YourUserName*/tracks.
6. Scroll to the bottom until all tracks are loaded. (The script attempts to do this but errors sometimes recommend doing it manually!)
7. Click the Orange Download Button to start the process. It will download each file to your saved downloads location one by one. It may seem like it's not downloading but wait because the triggered downloads don't always start right away. But if nothing downloads within like 3 minutes of running it, that's probably an error.
8. Wait until completed.
9. Enjoy!