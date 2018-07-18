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
        
        var iframeGenere = document.createElement('iframe');
        iframeGenere.height = height;
        iframeGenere.width = width;
        iframeGenere.src = 'https://res.cloudinary.com/djpktt9hp/image/upload/v1525686806/gen.png';
        iframeGenere.setAttribute('class', 'gener8Ad');
        iframeGenere.scrolling = 'no';
        $(iframeGenere).css('border', '1px solid red');
        $(iframeGenere).css('background', '#78C8D5');
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
  


window.addEventListener("message", receiveMessage, true);
function receiveMessage(event, d ,a,b){
    console.log('----test---'); 
    console.log(event,d, a,b);
    if (event.origin !== "http://example.org:8080")
        return;

  // ...
}

function receiveMessage(event, d ,a,b){
    console.log('----test2---'); 
    console.log(event,d, a,b);
    if (event.origin !== "http://example.org:8080")
        return;

  // ...
}
window.attachEvent("onmessage", displayMessage2);