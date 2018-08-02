var adCounts = {
    
};
let replaceCount = 0;
$(function () {
    // let inProgress = false;
    var replaceGener8 = () => {
        var ArrayNodes = Array.prototype.slice.call($('.gener8'));
        //console.log('ads...>>', ArrayNodes.length);
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
        if(node.hasClass('gener8-added'))
            return;
        if(node.find('.gener8').length > 0){
            node.removeClass('.gener8');
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
        };
        node.addClass('gener8-added');
        node.html(currentTag);
        node.find('iframe').addClass('gener8Ad');
        replaceCount++;
        browser.runtime.sendMessage({ action: 'AD_IMPRESSION', data: replaceCount.toString(), id:  makeid()});
        
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
        replaceGener8();
        if(i++ && i > 5){
            clearInterval(interval);
        }
    } , 2000);

    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      
        for (var i = 0; i < 5; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      
        return text;
      }

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
    // browser.runtime.sendMessage({ action: 'SetBadge' });
});
  
// function receiveMessage(event){
//     if(event.data.gener8){
//         console.log('Got an event...', event);
//         replaceCount++;
//         browser.runtime.sendMessage({ action: 'AD_IMPRESSION', data: replaceCount.toString() });
        
//     }
// }

// if (window.addEventListener) {
//     // For standards-compliant web browsers
//     window.addEventListener("message", receiveMessage, false);
// }
// else {
//     window.attachEvent("onmessage", receiveMessage);
// }

// browser.runtime.onMessage.addListener(function(request, sender, sendResponse){
//     console.log('1--->>',request.id);
//     // if(data.action === 'checkIframe'){
//         // return new Promise(resolve=>{
//         //     console.log('content script data', JSON.stringify(data));
//         //     console.log('--->>', $('.gener8-added > iframe[src='+data.url+']'));
//         //     return resolve();
//         // })

//         return Promise.resolve({type: "test", a: 'test'});
        
//     // }
// });

