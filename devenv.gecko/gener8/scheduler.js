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
          xhr.setRequestHeader("Authorization", token.value);
      },
      success: function (success) {
        browser.storage.local.set({
          isGener8On: success.data.isGener8On,
          pageWhitelist: success.data.pageWhitelist,
          userWhitelist: success.data.userWhitelist,
          token:token,
          user : success.data.user,
          adminWhitelist : success.data.adminWhitelist,
          userStatusCode: null
        });
      },
      error: function (error) {
        browser.storage.local.set({
          'userStatusCode': error.status
        });
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
            xhr.setRequestHeader("Authorization", token.value);
        },
        success: function (success) {
          const notificationCount = success.data.total > 0 ? success.data.total: '';
          setBadge(notificationCount);
          browser.storage.local.set({
            'notificationCount': notificationCount
          });
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
        name: 'gnr-ext-token'
      }).then((token)=>{
        if(token){
          schedulerAPI(token);
          notificationCount(token);
        }else{
            console.log('Not logged in yet')
        }
      }, (e)=>{
        console.log('===>',e)
      });
   } 
   scheduler();
   setInterval(()=>{
      scheduler();
   },1000 * 60 * SCHEDULER_DELAY_MIN);
})();