browser.runtime.sendMessage({ action: 'tokenExists' });

var currentTimeout;
var callTimeout = 0;

// Add Gener8 class
var replaceWithGener8 = function (data) {
    if (data) {
        var newStylesheet = data.replace(/{([^}]*)}/g, '');
        $(newStylesheet).addClass('gener8');
    }
    checkWebBased();
};

function checkWebBased() {
    switch (window.location.hostname) {
        case 'www.engadget.com':
            var i = 0;
            $('iframe[id^=atwAdFrame]').addClass('gener8');
            var timeout = setInterval(()=>{
                $('iframe[id^=atwAdFrame]').addClass('gener8');
                i++;
                if(i > 4){
                    clearInterval(timeout);
                }
            }, 3000)
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
