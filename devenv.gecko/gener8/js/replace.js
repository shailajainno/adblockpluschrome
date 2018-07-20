$(function () {
    var replaceGener8 = () => {
        var ArrayNodes = Array.prototype.slice.call($('.gener8'));
        ArrayNodes.forEach(function (node) {
            createIFrame(node);
            return;
        });
        $('img[alt=AdChoices]').remove();
    };

    console.log('====>>', adTags);

    function createIFrame(node){
        if(node.tagName === 'IFRAME'){
            iframe = $(node);
        }else{
            iframe = $(node).find('iframe');    
        }
        
        if(iframe.hasClass('gener8Ad') && iframe.attr('src')){
            return;
        }
        
        if (iframe.length === 0) {
            return;
        }
        
        var height = $(iframe)[0].height;
        var width = $(iframe)[0].width;


        if(height < 5 || width < 5){
            return;
        }

        console.log('test....???', height , width);
        let currentTag = adTags[width+'x'+height];
        if(!currentTag){
            $(node).remove();
            return;
        };
        
        var iframeGenere = document.createElement('iframe');
        iframeGenere.height = height;
        iframeGenere.width = width;
        iframeGenere.src = 'https://s3-eu-west-1.amazonaws.com/g8-ad-tags/test.html?tag='+ currentTag;
        console.log(iframeGenere.src);
        iframeGenere.scrolling = 'no';
        iframeGenere.setAttribute('class', 'gener8Ad');
        iframe.after(iframeGenere);
        iframe.remove();
    }
    
    replaceGener8();
    var i = 0;
    setInterval(function () {
        replaceGener8();
        if(i++ && i > 10){
            clearInterval(this);
        }
    } , 1000);

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