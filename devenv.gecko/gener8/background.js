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
        case 'tokenExists':
            cookieGet('jwtToken', function (token) {
                if (token) {
                    token = JSON.parse(token).body;
                    token = atob(token);
                    try {
                        console.log('---------------dddd--------------------');
                        console.log('Min', minCount < defaultMinCount, minCount, defaultMinCount);
                        console.log('Hour', hourCount < defaultHourCount, hourCount, defaultHourCount);
                        console.log('Day', dayCount < defaultDayCount, dayCount, defaultDayCount);
                        console.log(dayCount < defaultDayCount, dayCount, defaultDayCount);
                        
                        browser.tabs.sendMessage(sender.tab.id, { action: 'catchToken', data: {
                            token,
                            isBlocked: gener8TabData.whitelist[sender.tab.id],
                            adTags,
                            replace: (minCount < defaultMinCount && hourCount < defaultHourCount && dayCount < defaultDayCount)
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
            adImpression(request.newAdCount);
            break;
        case 'SET_USERDATA':
            userData = request.data;
            tokenRate = request.data.tokenRate;
            console.log('got new adtags', request.adTags)
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
    if(request.token){
        console.log('cookies set....', request);
        saveCookies('jwtToken', request.token);
    }
    
    if(isLogin){
        console.log('isLogin....???')
        browser.tabs.create({
            url: GENER8_FRONTEND_URL + '#/privacy?isPrivacy=true'
        });
    }
}

function adImpression(newAdCount){
    console.log('===>>',userData.walletToken, typeof userData.walletToken, tokenRate, typeof tokenRate);
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
    console.log('data/////////////////////', data);
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
        console.log('all cookies stored', t)
    }, e=>{
        console.error('Storing cookies failed', e)
    })
}
