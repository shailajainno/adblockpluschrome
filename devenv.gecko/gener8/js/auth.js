
// Send token to background js and close the login popup
if (document.getElementsByTagName('p')) {
    console.log('test...!!!');
    var id = document.getElementsByTagName('p').length ? document.getElementsByTagName('p')[0].id : '';
    if (id === 'authToken') {
        console.log('test...!!!', );
        const token = document.getElementById(id).innerText;
        $.ajax({
            url: GENER8_BACKEND_URL + SCHEDULER,
            method: "GET",
            dataType: "json",
            crossDomain: true,
            contentType: "application/json; charset=utf-8",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", token);
            },
            success: function (success) {
                const userData = success.data;
                userData.token = token;
                browser.runtime.sendMessage({
                    action: 'saveLoginDetails',
                    data: success.data
                }, function () {
                    window.close();
                });
            }
        });
        
    }
} else {
    window.close();
}
