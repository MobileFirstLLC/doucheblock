/** * * * * * * * * * * * * * * * * * * * *
 * Automatically block users with specific
 * keywords in bio
 *
 * @description
 * Background script - setup everything
 * needed to happen in browser background.
 * * * * * * * * * * * * * * * * * * * * */

import OnInstall from "./modules/onInstall";
import BrowserAction from "./modules/browserAction";
import Tokens from "./modules/tokens";

(() => new OnInstall())();
(() => new BrowserAction())();
(() => new Tokens())();
