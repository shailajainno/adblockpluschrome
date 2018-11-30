
var newStylesheet;
let executedStyle = 0;
var replaceGener8 = () => {
    Array.prototype.slice.call($('.gener8')).forEach(function (node) {
        try {
            if(adTagLoaded) createIFrame(node);
        } catch (error) {
            console.error('replace error',error);
        }
        return;
    });
};

function createIFrame(node){
   
    node = $(node);
    if(!replace){
        $(node).remove();
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
            $(node).remove();
        }
        return;
    }
    if(isIframe){
        node = node.parent();
        node = node.parent().addClass('gener8');
    }
    let parentDiv = iframe.parent();
    if(width > height){
        parentDiv.css('display', 'block').css('margin', '0 auto');
    }
    parentDiv.html(currentTag);
    browser.runtime.sendMessage({ action: 'AD_IMPRESSION', newAdCount: 1});
    node.css('visibility','visible');
}

// Add Gener8 class
var replaceWithGener8 = function (data) {
    if (data) {
        newStylesheet = data.replace(/{([^}]*)}/g, '');
    }
    checkWebBased();
};

function checkWebBased() {
    try {
        $(newStylesheet+',div[id^=google_ads_iframe],div[id^=my-ads],div[id^=onetag-sync-skys]').addClass('gener8');
        $('img[alt=AdChoices]').remove();
        $('ins[data-cp-preference]').removeClass('gener8');
        switch (window.location.hostname) {
            case 'www.dailymail.co.uk':
                $('#billBoard').remove();
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
                let adIframe = $('ins[data-cp-preference]');
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
                    let imageAdIframe = $('ins[data-cp-preference]').find('img[src="'+adURL+'"]')
                    if(!adIframe.length){
                        imageAdIframe = $('ins[data-cp-preference]').find('iframe').contents().find('img[src="'+adURL+'"]');
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
    } else {
        throw 'Unexpected value for request action';
    }
});

setTimeout(()=>{
    browser.runtime.sendMessage({ action: 'PAGE_LOADED'});
}, 100);

setTimeout(()=>{
    browser.runtime.sendMessage({ action: 'GET_COOKIE', key : 'disable_popup'}, (cookie)=>{
        console.log(cookie);
    } );
    $('body').prepend(`
    <div style="display: block; 
                text-align: center;
                display: flex;
                z-index:999999999;
                color: white;
                padding: 15px;
                justify-content: center;
                position: relative;
                font-size: 18px;
                background: linear-gradient(to bottom, rgba(69,177,172,1) 0%, rgba(63,129,187,1) 100%);">
            Please <a style=" cursor: pointer;display: block; text-align: center;
                            cursor: pointer;
                            display: block;
                            -webkit-text-align: center;
                            text-align: center;
                            color: blue;
                            margin-left: 3px;">Login </a> &nbsp;to earn tokens. 
            <div style="background: none;
                    border: 0;
                    position: absolute;
                    right: 0;
                    top: 50%;
                    right: 15px;
                    transform: translateY(-50%);
                    color: white;" id='closeGener8'>X</div>
    `);

    $('#closeGener8').on('click',()=>{
        browser.runtime.sendMessage({ action: 'DISABLE_POPUP'});
    });
},2000);



console.log('ttt')

