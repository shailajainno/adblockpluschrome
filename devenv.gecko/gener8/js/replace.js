$(function () {
    let currentTimeout;
    function dumpCSSText(element) {
        var s = '';
        var o = getComputedStyle(element);
        for (var i = 0; i < o.length; i++) {
            s += o[i] + ':' + o.getPropertyValue(o[i]) + ';';
        }
        return s;
    }

    var replaceGener8 = () => {
        if (currentTimeout) clearTimeout(currentTimeout);
        currentTimeout = setTimeout(function () {
            var ArrayNodes = Array.prototype.slice.call($('.gener8'));
            ArrayNodes.forEach(function (node) {
                var iframe = $(node).find('iframe');
                if (iframe.length !== 0) {
                    var iframeGenere = document.createElement('iframe');
                    iframeGenere.height = $(iframe)[0].height;
                    iframeGenere.width = $(iframe)[0].width;
                    iframeGenere.src = 'https://res.cloudinary.com/djpktt9hp/image/upload/v1525686806/gen.png';
                    iframeGenere.setAttribute('class', 'gener8Ad');
                    iframeGenere.scrolling = 'no';
                    $(iframeGenere).css('border', '1px solid red');
                    $(node).children().remove();

                    var divGener8 = document.createElement('div');
                    divGener8.setAttribute('class', 'gener8Container');
                    divGener8.style = dumpCSSText(node);
                    $(divGener8).css('display', '');
                    $(divGener8).append(iframeGenere);
                    $(node).after(divGener8);
                    $(node).remove();
                }
            });
        }, 2000);
    };
    
    replaceGener8();

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
});
