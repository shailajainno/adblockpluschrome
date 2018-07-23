$(function () {
    var replaceGener8 = () => {
        var ArrayNodes = Array.prototype.slice.call($('.gener8'));
        ArrayNodes.forEach(function (node) {
            createIFrame(node);
            return;
        });
        $('img[alt=AdChoices]').remove();
    };

    function createIFrame(node){
        if(node.tagName === 'IFRAME'){
            iframe = $(node);
        }else{
            iframe = $(node).find('iframe');    
        }
        
        if(iframe.hasClass('gener8Ad')){
            return;
        }
        
        if (iframe.length === 0) {
            $(node).remove();
            return;
        }
        
        var height = $(iframe)[0].height;
        var width = $(iframe)[0].width;
        if(!height){
            height = $(iframe)[0].style.height;
            height = height ? height.replace('px', ''): '';
        }
        if(!width){
            width = $(iframe)[0].style.width;
            width = width ? width.replace('px', ''): '';
        }
        
        let currentTag = adTags[width+'x'+height];
        console.log('ad--->>>', width+'x'+height , currentTag);
        if(!currentTag){
            $(node).remove();
            return;
        };
        
        var iframeGenere = document.createElement('iframe');
        iframeGenere.height = height;
        iframeGenere.width = width;
        iframeGenere.src = 'https://s3-eu-west-1.amazonaws.com/g8-ad-tags/test.html?tag='+ adTags[width+'x'+height];
        if(height < 5 || width < 5){
            iframeGenere.src = 'https://s3-eu-west-1.amazonaws.com/g8-ad-tags/test.html';
        }
        
        console.log(iframeGenere.src);
        console.log('abdss');
        iframeGenere.scrolling = 'no';
        iframeGenere.setAttribute('class', 'gener8Ad');
        iframe.after(iframeGenere);\
        $(node).remove();
    }
    
    replaceGener8();
    var i = 0;
    setInterval(function () {
        replaceGener8();
        if(i++ && i > 5){
            clearInterval(this);
        }
    } , 2000);

    (function () {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                [].filter.call(mutation.addedNodes, function (node) {
                    return node.nodeName === 'IFRAME';
                }).forEach(function (node) {
                    node.addEventListener('load', function () {
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
        console.log('maa kaa phone aaya...', event);
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