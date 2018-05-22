browser.runtime.sendMessage({ action: 'tokenExists' });

var currentTimeout;
var callTimeout = 0;

// Add Gener8 class
var replaceWithGener8 = function (data) {
    return function () {
        var arrayLength = data.split(',').length;
        if (data) {
            var newStylesheet = data.replace(/{([^}]*)}/g, '');
            $(newStylesheet).addClass('gener8');
        }
    }
};

// Listen message from Background
browser.runtime.onMessage.addListener(function (request, sender) {
    if (request.action === 'selectors' && request.data) {
        if (currentTimeout) {
            window.clearTimeout(currentTimeout);
        }
        currentTimeout = window.setTimeout(replaceWithGener8(request.data), 3000);
    } else if (request.action === 'TokenFromBackGround') {
        location.reload();
    } else {
        throw "Unexpected value for request action";
    }
});
