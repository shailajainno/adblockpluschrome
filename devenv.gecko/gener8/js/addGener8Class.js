var $$ = $.noConflict();
var newStylesheet;
let executedStyle = 0;
var replaceGener8 = () => {
    Array.prototype.slice.call($$('.gener8')).forEach(function (node) {
        try {
            if(adTagLoaded) createIFrame(node);
        } catch (error) {
            console.error('replace error',error);
        }
        return;
    });
};

function createIFrame(node){
    node = $$(node);
    if(!replace){
        $$(node).remove();
        return;
    }

    if(node.find('.gener8,ins[data-cp-preference]').length > 0){
        return;
    }

    const isIframe = node.prop('tagName') === 'IFRAME';
    iframe = isIframe ? node : node.find('iframe');
    let height = iframe.height();
    let width = iframe.width();
    if(!height){
        height = iframe.style ? iframe.style.height: '';
        height = height ? height.replace('px', ''): '';
    }
    if(!width){
        width = iframe.style ? iframe.style.width: '';
        width = width ? width.replace('px', ''): '';
    }
    
    let currentTag = adTags[width+'x'+height];
    if(!currentTag){
        if(width && height && height > 5 && width > 5){
            $$(node).remove();
        }
        return;
    }
    if(isIframe){
        node = node.parent();
        node = node.parent().addClass('gener8');
    }
    let parentDiv = iframe.parent();
    console.log(width,'x',height);
    if(width > 500 && width > height){
        parentDiv.css('display', 'block').css('margin', '0 auto').css('width','50%');
    }
    parentDiv.html(currentTag);
    browser.runtime.sendMessage({ action: 'AD_IMPRESSION', newAdCount: 1});
    node.css('visibility','visible');
}

// Add Gener8 class
var replaceWithGener8 = function (data) {
    if (data) {
        newStylesheet = data.replace(/{([^}]*)}/g, '');
        $$(newStylesheet).addClass('gener8');
    }
    checkWebBased();
};

function checkWebBased() {
    try {
        $$(newStylesheet+',div[id^=google_ads_iframe],div[id^=my-ads],div[id^=onetag-sync-skys]').addClass('gener8');
        $$('img[alt=AdChoices]').remove();
        $$('ins[data-cp-preference]').removeClass('gener8');
        switch (window.location.hostname) {
            case 'www.dailymail.co.uk':
                $$('#billBoard').remove();
                break;
            case 'www.mirror.co.uk':
                $$('div.onscroll-injected-ad').addClass('gener8');
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
    if (request.action === 'selectors') {
        if(executedStyle < 2){
            replaceWithGener8(request.data);
            replaceGener8();
        }
        executedStyle++;
    } else if (request.action === 'TokenFromBackGround') {
        location.reload();
    } else if (request.action === 'GetFrame') {
        try{
            return new Promise((resolve)=>{
                let blockRequest = false;
                const adURL = request.details.url;
                let adIframe = $$('ins[data-cp-preference]');
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
                    let imageAdIframe = $$('ins[data-cp-preference]').find('img[src="'+adURL+'"]')
                    if(!adIframe.length){
                        imageAdIframe = $$('ins[data-cp-preference]').find('iframe').contents().find('img[src="'+adURL+'"]');
                    }
                    blockRequest = imageAdIframe.length === 0;
                }
                resolve({cancel: blockRequest});
                return;
            })
        }catch(e){
            console.error(adURL, 'error',e)
        }
    } else if(request.action === 'OBSERV_ADS') {
        if(executedStyle > 0){
            checkWebBased();
            replaceGener8();
        }
        
    } else if(request.action === 'CLOSE_NOTIFY_POPUP') {
        $('#gener8-popup-overlay').hide();
    } else {
        throw 'Unexpected value for request action';
    }
});

setTimeout(()=>{
    browser.runtime.sendMessage({ action: 'PAGE_LOADED'});
}, 100);

if(window.location.href.indexOf(GENER8_FRONTEND_URL) === -1){
    browser.runtime.sendMessage({ action: 'CHECK_LOG_IN', key : 'popupDisabled'}, (showPopUp)=>{
        if(showPopUp){
            $$( document ).ready(function() {
                setTimeout(()=>{
                    openPopUp();
                },1000);
            });
        }
    });
}

function openPopUp() {
    let imageURL = chrome.runtime.getURL('gener8/img/logo.svg');
    let smallLogo = chrome.runtime.getURL('gener8/img/icon38.png');
    let closeURL = chrome.runtime.getURL('gener8/img/close.svg');
    $('body').prepend(`
        <div id="gener8-popup-overlay" style="all:initial;display:block;box-sizing:border-box;font-family: 'Metropolis-Regular';
        color:#666666;
        position: fixed;
        background: #ffffff;
        border: 1px solid #9e9e9e;
        max-width: 370px;
        right: 5%;
        top: 0;
        display: none;
        border-radius: 6px;
        width: 100%;
        box-shadow: 0px 2px 10px rgba(0,0,0,0.4);
        z-index: 99999999999;">
            <!--Creates the popup content-->
            <div class="popup-content">
                <div class="gener8-title" style="all:initial; display:block;position: relative;
                text-align: left;
                padding: 5px;
                border-radius:6px 6px 0px 0px;
                color: white;
                background: linear-gradient(to bottom, rgba(69,177,172,1) 0%, rgba(63,129,187,1) 100%);">
                <img class="loginGener8" src="${imageURL}" alt="Gener8" style="all: initial;width:100px;cursor: pointer;display: block;" />
                    <div id="closeGener8" style="all: initial;position: absolute;right: 10px;top: 50%;transform: translateY(-50%);cursor: pointer;" >
                        <img src="${closeURL}" style="all: initial;width:15px;" alt="close">
                    </div>
                </div>
                <div style="all: initial;display:block;padding: 15px 45px 10px 10px;text-align: left;font-family: Metropolis-Regular;">
                    <p style="all: initial; margin: 0 0 10px; font-size: 14px; line-height: 1.1; text-align: left; font-family: Metropolis-Regular;display:block;">We noticed that you're not logged in.</p>
                    <p style="all: initial; margin: 0 0 10px; font-size: 14px; line-height: 1.1; text-align: left; font-family: Metropolis-Regular;display:block;">Click on the Gener8 icon in your browser to earn from the ads you see</p> 
                    <img src="${smallLogo}" class="loginGener8" alt="Gener8" style="all: initial;position: absolute;right: 10px;bottom: 10px;width: 30px;cursor: pointer;" />
                </div>
            </div>
        </div>
    `);
    $('#gener8-popup-overlay').slideDown();
    $('#closeGener8').on('click',()=>{
        $('#gener8-popup-overlay').slideUp();
        browser.runtime.sendMessage({ action: 'DISABLE_POPUP'});
    });

    $('.loginGener8').on('click', function () {
        window.location.href = GENER8_FRONTEND_URL;
    });
}