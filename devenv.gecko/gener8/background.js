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
        case 'saveLoginDetails':
            var tkn = request.data.token;
            browser.cookies.set({
                url: GENER8_FRONTEND_URL,
                name: 'gnr-ext-token',
                value: tkn
            });
            saveUserDetails(request.data);
            sendToAllContentScripts('TokenFromBackGround');
            browser.runtime.sendMessage({ action: 'getUserDetails', data: tkn });
            break;
        case 'tokenExists':
            cookieGet('gnr-ext-token', function (token) {
                if (token) {
                    console.log(sender);
                    browser.tabs.sendMessage(sender.tab.id, { action: 'catchToken', data: {
                        token,
                        isBlocked: gener8TabData.whitelist[sender.tab.id],
                        adTags
                    } });
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

function saveCookies(key, value){
    const hash = {
        "hash":true
    }
    let cookieValue= {
        "opts":{},"body": value
    }
    if(key === 'jwtToken'){
        cookieValue.opts = hash;
        cookieValue.body = btoa(value)
    }
    return browser.cookies.set({
        url: GENER8_FRONTEND_URL,
        name: key,
        value: JSON.stringify(cookieValue)
    });
}

function b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}

/**
 * 
 * @param {Object} data User Object
 */
function saveUserDetails(data){
    Promise.all([
        saveCookies('jwtToken',data.token),
        saveCookies('profileStrength',JSON.stringify(data.profileStatus)    ),
        saveCookies('referralLink',data.referralLink),
        saveCookies('tnc',data.tnc.version ? data.tnc.version: ''),
        saveCookies('tncAccepted',data.tncAccepted),
        saveCookies('walletToken',data.walletToken),
        saveCookies('Notification',''),
        saveCookies('NotificationType',''),
        saveCookies('verifymailmessage',''),
    ]).then(t=>{
        console.log('all cookies stored', t)
    }, e=>{
        console.log('all cookies failed', e)
    })
}