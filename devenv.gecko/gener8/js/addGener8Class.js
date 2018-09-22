// browser.runtime.sendMessage({ action: 'tokenExists' });

var currentTimeout;
var callTimeout = 0;
var newStylesheet;
// Add Gener8 class
var replaceWithGener8 = function (data) {
    if (data) {
        newStylesheet = data.replace(/{([^}]*)}/g, '');
        $(newStylesheet).addClass('gener8');
    }
    checkWebBased();
    if(executedStyle < 2){
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                [].filter.call(mutation.addedNodes, function (node) {
                    return node.nodeName === 'IFRAME';
                }).forEach(function (node) {
                    node.addEventListener('load', function () {
                        checkWebBased();
                    });
                });
            });
        });
        $( document ).ready(function() {
            observer.observe(document.body, { childList: true, subtree: true });
        });
        var i = 0;
        var addClassInterval = setInterval(function () {
            checkWebBased();
            if(i++ && i > 5){
                clearInterval(addClassInterval);
            }
        } , 3000);
    }
};

function checkWebBased() {
    try {
        $('div[id^=google_ads_iframe]').addClass('gener8');
        $('div[id^=my-ads]').addClass('gener8');
        $(newStylesheet).addClass('gener8');
    switch (window.location.hostname) {
        case 'www.engadget.com':
            //$('iframe[id^=atwAdFrame]').addClass('gener8');
            break;
        case 'www.mirror.co.uk':
            $('div.onscroll-injected-ad').addClass('gener8');
            break;
        default:
            break;
    }
    } catch (error) {
     console.error( error);   
    }
}
let executedStyle = 0;
// Listen message from Background
browser.runtime.onMessage.addListener(function (request) {
    if (request.action === 'selectors') {
        if(executedStyle < 2){
            replaceWithGener8(request.data);
            executedStyle++;
        }
    } else if (request.action === 'TokenFromBackGround') {
        location.reload();
    } else if (request.action === 'GetFrame') {
        try{
            return new Promise((resolve)=>{
                let blockRequest = false;
                const adURL = request.details.url;
                let adIframe = $('.gener8-added');
                if(adIframe && adIframe.length){
                    if(adIframe.find('iframe').length){
                        adIframe = adIframe.contents().find('iframe[src="'+adURL+'"]')
                    }
                }else{
                    resolve({cancel: true});
                    return 
                }
                blockRequest = adIframe && adIframe.length === 0;
                if(blockRequest && request.details.type === 'image'){
                    if(adURL.match(/\.(jpeg|jpg|gif|png)$/) !== null){
                        resolve({cancel: false})
                        return;
                    }
                    let imageAdIframe = $('.gener8-added').find('img[src="'+adURL+'"]')
                    if(!adIframe.length){
                        imageAdIframe = $('.gener8-added').find('iframe').contents().find('img[src="'+adURL+'"]');
                    }
                    blockRequest = imageAdIframe.length === 0;
                }
                resolve({cancel: blockRequest});
                return;
            })
        }catch(e){
            console.log(adURL, 'error',e)
        }
    } else {
        throw 'Unexpected value for request action';
    }
});
