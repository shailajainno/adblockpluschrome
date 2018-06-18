const GENER8_BACKEND_URL = 'https://devapi.gener8ads.com/';
const GENER8_FRONTEND_URL = 'https://dev.gener8ads.com/';
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
        default:
            break;
    }
}

let a = 1;
browser.webRequest.onBeforeRequest.addListener(function(details){
    // console.log(details.url);
    console.log(details.type);
        var redirectUrl = 'https://www.gener8ads.com/';
      if(details.url.indexOf('gener8') === -1 && details.url.indexOf('youtube') === -1){
        console.log(details.url, a++);
        // // console.log('done1', details.url);
        // return new Promise((resolve) => {
        // //     console.log('done', details.url);
        //     window.setTimeout(() => {
        //         resolve({redirectUrl});                                                                                                                                                                                                                                                                                                                                                                                                                                                                        resolve({redirectUrl})
        //     }, 1000);
        //   });
        return {cancel: true}
      }
  },{
       urls: ["<all_urls>"], types: ["sub_frame","other","image"] 
}, ["blocking"]);

browser.webRequest.onCompleted.addListener(function(details){
    // console.log(details.url);
    
    if(details.type === 'beacon'){
        console.log("beacon ===>>",details);    
    }else if(details.type === 'xmlhttprequest'){
        console.log("request ===>>",details);    
    }
  },{
       urls: ["<all_urls>"], types: ["xmlhttprequest", "beacon"] 
});

console.log('loaded///////////////////');
