
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

  setInterval(()=>{
    const currentDate = new Date();
    let tempDate = new Date();
    let lastSyncAtDate = new Date(lastSyncAt);
    tempDate.setMilliseconds(0);
    lastSyncAtDate.setMilliseconds(0);
    if(tempDate.setSeconds(0) !== lastSyncAtDate.setSeconds(0) || currentDate.getSeconds() === 0){
      minCount = 0;
      if(tempDate.setMinutes(0) !== lastSyncAtDate.setMinutes(0) || currentDate.getMinutes() === 0){
        hourCount = 0;
        if(tempDate.setHours(0) !== lastSyncAtDate.setHours(0) || currentDate.getHours() === 0){
          dayCount = 0;
        }
      }
      lastSyncAt = new Date().getTime();
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
        setFraudPrevention(userData);
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
        }else {
          console.log(error);
          setTimeout(() => {
            scheduler();
          }, 2000);
          return;
        }
        browser.storage.local.set({
          userStatusCode: error.status,
          errorMessage: error.responseJSON.message
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
            xhr.setRequestHeader("Authorization", token);
        },
        success: function (success) {
          const count = success.data.total > 0 ? success.data.total: '';
          setBadge(count);
          browser.storage.local.set({notificationCount: count});
        },
        error: function (jqXHR) {
          console.error("error in notification")
          return;
        }
      });
   }

   var scheduler = () => {
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
            saveCookies('installed', true);
        }
      }, (e)=>{
        console.error('scheduler API error', e)
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

  function removeBadge(changeInfo) {
    if(changeInfo.removed){
      browser.storage.local.get(['token']).then((data)=>{
        updateExtDetails(data.token, changeInfo.removed);
      });
      setBadge('');
    }else{
      updateExtDetails(atob(JSON.parse(changeInfo.cookie.value).body), changeInfo.removed);
      scheduler();
    }
  }

  function updateExtDetails(token, uninstall){
    $.ajax({
      type: 'PUT',
      url: EXT_UPDATE_INFO,
      dataType: 'json',
      headers: {
        'Authorization': token
      },
      data: {
        'browser': BROWSER_NAME,
        'action': uninstall ? 'uninstall' : 'install'
      }
    });
  }

  function changeTag(tag, preference) {
    let newTag = '';
    tag = $(tag);
    for (let i = 0; i < tag.length; i++) {
      const currentTag = tag.eq(i);
      if(currentTag.is('ins')){
        currentTag.attr('data-cp-preference', preference.preferenceString);
      }
      newTag += currentTag.prop('outerHTML');
    }
    return newTag;
  }

  function adTagsUpdate(preference) {
    for (const key in adTags) {
      if (adTags.hasOwnProperty(key)) {
        adTags[key] = changeTag(adTags[key], preference);
      }
    }
  }

  function setPreference(changeInfo) {
    if(!changeInfo.removed){
      if(changeInfo.cookie.value){
        const newPreference = JSON.parse(changeInfo.cookie.value).body;
        adTagsUpdate(newPreference);
        tokenRate = JSON.parse(changeInfo.cookie.value).body.tokenRate;
      }
    }
  }

  function setWalletToken(changeInfo) {
    if(!changeInfo.removed && changeInfo.cookie.value && userData){
        const walletAmt = parseFloat(JSON.parse(changeInfo.cookie.value).body);
        userData.walletToken = walletAmt > userData.walletToken ? walletAmt : userData.walletToken;
        browser.storage.local.set({
          user: userData
        });
    }
  }

  browser.cookies.onChanged.addListener(function(changeInfo) {
    if(changeInfo.cookie.domain === domainName ){
      switch (changeInfo.cookie.name) {
        case 'jwtToken':
          removeBadge(changeInfo);
          break;
        case 'preference':
          setPreference(changeInfo);
          break;
        case 'walletToken':
          setWalletToken(changeInfo);
          break;
        case 'tncAccepted':
          scheduler();
          break;
        default:
          break;
      }
    }
  });
  var index = 0;
  var interval = setInterval(()=>{
    if(index === 2){
      clearInterval(interval);
    }
    saveCookies('installed', true);
    index++;
  }, 3000);
})();
