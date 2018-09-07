
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

   function setFraudPrevention(data) {
      // Just for testing
      defaultMinCount = 10;
      defaultMinCount = 100;
      defaultDayCount = 1000;
      //end
      if(data.defaultMinCount){
        defaultMinCount = data.defaultMinCount;
      }
      if(data.defaultHourCount){
        defaultHourCount = data.defaultMinCount;
      }
      if(data.defaultDayCount){
        defaultDayCount = data.defaultDayCount;
      }
      if(!lastSyncAt){
        lastSyncAt = new Date();
        minCount = 0;
        hourCount = 0;
        dayCount = 0;
      }
   }

  setInterval(()=>{
    const currentDate = new Date();
    if(currentDate.getSeconds() === 0){
      minCount = 0;
    }
    if(currentDate.getMinutes() === 0){
      hourCount = 0;
    }
    if(currentDate.getHours() === 0){
      dayCount = 0;
    }
  },1000)

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
        console.log(error);
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
          setTNCData({ data: error.responseJSON.data.tnc.version, token}, isLogin);
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

  let domainName = GENER8_FRONTEND_URL.replace('https://','').replace('http://','');
  domainName = domainName.substring(0, domainName.length - 1);
  browser.cookies.onChanged.addListener(function(changeInfo) {
    if(changeInfo.cookie.domain === domainName && changeInfo.cookie.name === 'jwtToken' ){
      if(changeInfo.removed){
        setBadge('');
      }else{
        scheduler();
      }
    }
  });
})();
