# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.2.0](https://github.com/MobileFirstLLC/doucheblock/compare/v1.0.0...v1.2.0) (2021-07-16)


### Bug Fixes

* **cc:** Avoid too many return statements within this function. ([e9c8c83](https://github.com/MobileFirstLLC/doucheblock/commit/e9c8c83f2b033e71d6cba3dab2c71fe38a1fb2c5))
* **cc:** Cognitive Complexity ([131e2bc](https://github.com/MobileFirstLLC/doucheblock/commit/131e2bc53647d552c21fe9cba512ca5e8ac18d6b))
* **cc:** Function rateLink has 28 lines of code ([9a315ad](https://github.com/MobileFirstLLC/doucheblock/commit/9a315ad6ceb9258b52ace5ca7d44f4e3edd8c3de))
* settings update should notify active tabs (firefox) ([1ec99cf](https://github.com/MobileFirstLLC/doucheblock/commit/1ec99cf48bb51eb2b4c39a1cda324e2f37fe42a6))

## 1.0.1 (un-tagged)

- Added CI config to upload to Firefox
- Release for safari

## [1.0.0](https://github.com/MobileFirstLLC/doucheblock/compare/v0.3.0...v1.0.0) (2021-06-22)

- add  regex keyword support and help page to explain use [PR #16](https://github.com/MobileFirstLLC/doucheblock/pull/16)
- maxRequest interval is now configured from 20 sec to 15 sec [ref](https://github.com/MobileFirstLLC/doucheblock/blob/d9c9659bdefc0e45d08f075b7d45636704598484/src/config.js#L78)

## [0.3.0](https://github.com/MobileFirstLLC/doucheblock/compare/v0.2.1...v0.3.0) (2021-05-23)

- add real-time check for blocking status, and check before prompting [PR #14](https://github.com/MobileFirstLLC/doucheblock/pull/14)
- use `exclude_globs` in the manifest to exclude specific pages [ref](https://stackoverflow.com/questions/9687322/exclude-matches-in-manifest-json-does-nothing)
- add share and rate links to options page

## [0.2.1](https://github.com/MobileFirstLLC/doucheblock/compare/v0.2.0...v0.2.1) (2021-04-25)

- fix chrome version numbering
- add changelog
- improve documentation

## [0.2.0](https://github.com/MobileFirstLLC/doucheblock/compare/0.1.0...v0.2.0) (2021-04-25)

- add whitelist: if user chooses to cancel on alert, handle will be added to persistent whitelist [PR #7](https://github.com/MobileFirstLLC/doucheblock/pull/7)
- remove alert when viewing list of blocked accounts in settings [#8](https://github.com/MobileFirstLLC/doucheblock/issues/8)
- add max limit on how many alerts to show in a sequence (max is 3) [#9](https://github.com/MobileFirstLLC/doucheblock/issues/9)


## [0.1.0](https://github.com/MobileFirstLLC/doucheblock/compare/0.0.3...0.1.0) (2021-04-07)

- improve rate limit handling
- add Firefox version
- improve documentation

## [0.0.3](https://github.com/MobileFirstLLC/doucheblock/releases/tag/0.0.3) (2021-02-18)

- First release
