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

function replaceAds(tabId, tabURL) {

    browser.cookies.get({
        url: GENER8_FRONTEND_URL,
        name: 'jwtToken'
      }, (t)=>{
        if(t){
          browser.storage.local.get([
            'pageWhitelist',
            'userWhitelist',
            'userStatusCode',
            'adminWhitelist',
            'notificationCount',
            'adTags',
            'tokenRate',
            'user'
          ], (gener8Data)=>{
              const currentDomain = tabURL.split("/")[2];
              const gener8CurrentPage = tabURL.split('?')[0];
              gener8TabData.whitelist[tabId] = !!gener8Data.userStatusCode || 
                gener8Data.pageWhitelist.indexOf(gener8CurrentPage) > -1 ||
                gener8Data.userWhitelist.indexOf(currentDomain) > -1 ||
                gener8Data.adminWhitelist.indexOf(currentDomain) > -1;
                browser.browserAction.setBadgeBackgroundColor({
                  color: "#d32d27",
                  tabId: tabId
                });
                gener8TabData.replace[tabId] = (minCount < defaultMinCount && hourCount < defaultHourCount && dayCount < defaultDayCount);
                if(!gener8TabData.whitelist[tabId]){
                    try {
                      browser.tabs.sendMessage(tabId, { 
                        action: 'catchToken',
                        data: {
                          isBlocked: gener8TabData.whitelist[tabId],
                          adTags,
                          tabId,
                          replace: gener8TabData.replace[tabId]
                        } 
                      });
                    } catch (error) {
                    }
                }

                browser.browserAction.setBadgeText({
                  text: gener8Data.notificationCount > 0 ? gener8Data.notificationCount.toString() : '',
                  tabId: tabId
                });
                gener8TabData.replace[tabId] = (minCount < defaultMinCount && hourCount < defaultHourCount && dayCount < defaultDayCount);
            });
        }else{
          gener8TabData.whitelist[tabId] = true;
          return;
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
            browser.windows.create({ url: GENER8_BACKEND_URL + request.data, type: 'popup', height: 900, width: 900 });
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
        case 'PAGE_LOADED':
            replaceAds(sender.tab.id, sender.tab.url);
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
    console.log('new Add', newAdCount, 'walletToken', userData.walletToken);
    
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
