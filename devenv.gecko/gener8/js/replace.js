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
            width = width ? height.replace('px', ''): '';
        }
        if(height < 5 || width < 5){
            $(node).remove();
            return;
        }

        
        let currentTag = adTags[width+'x'+height];
        console.log('test....???', height , width, currentTag);
        if(!currentTag){
            $(node).remove();
            return;
        };
        console.log('abd');
        var iframeGenere = document.createElement('iframe');
        iframeGenere.height = height;
        iframeGenere.width = width;
        console.log('abds');
        iframeGenere.src = 'https://s3-eu-west-1.amazonaws.com/g8-ad-tags/test.html?tag='+ adTags[width+'x'+height];
        console.log(iframeGenere.src);
        console.log('abdss');
        iframeGenere.scrolling = 'no';
        iframeGenere.setAttribute('class', 'gener8Ad');
        iframe.after(iframeGenere);
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
  


    // function receiveMessage(event){
    //     console.log('----test---', event);
    //     event.postMessage("replying to you beta",'*')
    // }

    // window.postMessage({d:'testr'}, '*');   

    // if (window.addEventListener) {
    // 	// For standards-compliant web browsers
    // 	window.addEventListener("message", receiveMessage, false);
    // }
    // else {
    // 	window.attachEvent("onmessage", receiveMessage);
    // }