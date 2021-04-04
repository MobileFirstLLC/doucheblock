import {isChrome, isEdge, requestConfigs} from '../config'
import Storage from "./storage";

/**
 * @description
 * Twitter API methods; this module must run in the browser tab
 *
 * @module
 * @name TwitterApi
 */
export default class TwitterApi {

    /**
     * Try to read JSON response of profile data
     * @param {string} response - raw API response
     * @param {function} callback
     */
    static tryParseBioData(response, callback) {
        try {
            JSON.parse(response).map((
                {description, screen_name, id_str, name}
            ) => (callback(screen_name, description, id_str, name)))
        } catch (e) {
        }
    }

    /**
     * Request user bios
     * @param {string[]} handles - user handles to check
     * @param {string} bearer - authentication Bearer token
     * @param {string} csrf - csrf token
     * @param {function} callback
     */
    static getTheBio(handles, bearer, csrf, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', requestConfigs.bioEndpoint(handles.join(',')), true);
        xhr.setRequestHeader('Authorization', bearer);
        xhr.setRequestHeader('x-csrf-token', csrf);
        xhr.onload = _ => {
            if (xhr.readyState === 4) {
                TwitterApi.tryParseBioData(xhr.response, callback);
            }
        }
        xhr.send();
    }

    /**
     * Block a specific user
     * @param id - user id str
     * @param bearer - authentication bearer token
     * @param csrf - csrf token
     */
    static doTheBlock(id, bearer, csrf) {
        const xhr = new window.XMLHttpRequest();
        xhr.open('POST', requestConfigs.blockEndpoint, true);
        xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
        xhr.setRequestHeader('Authorization', bearer);
        xhr.setRequestHeader('x-csrf-token', csrf);
        xhr.setRequestHeader('x-twitter-active-user', 'yes');
        xhr.setRequestHeader('x-twitter-auth-type', 'OAuth2Session');
        xhr.onload = _ => {
            if (xhr.status === 200) {
                Storage.incrementCount();
            }
        }
        xhr.send('user_id=' + id);
    }
}
