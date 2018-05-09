$(function () {
    console.log("REPLACE");
    setTimeout(function () {
        var getAdTags = document.querySelectorAll('.gener8');
        var arrayIframes = [];
        var ArrayNodes = Array.prototype.slice.call(getAdTags);
        ArrayNodes.forEach(function (node, index) {
            var iframe = $(node).find('iframe');
            var iframeNode = Array.prototype.slice.call(iframe);
            if (iframeNode.length !== 0) {
                var iframeGenere = document.createElement("iframe");
                console.log($(iframe)[0], "$iframe");
                console.log($(iframe)[0].height);
                console.log($(iframe)[0].width);
                iframeGenere.height = $(iframe)[0].height;
                iframeGenere.width = $(iframe)[0].width;
                // iframeGenere.height = 'auto';
                // iframeGenere.width = 'auto';
                iframeGenere.src = "https://res.cloudinary.com/djpktt9hp/image/upload/v1525686806/gen.png";
                iframeGenere.setAttribute('name', 'gener8');
                iframeGenere.scrolling = "no";
                $(iframeGenere).css('border', '1px solid red');
                arrayIframes.push(iframeGenere);
                $(iframe).remove();
            } else {
                arrayIframes.push('<iframe style="border:1px solid red;" width="auto" height="auto" src="https://res.cloudinary.com/djpktt9hp/image/upload/v1525686806/gen.png"></iframe>');
            }
        });
        $('.gener8').children().remove();

        var getParentAdTags = document.querySelectorAll('.gener8');
        var ArrayNodesParent = Array.prototype.slice.call(getParentAdTags);
        ArrayNodesParent.forEach(function (node, index) {
            var divGener8 = document.createElement("div");
            divGener8.setAttribute('name', 'gener8Container');
            $('divGener8').css('height', $('node').height() + 'px');
            $('divGener8').css('width', $('node').width() + 'px');
            $('divGener8').css('border', '1px solid red');
            $(divGener8).append(arrayIframes[index]);
            console.log("divGener8", divGener8);
            $(node).after(divGener8);
            // $(node).remove();
        });
    }, 4000);
});