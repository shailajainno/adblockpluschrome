
var body = document.getElementsByTagName('body')[0].innerHTML;
try {
    body = JSON.parse(body);
    document.getElementsByTagName('body')[0].innerHTML = `
    <style>
    .loader {
        border: 16px solid #f3f3f3; /* Light grey */
        border-top: 16px solid #3498db; /* Blue */
        border-radius: 50%;
        width: 100px;
        height: 100px;
        animation: spin 2s linear infinite;
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 1;
        margin: -50px 0 0 -50px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    </style>
    <div class="loader"></div>`
    if(body.status === 1){
        schedulerAPI(body.data.token);
    }
    
} catch (error) {
    console.log(error);
}

/**
 * Call scheduler API
 * @param {token} token 
 */
function schedulerAPI(token) {
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
            window.close();
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

              if(error.status === 401){
                browser.cookies.remove({
                  url: GENER8_FRONTEND_URL,
                  name: 'jwtToken'
                });
              }else if(error.status === 451){
                browser.runtime.sendMessage({action: "SET_TNC", data: error.responseJSON.data.tnc.version});
              }
            console.log(JSON.stringify(error.responseJSON.data));
            browser.runtime.sendMessage({action: "SET_USERDATA", data: error.responseJSON.data});
            window.close();
        }
      });
}
