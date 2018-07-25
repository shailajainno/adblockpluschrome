
// Send token to background js and close the login popup
if (document.getElementsByTagName('p')) {
    console.log('test...!!!');
    var id = document.getElementsByTagName('p').length ? document.getElementsByTagName('p')[0].id : '';
    if (id === 'authToken') {
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
                browser.storage.local.set({
                    isGener8On: userData.isGener8On,
                    pageWhitelist: userData.pageWhitelist,
                    userWhitelist: userData.userWhitelist,
                    token,
                    user : userData.user,
                    adminWhitelist : userData.adminWhitelist,
                    userStatusCode: null,
                    errorMessage: ''
                });
                userData.token = token;
                userData.user.tncAccepted= true;
                browser.runtime.sendMessage({
                    action: 'saveLoginDetails',
                    data: userData.user
                });
                browser.runtime.sendMessage({action: "SET_USERDATA", data: userData.user});
                window.close()
            },
            error: function (error) {
                browser.storage.local.set({
                    userStatusCode: error.status,
                    isGener8On: null,
                    pageWhitelist: null,
                    userWhitelist: null,
                    token,
                    user : null,
                    adminWhitelist : null,
                    errorMessage: error.responseJSON.message
                });
                
                error.responseJSON.data.token = token;
                error.responseJSON.data.tncAccepted = false;
                browser.runtime.sendMessage({
                    action: 'saveLoginDetails',
                    data: error.responseJSON.data
                });
                console.log(JSON.stringify(error.responseJSON.data));
                browser.runtime.sendMessage({action: "SET_USERDATA", data: error.responseJSON.data});
                window.close()
            }
          });
    }
} else {
    window.close();
}
