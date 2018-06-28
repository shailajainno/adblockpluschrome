browser.runtime.sendMessage({ action: 'tokenExists' });

var currentTimeout;
var callTimeout = 0;

// Add Gener8 class
var replaceWithGener8 = function (data) {
    return function () {
        if (data) {
            var newStylesheet = data.replace(/{([^}]*)}/g, '');
            $(newStylesheet).addClass('gener8');
            $('div[id*=google_ads_iframe]').addClass('gener8');
        }
        checkWebBased('iframe[id^=atwAdFrame]');
    };
};

function checkWebBased(regex) {
    if(window.location.hostname === 'www.engadget.com'){
        var i = 0;
        $('iframe[id^=atwAdFrame]').addClass('gener8');
        var timeout = setInterval(()=>{
            $('iframe[id^=atwAdFrame]').addClass('gener8');
            i++;
            if(i > 10){
                clearInterval(timeout);
            }
        }, 3000)
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
