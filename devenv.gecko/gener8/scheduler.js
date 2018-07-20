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
        console.log('scheduler api', success.data);
        browser.storage.local.set({
          isGener8On: success.data.isGener8On,
          pageWhitelist: success.data.pageWhitelist,
          userWhitelist: success.data.userWhitelist,
          token:token.value,
          user : success.data.user,
          adminWhitelist : success.data.adminWhitelist,
          userStatusCode: null,
          errorMessage: ''
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
            name: 'gnr-ext-token'
          })
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
            xhr.setRequestHeader("Authorization", token.value);
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

   browser.runtime.onMessage.addListener(function (request) {
    if (request.action === 'resetNotification') {
      setBadge('');
      browser.storage.local.set({
        'notificationCount': undefined
      });
    }
  });
})();
