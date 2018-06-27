(()=>{
   var scheduler = () => {
    browser.cookies.get({
        url: GENER8_FRONTEND_URL,
        name: 'gnr-ext-token'
      }).then((t)=>{
        if(t){
            console.log('..??',GENER8_BACKEND_URL + SCHEDULER)
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
                    whitelist: success.data.whitelist
                });
              },
              error: function (jqXHR, textStatus, errorThrown) {
                return;
              }
            });
        }else{
            console.log('===>3')
    
        }
      }, (e)=>{
        console.log('===>4',e)

      });
   } 
   scheduler();
   setInterval(()=>{
       scheduler()
   },60000)
})()