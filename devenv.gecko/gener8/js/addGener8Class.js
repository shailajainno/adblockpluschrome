browser.runtime.sendMessage({ action: 'tokenExists' });

var currentTimeout;
var callTimeout = 0;
var newStylesheet;
// Add Gener8 class
var replaceWithGener8 = function (data) {
    if (data) {
        newStylesheet = data.replace(/{([^}]*)}/g, '');
    }
    checkWebBased();
    let i = 0;
    let inteval = setInterval(function (params) {
        checkWebBased();
        i++;
        if(i>10) clearInterval(inteval);
    },1000);
};

function checkWebBased() {
    $(newStylesheet).addClass('gener8');
    $('[id^=google_ads_iframe]').addClass('gener8');
    switch (window.location.hostname) {
        case 'www.engadget.com':
            $('iframe[id^=atwAdFrame]').addClass('gener8');
            break;
        case 'www.mirror.co.uk':
            $('.onscroll-injected-ad').addClass('gener8');
            break;
        default:
            break;
    }
}

// Listen message from Background
browser.runtime.onMessage.addListener(function (request) {
    if (request.action === 'selectors' && request.data) {
        if (currentTimeout) {
            window.clearTimeout(currentTimeout);
        }
        currentTimeout = window.setTimeout(replaceWithGener8(request.data), 3000);
    } else if (request.action === 'TokenFromBackGround') {
        location.reload();
    } else {
        throw 'Unexpected value for request action';
    }
});
