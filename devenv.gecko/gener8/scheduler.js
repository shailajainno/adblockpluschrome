
(()=>{

   function setBadge(count){
    browser.tabs.query({ }, function (tabs) {
      tabs.forEach((data)=>{
        browser.browserAction.setBadgeBackgroundColor(
          {
            color: "black",
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
        console.log('is:Lginasd------->>',isLogin);
        if(isLogin){
          console.log('------->>',success.data.user)
          success.data.user.tncAccepted = authData.tncAccepted;
          success.data.user.token = token;
          saveUserDetails(success.data.user);
        }

        success.data.adtags.forEach(tag=>{
          adTags[tag.width+'x'+tag.height] = tag.content;
          // setTimeout(() => {
          //   console.log(tag.width+'x'+tag.height, tag.content);
          //   browser.cookies.set({
          //     url: 'https://stg.gener8ads.com',
          //     name: tag.width+'x'+tag.height,
          //     value: tag.content
          //   }).then(console.log, console.error);
          // }, 500);
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
          browser.runtime.sendMessage({action: "SET_TNC", data: error.responseJSON.data.tnc.version, token});
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
          const count = success.data.total > 0 ? success.data.total: '';
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
    }
  });

  browser.runtime.onMessage.addListener(function (request) {
    console.log('tesrasdasd', request);
    if (request.action === 'LOGIN') {
      console.log('tesrasdasdasdasdsd', request);
      schedulerAPI(request.token, true, request.data);
    }
  });
})();
