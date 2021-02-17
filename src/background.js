/** * * * * * * * * * * * * * * * * * * * *
 *
 * Automatically block users with specific
 * keywords in bio
 *
 * Author: Mobile First LLC
 * Website: https://mobilefirst.me
 *
 * @description
 * Background script
 *
 * * * * * * * * * * * * * * * * * * * * */

import OnInstall from "./modules/onInstall";
import BrowserAction from "./modules/browserAction";
import Tokens from "./modules/tokens";

(() => new OnInstall())();
(() => new BrowserAction())();
(() => new Tokens())();
