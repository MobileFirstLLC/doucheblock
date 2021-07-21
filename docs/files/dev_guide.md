## Source Code

<p align="center" style="font-weight: bold; margin-bottom: 30px;">
<a href="https://github.com/MobileFirstLLC/doucheblock" target="_blank" rel="noreferrer nofollow">The source code is available on Github ↗</a>
</p>

<p align="center" style="margin-top:1rem;">
<a class="github-button" href="https://github.com/MobileFirstLLC/doucheblock" data-color-scheme="no-preference: light; light: light; dark: light;" data-icon="octicon-star" data-size="large" aria-label="Star MobileFirstLLC/doucheblock on GitHub">Star</a>
<a class="github-button" href="https://github.com/MobileFirstLLC/doucheblock/fork" data-color-scheme="no-preference: light; light: light; dark: light;" data-icon="octicon-repo-forked" data-size="large" aria-label="Fork MobileFirstLLC/doucheblock on GitHub">Fork</a>
<a class="github-button" href="https://github.com/MobileFirstLLC/doucheblock/subscription" data-color-scheme="no-preference: light; light: light; dark: light;" data-icon="octicon-eye" data-size="large" aria-label="Watch MobileFirstLLC/doucheblock on GitHub">Watch</a>
<a class="github-button" href="https://github.com/MobileFirstLLC/doucheblock/archive/master.zip" data-color-scheme="no-preference: light; light: light; dark: light;" data-icon="octicon-download" data-size="large" aria-label="Download MobileFirstLLC/doucheblock on GitHub">Download</a>
<a class="github-button" href="https://github.com/MobileFirstLLC/doucheblock/issues" data-color-scheme="no-preference: light; light: light; dark: light;" data-icon="octicon-issue-opened" data-size="large" aria-label="Issue MobileFirstLLC/doucheblock on GitHub">Issue</a>
</p>

## How does it work?

After installation the extension runs in the browser tab whenever user navigates to twitter.com. In-tab content script, [AutoBlocker](/doucheblock/module-AutoBlocker.html), observes the timeline and looks for patterns matching a Twitter handle. When it has discovered a sufficient number of handles, it requests bios for the discovered handles from Twitter API server.

The extension has to obtain sufficient credentials before any API requests can be made. This
is achieved by [Tokens](/doucheblock/module-Tokens.html) module, which runs in the background context. Tokens module has two tasks:
 
 1. It listens to API call headers whenever browser sends requests to Twitter API. From there it captures the authentication headers for the current user. These are not persisted anywhere but kept in memory (see [listening headers](https://github.com/MobileFirstLLC/doucheblock/blob/0d83a2e77c44d8328ab01fde3a3cecf2d1fa16d8/src/modules/tokens.js#L19-L23), [capturing credentials](https://github.com/MobileFirstLLC/doucheblock/blob/0d83a2e77c44d8328ab01fde3a3cecf2d1fa16d8/src/modules/tokens.js#L82-L95)).
 
  2. When Tokens module receives a message from content script requesting tokens, it sends these captured credentials back to content script (see [implementation](https://github.com/MobileFirstLLC/doucheblock/blob/0d83a2e77c44d8328ab01fde3a3cecf2d1fa16d8/src/modules/tokens.js#L68-L76)).
  
This exchange of tokens enables running the extension fully on client without needing to create a Twitter app and asking the user to authenticate. Further it removes 
the need for a developer-owned server.

<img src="https://raw.githubusercontent.com/MobileFirstLLC/doucheblock/master/.github/diagram.png"
alt="system diagram" style="width:auto;width:600px; display:block; max-width:95%; margin:4rem auto"/>

Once the content script has the necessary credentials, it will proceed to make an API call to
get bios for the discovered handles. This is 1 batch request to lookup up to 100 handles with a single request. Twitter API server returns a list of bios for all requested handles.

Next the bios are checked for flagged keywords that user has set in user preferences. 
If a matching keyword is found in a bio, the content script will make a subsequent API call to block 
such douchy user. The blocking can be automatic or require confirmation from user, 
depending on user preference.

## Modules

The extension is built with modules, each performing their individual task.

| Module | Description | 
| --- | --- |
| AutoBlocker | Looks for handles and initiates blocking |
| BlockerState | Manages blocker state while browsing |
| BrowserAction | Handle extension icon click |
| OnInstall | Handle extension install event |
| Options | Edit user preferences |
| Storage | Module for persisting data |
| Tabs | Broadcast preference changes |
| Tokens | Capture authentication credentials |
| TwitterApi | Makes API calls |
 
[Explore modules here](list_module.html) 

## Running locally

This guide will explain how to build this extension from source.

You will need [Node.js](https://nodejs.org/en/download/) to build this extension. Next do the following:

<br/>

**Step 1**. Get the source code

Clone the repository with git:

```bash
git clone https://github.com/MobileFirstLLC/doucheblock.git
```

If you do not have git [download the latest source from here](https://github.com/MobileFirstLLC/doucheblock/archive/master.zip).

<br/>

**Step 2**. Install dependencies

Open the source code in your favorite web editor. Then in the terminal, run:

```bash
npm install
```

this will install all dependencies needed to build the application.

<br/>

**Step 3**. Debug

To debug the extension run:

```bash
npm run start
```

<br/>

**How to debug Chrome extensions**

1. Go to `chrome://extensions`
2. Enable developer mode
3. Click `load unpacked` 
4. Navigate to the extension source and choose `dist` directory

<br/>

**Step 4**. Build release

When ready to build a release, run:

```bash
npm run build
```

<br/>

This extension was created with [Extension CLI](https://oss.mobilefirst.me/extension-cli/). Learn more about the available commands [here &rarr;](https://oss.mobilefirst.me/extension-cli/)
