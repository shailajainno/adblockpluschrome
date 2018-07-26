var adCounts = {
    
};
$(function () {
    // let inProgress = false;
    var replaceGener8 = () => {
        console.log('current status:--->>', adCounts);
        var ArrayNodes = Array.prototype.slice.call($('.gener8'));
        console.log('ads...>>', ArrayNodes.length);
        ArrayNodes.forEach(function (node) {
            try {
                if(adTagLoaded) createIFrame(node);
            } catch (error) {
                console.log('replace error',error);
            }
            return;
        });
        $('img[alt=AdChoices]').remove();
    };

    function createIFrame(node){
        node = $(node);
        if(node.find('.gener8').length > 0){
            return;
        }
        if(node.tagName === 'IFRAME'){
            iframe = node;
        }else{
            iframe = node.find('iframe');
        }

        if(iframe.hasClass('gener8Ad')){
            console.log('Already done.');
            return;
        }
        
        if (iframe.length === 0) {
            node.find('img').remove();
            return;
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
            if(width && height)
                console.log(adTags.length, 'Not Supported this', width+'x'+height)
            node.remove();
            return;
        };
        
        var iframeGener8 = document.createElement('iframe');
        iframeGener8.height = height;
        iframeGener8.width = width;
        iframeGener8.setAttribute('class', 'gener8Ad');
        iframeGener8.src = 'https://s3-eu-west-1.amazonaws.com/g8-ad-tags/test.html?size='+width+'x'+height;
        console.log(iframeGener8.src);
        iframeGener8.style = 'border:2px;border-color:red;';
        iframeGener8.scrolling = 'no';
        iframe.after(iframeGener8);
        $(iframe).remove();
    }
    
    replaceGener8();
    var i = 0;
    var interval = setInterval(function () {
        replaceGener8();
        if(i++ && i > 5){
            clearInterval(interval);
        }
    } , 2000);

    (function () {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                [].filter.call(mutation.addedNodes, function (node) {
                    return node.nodeName === 'IFRAME';
                }).forEach(function (node) {
                    node.addEventListener('load', function () {
                        console.log('Mutation object');
                        replaceGener8();
                    });
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    })();
    browser.runtime.sendMessage({ action: 'SetBadge' });
});
  
function receiveMessage(event){
    if(event.data.gener8){
        console.log('Got an event...', event);
        browser.runtime.sendMessage({ action: 'AD_IMPRESSION' });
    }
}

if (window.addEventListener) {
    // For standards-compliant web browsers
    window.addEventListener("message", receiveMessage, false);
}
else {
    window.attachEvent("onmessage", receiveMessage);
}
