browser.runtime.sendMessage({ action: 'tokenExists' });

var currentTimeout;
var callTimeout = 0;
var newStylesheet;
// Add Gener8 class
var replaceWithGener8 = function (data) {
    console.debug('Adding Mark to replace.')
    if (data) {
        newStylesheet = data.replace(/{([^}]*)}/g, '');
        console.debug(newStylesheet);
        $(newStylesheet).addClass('gener8');
    }
    checkWebBased();
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
    } , 2000);
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

// Listen message from Background
browser.runtime.onMessage.addListener(function (request) {
    if (request.action === 'selectors' && request.data) {
        if (currentTimeout) {
            window.clearTimeout(currentTimeout);
        }
        console.log('Actually I\'m working', request.data);
        currentTimeout = window.setTimeout(replaceWithGener8(request.data), 3000);
    } else if (request.action === 'TokenFromBackGround') {
        location.reload();
    } else {
        throw 'Unexpected value for request action';
    }
});
