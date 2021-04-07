import {requestConfigs} from '../config'
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
     * Request user bios
     * @param {string[]} handles - user handles to check
     * @param {string} bearer - authentication Bearer token
     * @param {string} csrf - csrf token
     * @param {function} callback handler for successful bio request
     * @param {function} errorCallback - handler when this request cannot be completed
     */
    static getTheBio(handles, bearer, csrf, callback, errorCallback) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', requestConfigs.bioEndpoint(handles.join(',')), true);
        xhr.setRequestHeader('Authorization', bearer);
        xhr.setRequestHeader('x-csrf-token', csrf);
        xhr.onload = _ => {
            if (xhr.readyState === 4) {
                try {
                    const bios = JSON
                        .parse(xhr.response)
                        .map(({description, id_str, name}) => {
                            return {bio: description, id: id_str, name: name}
                        })
                    callback(bios);
                } catch (e) {
                    errorCallback()
                }
            }
        }
        xhr.onerror = _ => errorCallback();
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
