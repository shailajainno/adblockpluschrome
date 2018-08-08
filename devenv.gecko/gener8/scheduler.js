
(()=>{

  function setBadge(count){
    browser.tabs.query({ }, function (tabs) {
      tabs.forEach((data)=>{
        browser.browserAction.setBadgeBackgroundColor(
          {
            color: "#d32d27",
            tabId: data.id
          }
        )
        browser.browserAction.setBadgeText({
          text: count.toString(),
          tabId: data.id
        });
      });
    });
   }

  function schedulerAPI(token, isLogin, authData){
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
        saveCookies('installed', true);
        userData = success.data.user;
        userData.walletToken = parseFloat(userData.walletToken);
        tokenRate = success.data.tokenRate;
        console.log('scheduler api', success.data);
        browser.storage.local.set({
          isGener8On: success.data.isGener8On,
          pageWhitelist: success.data.pageWhitelist,
          userWhitelist: success.data.userWhitelist,
          token,
          user : success.data.user,
          adminWhitelist : success.data.adminWhitelist,
          userStatusCode: null,
          errorMessage: ''
        });
        if(isLogin){
          success.data.user.tncAccepted = authData.tncAccepted;
          success.data.user.token = token;
          saveUserDetails(success.data.user);
        }

        success.data.adtags.forEach(tag=>{
          adTags[tag.width+'x'+tag.height] = tag.content;
        });
      },
      error: function (error) {
        browser.storage.local.set({
          userStatusCode: error.status,
          errorMessage: error.responseJSON.message
        });
        
        if(error.status === 401){
          browser.cookies.remove({
            url: GENER8_FRONTEND_URL,
            name: 'jwtToken'
          });
        }else if(error.status === 451){
          if(isLogin){
            browser.storage.local.set({
              userStatusCode: error.status,
              errorMessage: error.responseJSON.message,
              token
            });
          }
          browser.storage.local.get([
            'userStatusCode',
            'errorMessage',
            "token"]).then(t=>console.log('asdasda->',t));
          setTNCData({ data: error.responseJSON.data.tnc.version, token}, true);
        }
        return;
      }
    });
   }

   function notificationCount(token){
      $.ajax({
        url: GENER8_BACKEND_URL + NOTIFICATION+'?limit=0',
        method: "GET",
        dataType: "json",
        crossDomain: true,
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", token);
        },
        success: function (success) {
          const count = 5//success.data.total > 0 ? success.data.total: '';
          setBadge(count);
          browser.storage.local.set({notificationCount: count});
        },
        error: function (jqXHR) {
          console.log("error in notification")
          return;
        }
      });
   }

   var scheduler = () => {
    console.log("Sechedular start at ", new Date());
    browser.cookies.get({
        url: GENER8_FRONTEND_URL,
        name: 'jwtToken'
      }).then((token)=>{
        if(token){
          token = JSON.parse(token.value).body;
          token = atob(token);
          schedulerAPI(token);
          notificationCount(token);
        }else{
            console.log('Not logged in yet')
            saveCookies('installed', true);
        }
      }, (e)=>{
        console.log('===>',e)
      });
   } 
   
   setInterval(()=>{
      scheduler();
   },1000 * 60 * SCHEDULER_DELAY_MIN);
   scheduler();
   browser.runtime.onMessage.addListener(function (request) {
    if (request.action === 'resetNotification') {
      setBadge('');
      browser.storage.local.set({
        'notificationCount': undefined
      });
    }else if (request.action === 'LOGIN') {
      schedulerAPI(request.token, true, request.data);
    }
  });
})();
