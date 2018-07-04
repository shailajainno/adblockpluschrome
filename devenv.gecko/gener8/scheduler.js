(()=>{

   function setBadge(count){
    // browser.tabs.query({ }, function (tabs) {
    //   tabs.forEach((data)=>{
    //     browser.browserAction.setBadgeBackgroundColor(
    //       {
    //         color: "black",
    //         tabId: data.id
    //       }
    //     )
    //     browser.browserAction.setBadgeText({
    //       text: count.toString(),
    //       tabId: data.id
    //     });
    //   });
    // });
   }

   var scheduler = () => {
    setBadge(10);
    browser.cookies.get({
        url: GENER8_FRONTEND_URL,
        name: 'gnr-ext-token'
      }).then((t)=>{
        if(t){
            $.ajax({
              url: GENER8_BACKEND_URL + SCHEDULER,
              method: "GET",
              dataType: "json",
              crossDomain: true,
              contentType: "application/json; charset=utf-8",
              beforeSend: function (xhr) {
                  xhr.setRequestHeader("Authorization", t.value);
              },
              success: function (success) {
                browser.storage.local.set({
                    isGener8On: success.data.isGener8On,
                    pageWhitelist: success.data.pageWhitelist,
                    whitelist: success.data.whitelist,
                    token: t.value
                });
              },
              error: function (jqXHR, textStatus, errorThrown) {
                return;
              }
            });
        }else{
            console.log('Not logged in yet')
        }
      }, (e)=>{
        console.log('===>',e)
      });
   } 
   scheduler();
   setInterval(()=>{
      console.log("Sechedular start at ", new Date());
      scheduler();
   },1000 * 60 * SCHEDULER_DELAY_MIN);
})();