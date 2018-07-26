
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


   function schedulerAPI(token){
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
        console.log(userData);
        console.log(success.data.tokenRate, typeof success.data.tokenRate);
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

        success.data.adtags.forEach(tag=>{
          console.log(tag.width+'x'+tag.height, tag.content);
          adTags[tag.width+'x'+tag.height] = tag.content;
          setTimeout(() => {
            browser.cookies.set({
              url: GENER_AD_URL,
              name: tag.width+'x'+tag.height,
              value: tag.content
            })
          }, 1000);
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
          browser.runtime.sendMessage({action: "SET_TNC", data: error.responseJSON.data.tnc.version});
        }
        return;
      }
    });
   }

   function notificationCount(token){
      $.ajax({
        url: GENER8_BACKEND_URL + NOTIFICATION_COUNT+'?limit=0',
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
          browser.storage.local.set({count});
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
})();

