# Privacy Policy

This privacy policy applies to 
software application DoucheBlock for Twitter (the "app") 
developed by Mobile First LLC (the "developer"). 
This policy applies to everyone who installs and uses the application (the "user").

## User Accounts

- This extension assumes user has an existing Twitter account. No other account is necessary to use this extension. 
- This extension runs on top of Twitter.com web client; it runs 100% on client (no backend server) impersonating the current user. 
- The current user identity is captured during runtime and that information is only kept in memory. 
- Extension does not persist any personal information about user.
- Extension developer never sees any personal data about the user.

## User Preferences

Preferences include the configurable options user can adjust to customize the extension behavior. 
User preferences are stored locally in the browser storage, on the current device. 
[No sensitive information is stored in user preferences.](https://github.com/MobileFirstLLC/doucheblock/blob/1947943d430e833a2a4fb96d414795da0830e83e/src/config.js#L32-L58)

Some supported browsers use build-in sync-storage to synchronize local data across devices. This
synchronization is internal to the browser and outside the scope of this extension.
Its use is motivated by improved user experience since user does not have to configure
extension individually between different devices. If user wishes to disable this feature,
extension data synchronization can be disabled globally in browser settings for 
[browsers that default to using it](https://github.com/MobileFirstLLC/doucheblock/blob/1947943d430e833a2a4fb96d414795da0830e83e/src/modules/storage.js#L37-L42).
   
User preferences are cleared immediately and automatically on extension uninstall. 
No further action is needed to clear all application user data.

## 3rd Party code, Tracking and Analytics

This extension includes no tracking, no analytics, no 3rd party servers and no remote code.

## Acknowledgement

By using the app the user accepts this policy.

* * * 

Last updated: August 28, 2021

[Privacy policy revision history ↗](https://github.com/MobileFirstLLC/doucheblock/commits/master/docs/pages/privacy.md)
