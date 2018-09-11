var adCounts = {
    
};
let replaceCount = 0;
$(function () {
    // let inProgress = false;
    var replaceGener8 = () => {
        var ArrayNodes = Array.prototype.slice.call($('.gener8'));
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
        if(!replace){
            $(node).remove();
            return;
        }
        if(node.hasClass('gener8-added'))
            return;

        if(node.find('inv[gener8-tag]').length > 0)
            return;
        
            
        if(node.tagName === 'IFRAME'){
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
            if(width && height)
                console.log(adTags.length, 'Not Supported this', width+'x'+height)
            return;
        }
        node.addClass('gener8-added');
        node.html(currentTag);
        node.find('iframe').addClass('gener8Ad');
        // var iframeGener8 = document.createElement('iframe');
        // iframeGener8.height = height;
        // iframeGener8.width = width;
        // iframeGener8.setAttribute('class', 'gener8Ad');
        // iframeGener8.src = GENER8_AD_URL +'?size='+width+'x'+height;
        // console.log(iframeGener8.src);
        // iframeGener8.style = 'border:2px;border-color:red;';
        // iframeGener8.scrolling = 'no';
        // iframe.after(iframeGener8);
        // $(node).remove();
    }
    
    
    
    replaceGener8();
    var i = 0;
    var interval = setInterval(function () {
        const newAdCount = $('.gener8-added ins').length - replaceCount;
        replaceCount = $('.gener8-added ins').length;
        console.log('new count', newAdCount, 'final count', replaceCount);
        if(newAdCount > 0){
            browser.runtime.sendMessage({ action: 'AD_IMPRESSION', data: replaceCount.toString(), newAdCount});
        }
        replaceGener8();
    } , 3000);

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
});
