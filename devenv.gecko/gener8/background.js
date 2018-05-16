var GENER8_BACKEND_URL = 'https://devapi.gener8ads.com/';
var GENER8_FRONTEND_URL = 'https://dev.gener8ads.com/';
/**
 * @description get any value from cookies
 * @param {string} key 
 * @param {function} callback 
 */
function cookieGet(key, callback) {
    function logCookie(cookie) {
        if (cookie) {
            callback(cookie.value, null);
        } else {
            callback(null, null);
        }
    }
    function onError(error) {
        callback(null, error);
    }
    browser.cookies.get({
        url: GENER8_FRONTEND_URL,
        name: key
    }).then(logCookie, onError);
}

/** @desc sends token to all content script
 * @param {Object} data
 */
function sendToAllContentScripts(action) {
    browser.tabs.query({}, function (tabs) {
        for (var i = 0; i < tabs.length; ++i) {
            browser.tabs.sendMessage(tabs[i].id, { action: 'TokenFromBackGround' });
        }
    });
}

/** @desc Listen to the messages and call processRequest*/
browser.runtime.onMessage.addListener(processRequest);
/** @desc process all actions
 *  @param {request,sender,sendResponse}        
 */
function processRequest(request, sender, sendResponse) {
    switch (request.action) {
        case 'openPopUpAndLogin':
            browser.windows.create({ url: GENER8_BACKEND_URL + request.data, type: "popup", height: 900, width: 900, allowScriptsToClose: true });
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
        default:
            break;
    }
}