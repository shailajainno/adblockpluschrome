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
    browser.tabs.query({ currentWindow: true, active: true }, function (tabs) {
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
            saveUserDetails(request.data);
            sendToAllContentScripts('TokenFromBackGround');
            browser.runtime.sendMessage({ action: 'getUserDetails', data: tkn });
            break;
        case 'tokenExists':
            cookieGet('jwtToken', function (token) {
                if (token) {
                    token = JSON.parse(token).body;
                    token = atob(token);
                    try {
                        browser.tabs.sendMessage(sender.tab.id, { action: 'catchToken', data: {
                            token,
                            isBlocked: gener8TabData.whitelist[sender.tab.id],
                            adTags
                        } });
                    } catch (error) {
                        console.error(error);
                    }
                }
            });
            break;
        case 'deleteToken':
            browser.cookies.remove({
                url: GENER8_FRONTEND_URL,
                name: 'jwtToken'
            })
            break;
        case 'AD_IMPRESSION':
            adImpression();
            break;
        case 'SET_USERDATA':
            userData = request.data;
            tokenRate = request.data.tokenRate;
            break;
        case 'SET_TNC':
            browser.cookies.set({
                url: GENER8_FRONTEND_URL,
                name: 'tncAccepted',
                value: JSON.stringify({ "opts":{},"body": false})
            });
            browser.cookies.set({
                url: GENER8_FRONTEND_URL,
                name: 'tnc',
                value: JSON.stringify({ "opts":{},"body": request.data})
            });
            break;
        default:
            break;
    }
}

function adImpression(){
    console.log('===>>',userData.walletToken, typeof userData.walletToken, tokenRate, typeof tokenRate);
    userData.walletToken += tokenRate;
    userData.walletToken = Math.round(userData.walletToken * 100) / 100
}

setInterval(() => {
    console.log(new Date(), userData);
    browser.storage.local.set({
        user: userData
    });
}, 30 * 1000);

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

/**
 * 
 * @param {Object} data User Object
 */
function saveUserDetails(data){
    Promise.all([
        saveCookies('jwtToken',data.token),
        saveCookies('profileStrength',JSON.stringify(data.profileStatus)    ),
        saveCookies('referralLink',data.referralLink),
        saveCookies('tnc',data.tnc && data.tnc.version ? data.tnc.version: ''),
        saveCookies('tncAccepted',data.tncAccepted),
        saveCookies('walletToken',data.walletToken),
        saveCookies('Notification',''),
        saveCookies('NotificationType',''),
        saveCookies('verifymailmessage',''),
    ]).then(t=>{
        console.log('all cookies stored', t)
    }, e=>{
        console.error('Storing cookies failed', e)
    })
}