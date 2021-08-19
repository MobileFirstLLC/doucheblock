/** * * * * * * * * * * * * * * * * * * * *
 * Automatically block users with specific
 * keywords in bio
 *
 * @description
 * Content script - this runs when user
 * browses twitter.com
 * * * * * * * * * * * * * * * * * * * * */

import AutoBlocker from './modules/autoblocker';

(() => new AutoBlocker())();
