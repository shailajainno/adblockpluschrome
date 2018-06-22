const GENER8_BACKEND_URL = 'https://devapi.gener8ads.com/';
const GENER8_FRONTEND_URL = 'https://dev.gener8ads.com/';
var VALIDATE_WHITE_LIST = 'user/validatedomain';


/**
 * Get cookie
 * @param {string} key
 * @param {function} callback
 */
function cookieGet(key, callback) {
    function logCookie(cookie) {
        callback(cookie ? cookie.value: null);
    }
    function onError() {
        callback(null);
    }
    browser.cookies.get({
        url: GENER8_FRONTEND_URL,
        name: key
    }).then(logCookie, onError);
}

/**
 * Sends token to all content script
 * @param {string} action
 */
function sendToAllContentScripts(_action) {
    browser.tabs.query({}, function (tabs) {
        for (var i = 0; i < tabs.length; ++i) {
            browser.tabs.sendMessage(tabs[i].id, { action: _action });
        }
    });
}

// Listen to the messages and call processRequest
browser.runtime.onMessage.addListener(processRequest);

/**
 * Process request for
 * 1) Open login
 * 2) Save token
 * 3) Check token exists or not
 * @author Innovify
 * @param {Object} request
 * @param {string} sender
 */
function processRequest(request, sender) {
    switch (request.action) {
        case 'openPopUpAndLogin':
            browser.windows.create({ url: GENER8_BACKEND_URL + request.data, type: 'popup', height: 900, width: 900, allowScriptsToClose: true });
            break;
        case 'saveToken':
            var tkn = request.data;
            browser.cookies.set({
                url: GENER8_FRONTEND_URL,
                name: 'gnr-ext-token',
                value: tkn
            });
            sendToAllContentScripts('TokenFromBackGround');
            browser.runtime.sendMessage({ action: 'getUserDetails', data: tkn });
            break;
        case 'tokenExists':
            cookieGet('gnr-ext-token', function (token) {
                if (token) {
                    browser.tabs.sendMessage(sender.tab.id, { action: 'catchToken', data: token });
                }
            });
            break;
        case 'deleteToken':
            browser.cookies.remove({
                url: GENER8_FRONTEND_URL,
                name: 'gnr-ext-token'
            })
            break;
        default:
            break;
    }
}
