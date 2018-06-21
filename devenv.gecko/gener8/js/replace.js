$(function () {
    function dumpCSSText(element) {
        var s = '';
        var o = getComputedStyle(element);
        for (var i = 0; i < o.length; i++) {
            s += o[i] + ':' + o.getPropertyValue(o[i]) + ';';
        }
        return s;
    }

    var replaceGener8 = () => {
            var ArrayNodes = Array.prototype.slice.call($('.gener8'));
            ArrayNodes.forEach(function (node) {
                iframe = $(node).find('iframe');
                if(iframe.hasClass('gener8Ad') && iframe.attr('src')){
                    return;
                }
                iframe.src = 'https://res.cloudinary.com/djpktt9hp/image/upload/v1525686806/gen.png';
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
                
                // createIframe(iframe, node, height, width);
                return;
            });
        
    };
    // var i = 0;
    // function createIframe (iframe, node, height, width) {
    //     var iframeGenere = document.createElement('iframe');
    //     iframeGenere.height = height;
    //     iframeGenere.width = width;
    //     iframeGenere.src = 'https://res.cloudinary.com/djpktt9hp/image/upload/v1525686806/gen.png';
    //     iframeGenere.setAttribute('class', 'gener8Ad');
    //     iframeGenere.scrolling = 'no';
    //     $(iframeGenere).css('border', '1px solid red');
    //     $(node).children().remove();
    //     var iframeId = 'iframe' + (++i);
    //     var divGener8 = document.createElement('div');
    //     divGener8.setAttribute('class', 'gener8Container');
    //     divGener8.setAttribute('id', iframeId);
    //     divGener8.style = dumpCSSText(node);
    //     $(divGener8).css('display', '');
    //     $(divGener8).append(iframeGenere);
    //     $(node).after(divGener8);
    //     var parentDiv = document.getElementById(iframeId);
    //     var positionOfDiv = parentDiv.getBoundingClientRect();
    //     if(positionOfDiv.left < 0){
    //         $('#'+iframeId).children('iframe').css('float', 'right');
    //     }
    //     $(node).remove();
    // };
    
    replaceGener8();

    (function () {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                [].filter.call(mutation.addedNodes, function (node) {
                    return node.nodeName === 'IFRAME';
                }).forEach(function (node) {
                    node.addEventListener('load', function () {
                        console.log('adding new Add');
                        replaceGener8();
                    });
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    })();

    setInterval(function(){
        replaceGener8();
    }, 3000);

});
