DoucheBlock is like an ad blocker but for your Twitter timeline. It will automatically (or after confirmation) block people who use specific keywords in the Twitter bio. It does not contain any tracking and does not interact with any 3rd party servers. Developer never sees your personal data; does not have access to your credentials, and cannot know how you use it.

* * *

<p align="center">The source code is available on <a href="https://github.com/MobileFirstLLC/doucheblock" target="_blank" rel="noreferrer nofollow">Github ↗</a></p>

* * *

On this site you will find the source code documentation, which is primarily meant for software developers.

## How does it work?

<img src="https://raw.githubusercontent.com/MobileFirstLLC/doucheblock/master/.github/preview.gif"
alt="system diagram" style="background:#ddd; border:2px solid #555; box-shadow:6px 6px 0 #0004; border-radius:12px; width:500px; display:block; max-width:90%; margin:4rem auto"/>

After installation, the extension runs in the browser tab whenever user navigates to twitter.com.

In-tab content script observes the timeline and looks for patterns matching
a twitter handle. When it has discovered a sufficient number of handles, it sends
a message to Token module running in the background context.

Token module has two tasks. Firstly it listens to API call headers when browser sends requests to Twitter API.
From there it captures the authentication headers for the current user. These are not
persisted anywhere but kept in memory. Second, when it receives a message from content
script requesting tokens, Token module sends these captured credentials back to content
script. This exchange of tokens enables running the extension fully on client without 
needing to create a Twitter app and asking the user to authenticate. Further it removes 
the need for a developer-owned server.

<img src="https://raw.githubusercontent.com/MobileFirstLLC/doucheblock/master/.github/diagram.png"
alt="system diagram" style="width:auto;display:block; max-width:95%; margin:4rem auto"/>

Once the content script has the necessary credentials, it will proceed to make an API call to
get bios for the discovered handles. Twitter API will return a list of bios.

Next the bios are checked for flagged keywords that user has set in the user preferences. 
If keyword matches are found, the content script will make a subsequent API call to block 
such douchy user. The blocking can be automatic or require confirmation from user, 
which is determined by user preference.

## Developer Guide

This guide will explain how to build this extension from source.

You will need [Node.js](https://nodejs.org/en/download/) to build this extension. Next do the following:

<br/>

**Step 1**. Get the source code

Clone the repository with git:

```
git clone https://github.com/MobileFirstLLC/doucheblock.git
```

If you do not have git [download the source from here](https://github.com/MobileFirstLLC/doucheblock/archive/master.zip).

<br/>

**Step 2**. Install dependencies

Open the source code in your favorite web editor. Then in the terminal, run:

```
npm install
```

this will install all dependencies needed to build the application.

<br/>

**Step 3**. Debug

To debug the extension run:

```
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

```
npm run build
```

<br/>

This extension was created with [Extension CLI](https://oss.mobilefirst.me/extension-cli/)

You can learn more about the available commands in this [User Guide &rarr;](https://oss.mobilefirst.me/extension-cli/)

