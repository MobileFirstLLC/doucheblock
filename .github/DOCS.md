DoucheBlock for Twitter will automatically (or after confirmation) block people who use specific keywords in the Twitter bio. The source code of this application is available on [Github ↗](https://github.com/MobileFirstLLC/doucheblock). On this page you will find the source code documentation.

## How dow it work





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

