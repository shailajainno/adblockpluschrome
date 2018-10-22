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
            sendToAllContentScripts('TokenFromBackGround');
            saveUserDetails(request.data);
            break;
        case 'deleteToken':
            browser.cookies.remove({
                url: GENER8_FRONTEND_URL,
                name: 'jwtToken'
            })
            break;
        case 'AD_IMPRESSION':
            adImpression(request.newAdCount);
            break;
        case 'SET_USERDATA':
            userData = request.data;
            tokenRate = request.data.tokenRate;
            if(request.adTags){
                adTags = request.adTags;
            }
            break;
        case 'SET_TNC':
            setTNCData(request, false);
            break;
        default:
            break;
    }
}

function setFraudPrevention(data) {
    if(data.globalAdsCounts){
        defaultMinCount = data.globalAdsCounts.minCount;
        defaultHourCount = data.globalAdsCounts.hourCount;
        defaultDayCount = data.globalAdsCounts.dayCount;
    }
    if(data.userAdsCount && data.userAdsCount.lastSyncAt){
        lastSyncAt =  data.userAdsCount.lastSyncAt
        dayCount = data.userAdsCount.dayCount;
        minCount = data.userAdsCount.minCount;
        hourCount = data.userAdsCount.hourCount;
    }
 }

function setTNCData(request, isLogin) {
    let cookieExpDate = new Date().getTime()/1000 + 365 * 24 * 60 * 60 * 100;
    browser.cookies.set({
        url: GENER8_FRONTEND_URL,
        name: 'tncAccepted',
        value: JSON.stringify({ "opts":{},"body": false}),
        expirationDate: Math.trunc(cookieExpDate)
    });
    browser.cookies.set({
        url: GENER8_FRONTEND_URL,
        name: 'tnc',
        value: JSON.stringify({ "opts":{},"body": request.data}),
        expirationDate: Math.trunc(cookieExpDate)
    });
    if(request.token){
        saveCookies('jwtToken', request.token);
    }
    
    if(isLogin){
        browser.tabs.create({
            url: GENER8_FRONTEND_URL + '#/privacy?isPrivacy=true'
        });
    }
}

function adImpression(newAdCount){
    if(typeof userData.walletToken === 'string'){
        userData.walletToken = parseFloat(userData.walletToken);
    }
    minCount =  minCount + newAdCount;
    hourCount = hourCount + newAdCount;
    dayCount = dayCount + newAdCount;
    userData.walletToken += newAdCount * tokenRate;
    userData.walletToken = Math.round(userData.walletToken * 10000) / 10000;
}

setInterval(() => {
    if(userData){
        saveCookies('walletToken',userData.walletToken.toFixed(2));
        browser.storage.local.set({
            user: userData
        });
    }
    saveCookies('minCount', minCount);
    saveCookies('hourCount', hourCount);
    saveCookies('dayCount', dayCount);
    saveCookies('lastSyncAt', lastSyncAt);
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
    let cookieExpDate = new Date().getTime()/1000 + 365 * 24 * 60 * 60 * 100;
    return browser.cookies.set({
        url: GENER8_FRONTEND_URL,
        name: key,
        value: JSON.stringify(cookieValue),
        expirationDate: Math.trunc(cookieExpDate)
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
        if(data.tncAccepted){
            browser.tabs.create({
                url: GENER8_FRONTEND_URL
            });
        }else{
            browser.tabs.create({
                url: GENER8_FRONTEND_URL + '#/privacy?isPrivacy=true'
            });
        }
    }, e=>{
        console.error('Storing cookies failed', e)
    })
}
