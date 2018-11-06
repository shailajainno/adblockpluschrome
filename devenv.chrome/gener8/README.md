1) ext/background.js : Comment setIcon lines which dynamically sets the browser icon.

2) lib/adblockplus.js : Comment all webRequest.onBeforeRequest() -> Not to block advertisments at network layer.

Add our code to block all ads except script requests, Replce iframe request with our URL.

3) lib/adblockplus.js : Send message to the content script, sending selectors for the domain. (function addStyleSheet)

4) include.preload.js : Get token and whitelist list and then proceed with getting selectors and blocking it. (getSelectors message)

5) lib/adblockplus.js : Comment install url (firstRun.html) in function addSubscriptionsAndNotifyUser.

6) lib/adblockplus.js : Comment uninstall module