var currentTimeout;
var callTimeout = 0;
var newStylesheet;
var adCounts = {};
let replaceCount = 0;
let executedStyle = 0;
var replaceGener8 = () => {
    $('ins[data-cp-preference]').removeClass('gener8');
    var ArrayNodes = Array.prototype.slice.call($('.gener8'));
    ArrayNodes.forEach(function (node) {
        try {
          if(adTagLoaded) createIFrame(node);
        } catch (error) {
            console.error('replace error',error);
        }
        return;
    });
    $('img[alt=AdChoices]').remove();
};

function createIFrame(node){
    node = $(node);
    if(!replace){
        $(node).remove();
        return;
    }

    if(node.find('.gener8').length > 0){
        return;
    }

    if(node.find('ins[data-cp-preference]').length > 0)
        return;

    const isIframe = node.prop('tagName') === 'IFRAME';
    if(isIframe){
        iframe = node;
    }else{
        iframe = node.find('iframe');
    }
    var height = iframe.height();
    var width = iframe.width();
    if(!height){
        height = iframe.style ? iframe.style.height: '';
        height = height ? height.replace('px', ''): '';
    }
    if(!width){
        width = iframe.style ? iframe.style.width: '';
        width = width ? width.replace('px', ''): '';
    }
    
    let currentTag = adTags[width+'x'+height];
    adCounts[width+'x'+height] = adCounts[width+'x'+height] ?  adCounts[width+'x'+height] + 1 : 1;
    if(!currentTag){
        if(width && height && height > 5 && width > 5){
            console.log('not supported ads....', width ,'x', height);
            $(node).remove();
        }
        return;
    }
    let parentDiv = iframe.parent();
    if(width > height){
        parentDiv.css('display', 'block').css('margin', '0 auto');
    }
    parentDiv.html(currentTag);
    node.css('visibility','visible');
}

// Add Gener8 class
var replaceWithGener8 = function (data) {
    if (data) {
        newStylesheet = data.replace(/{([^}]*)}/g, '');
        $(newStylesheet).addClass('gener8');
    }
    checkWebBased();
    if(executedStyle === 0){
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                [].filter.call(mutation.addedNodes, function (node) {
                    return node.nodeName === 'IFRAME';
                }).forEach(function (node) {
                    node.addEventListener('load', function () {
                        checkWebBased();
                        replaceGener8();
                    });
                });
            });
        });
        $( document ).ready(function() {
            observer.observe(document.body, { childList: true, subtree: true });
        });
        var i = 0;
        setInterval(function () {
            if(i++ && i < 10){
                checkWebBased();
            }
            replaceGener8();
        } , 3000);
    }
};

function addAdCount() {
    const newAdCount = $('ins[data-cp-preference]').length - replaceCount;
    replaceCount = $('ins[data-cp-preference]').length;
    if(newAdCount > 0){
        browser.runtime.sendMessage({ action: 'AD_IMPRESSION', total: replaceCount.toString(), newAdCount});
    }
}

function checkWebBased() {
    try {
        $('div[id^=google_ads_iframe]').addClass('gener8');
        $('div[id^=my-ads]').addClass('gener8');
        $(newStylesheet).addClass('gener8');
        $('div[id^=onetag-sync-skys]').addClass('gener8');
    switch (window.location.hostname) {
        case 'www.dailymail.co.uk':
            $('#billBoard').remove();
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

let adCountInterval;

// Listen message from Background
browser.runtime.onMessage.addListener(function (request) {
    if (request.action === 'selectors') {
        if(executedStyle === 0){
            setInterval(() => {
                addAdCount();
            }, 1000);
        }
        if(executedStyle < 2){
            replaceWithGener8(request.data);
            replaceGener8();
            addAdCount();
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
            console.error(adURL, 'error',e)
        }
    } else {
        throw 'Unexpected value for request action';
    }
});
