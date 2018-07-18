var generExtBody = $('.gnr-ext-bdy-prt');

$(function () {
    //Check User Token whether to show Login Page or Dashboard
    generExtBody.empty();
    generExtBody.append(loader);
    getUserAccessToken(function (token) {
        if (token !== null) {
            browser.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                getUserDetails(token, extractHostname(tabs[0].url), extractLink(tabs[0].url));
            });
        } else {
            generExtBody.empty();
            generExtBody.append(loginPage);
        }
    });

    //Focus In on email
    generExtBody.on('focusin', '#emailid', function () {
        $('.gnr-error-server-msg').text('');
    });

    //Focus In on password
    generExtBody.on('focusin', '#password', function () {
        $('.gnr-error-server-msg').text('');
    });

    //Check validations on Focus Out of Email Id
    generExtBody.on('focusout', '#emailid', function () {
        let email = $('#emailid').val();
        email = email.trim();
        $('#emailid').val(email);
        emailValidation(email);
    });

    //Check validations on Focus Out of Password
    generExtBody.on('focusout', '#password', function () {
        var password = $('#password').val();
        passwordValidation(password);
    });

    //Catch Enter event after password entered
    generExtBody.on('keypress', '#password', function (event) {
        if (event.which === 13) {
            checkEmailPass();
        }
    });

    //Catch Enter event on Login button
    generExtBody.on('keypress', '.gnr-ext-login-btn', function (event) {
        if (event.which === 13) {
            checkEmailPass();
        }
    });

    //Call Login API
    generExtBody.on('click', '.gnr-ext-login-btn', function () {
        checkEmailPass();
    });

    //Copy Referral Link to the Clipboard
    generExtBody.on('click', '#gnr-copy-ref-link', function () {
        $('#gnr-ref-link').select();
        document.execCommand('copy');
        document.selection.empty();
    });

    generExtBody.on('click', '#seeMore', function () {
        browser.tabs.create({
            url: GENER8_FRONTEND_URL + '#/notifications'
        });
        window.close();
    });


    generExtBody.on('click', '.redirection', function () {
        browser.tabs.create({
            url: GENER8_FRONTEND_URL + '#/notifications/'+$(this).attr('id')
        });
        window.close();
    });

    function notificationList(token){
        console.log("-----------------sss")
        $.ajax({
            url: GENER8_BACKEND_URL + NOTIFICATION_LIST,
            method: "POST",
            dataType: "json",
            crossDomain: true,
            data: JSON.stringify({
                limit: NOTIFICATION_VIEW_LIMIT,
                filter:0,
                page:1
            }),
            contentType: "application/json; charset=utf-8",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", token.value);
            },
            success: function (success) {
                generExtBody.empty();
                generExtBody.append(notificationPage);
                console.log(success.data);
                if(success.data && success.data.notification){
                    success.data.notification.forEach((notification)=>{
                        let text = notification.message;
                        if(notification.message.length > 60){
                            text = notification.message.substring(0, 60) + '...';
                        }
                        let notificationHTML;
                        if(notification.status === 'read'){
                        notificationHTML = ` <li>
                            <a href="#" class="notification-msg" data-id="${notification._id}" data-status="${notification.status}" data-redirect="${GENER8_FRONTEND_URL+'#'+notification.actionurl}">
                                ${text}
                            </a>
                        </li>
                        `
                        }else{
                         notificationHTML = ` <li>
                            <a href="#" class="notification-msg" data-id="${notification._id}" data-status="${notification.status}" data-redirect="${GENER8_FRONTEND_URL+'#'+notification.actionurl}">
                                <b>${text}</b>
                            </a>
                        </li>`
                        }
                        $('#notificationList').append(notificationHTML);
                        browser.runtime.sendMessage({action: "resetNotification"});
                    })
                }
            },
            error: function (jqXHR) {
              console.log("error in notification")
              return;
            }
        });
    }

    generExtBody.on('click', '.notification-msg', function () {
        if($(this).attr('data-status') !== 'read'){
            browser.cookies.get({
                url: GENER8_FRONTEND_URL,
                name: 'gnr-ext-token'
              }).then((token)=>{
                $.ajax({
                    url: GENER8_BACKEND_URL + NOTIFICATION_READ,
                    method: "POST",
                    dataType: "json",
                    crossDomain: true,
                    data: JSON.stringify({
                        id: $(this).attr('data-id')
                    }),
                    contentType: "application/json; charset=utf-8",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", token.value);
                    },
                    success: ()=>{
                        openNewTab($(this).attr('data-redirect'))
                    },
                    error: ()=>{
                        openNewTab($(this).attr('data-redirect'))
                    }
                });    
              }, (e)=>{
                openNewTab($(this).attr('data-redirect'))
            });
        }else{
            openNewTab($(this).attr('data-redirect'))
        }
    });

    function openNewTab(url){
        browser.tabs.create({url});
        window.close();
    }

    generExtBody.on('change', '#check02', function () {
        browser.cookies.get({
            url: GENER8_FRONTEND_URL,
            name: 'gnr-ext-token'
          }).then((token)=>{
            if(token){
              notificationList(token);
            }else{
                console.log('Not logged in yet')
            }
          }, (e)=>{
            console.log('===>',e)
          });
    });
    
    generExtBody.on('click', '#back', function () {
        getUserAccessToken(function (token) {
            if (token !== null) {
                browser.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                    getUserDetails(token, extractHostname(tabs[0].url), extractLink(tabs[0].url));
                });
            } else {
                generExtBody.empty();
                generExtBody.append(loginPage);
            }
        });
    });           


    //Call Facebook Login API
    generExtBody.on('click', '#gnr-fbLoginBtn', function () {
        openWindow(FB_CALLBACK_URL);
    });

    //Call Twitter Login API
    $(".gnr-ext-bdy-prt").on('click', '#gnr-twLoginBtn', function () {
        openWindow(TW_CALLBACK_URL);
    });

    //Open Gener8 website
    generExtBody.on('click', '#gnr-website', function () {
        window.open(GENER8_WEBSITE);
        window.close();
    });

    //Open Forgot Password webpage
    generExtBody.on('click', '#gnr-forgot-password', function () {
        window.open(GENER8_FRONTEND_URL + FORGOT_PASS_URL);
        window.close();
    });

    //Open Signup webpage
    generExtBody.on('click', '#gnr-sign-up', function () {
        window.open(GENER8_FRONTEND_URL + SIGN_UP_URL);
        window.close();
    });

    //Open Dashboard webpage  
    generExtBody.on('click', '#gnr-dashboard', function () {
        window.open(GENER8_FRONTEND_URL + DASHBOARD);
        window.close();
    });

    //Open Wallet webpage
    generExtBody.on('click', '#gnr-wallet', function () {
        window.open(GENER8_FRONTEND_URL + WALLET);
        window.close();
    });

    function updateStorage(type, enable, hostName) {
        browser.storage.local.get([type]).then((local)=>{
            if(enable){
                 if(local[type]){
                     local[type].push(hostName);
                 }else{
                     local[type] = [hostName]
                 }
            }else{
                 if(local[type]){
                     local[type].splice(local[type].indexOf(hostName), 1);
                 }else{
                     local[type] = [];
                 }
            }
            browser.storage.local.set({
                [type]: local[type]
            })
         });
    }

    //Checkmark whitelist domain
    generExtBody.on('change', '#styled-checkbox-2', function () {
        const enable = this.checked;
        $('#styled-checkbox-1').prop( "disabled", enable );
        getUserAccessToken(function (token) {
            if (token !== null) {
                browser.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                    const hostName = extractHostname(tabs[0].url);
                    whitelistDomain('domain', hostName, token, enable, function (reload) {
                        updateStorage('userWhitelist', enable, hostName);
                        browser.tabs.reload(tabs[0].id);
                    });
                });
            }
        });
    });

    //Pause domain for one instance
    generExtBody.on('change', '#styled-checkbox-1', function () {
        const enable = this.checked;
        getUserAccessToken(function (token) {
            if (token !== null) {
                browser.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                    const hostName = extractLink(tabs[0].url);
                    whitelistDomain('page',  hostName, token, enable, function (reload) {
                        updateStorage('pageWhitelist', enable, hostName);
                        browser.tabs.reload(tabs[0].id);
                    });
                });
            }
        });
    });
});


/**
 * Open window for Social Logins
 * @author Innovify
 * @param {string} loginType
 */
function openWindow(loginType) {
    browser.runtime.sendMessage({
        action: 'openPopUpAndLogin',
        data: loginType
    });
}
/**
 * Email validation
 * @author Innovify
 * @param {string} email
 * @returns {boolean}
 */
function emailValidation(email) {
    var emailValid = false;
    if (!email) {
        $('.gnr-emailid .gnr-error-msg').text(EMAIL_IS_REQUIRED);
    } else {
        emailValid = validateEmailRegex(email);
        $('.gnr-emailid .gnr-error-msg').text(emailValid ? '' : EMAIL_NOT_VALID);
    }
    return emailValid;
}

/**
 * Password validation
 * @author Innovify
 * @param {string} password
 * @returns {boolean}
 */
function passwordValidation(password) {
    var passwordValid = false;
    if (!password) {
        $('.gnr-password .gnr-error-msg').text(PASSWORD_IS_REQUIRED);
    } else {
        $('.gnr-password .gnr-error-msg').text('');
        passwordValid = true;
    }
    return passwordValid;
}

/**
 * Regex validation for Email
 * @author Innovify
 * @param {string} email
 * @returns {boolean}
 */
function validateEmailRegex(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/**
 * Check Email and Password Validations and call API for login
 * @author Innovify
 */
function checkEmailPass() {
    var email = $('#emailid').val();
    var password = $('#password').val();

    var emailValid = emailValidation(email);
    var passwordValid = passwordValidation(password);

    if (emailValid && passwordValid) {
        generExtBody.empty();
        generExtBody.append(loader);
        ajaxCall('POST', 'application/json', LOGIN_URL, {
            'email': email,
            'password': sha256_digest(password)
        }, 'JSON', null, function (success, error) {
            if (error && error.responseJSON && error.responseJSON.message) {
                generExtBody.empty();
                generExtBody.append(loginPage);
                $('.gnr-error-server-msg').text(error.responseJSON.message);
            } else if (success && success.data) {
                browser.runtime.sendMessage({
                    action: 'saveToken',
                    data: success.data.token
                });
                browser.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                    getUserDetails(success.data.token, extractHostname(tabs[0].url),  extractLink(tabs[0].url));
                });
                //schedulerAPI(success.data.token);
            } else {
                generExtBody.empty();
                generExtBody.append(loginPage);
                throw 'Unexpected value of response';
            }
        });
    }
}

// Add listener to get user profile
browser.runtime.onMessage.addListener(function (request) {
    if (request.action === 'getUserDetails' && request.data) {
        browser.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            getUserDetails(request.data, extractHostname(tabs[0].url),  extractLink(tabs[0].url));
        });
    }
});

/**
 * This function is being used to get user details
 * @author Innovify
 * @param {string} token Access token
 * @param {string} domainName domain name
 */
function getUserDetails(token, domainName, pageName) {
    console.log("test..??")
    const localStorageKeys = ['token','isGener8On','pageWhitelist','userWhitelist','adminWhitelist','user','userStatusCode','notificationCount', 'errorMessage'];
    browser.storage.local.get(localStorageKeys).then((tokenData)=>{
        const currentToken = tokenData.token;
        if(currentToken !== token){
            console.log("not match...");
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
                    const userData = success.data;
                    browser.storage.local.set({
                        isGener8On: userData.isGener8On,
                        pageWhitelist: userData.pageWhitelist,
                        userWhitelist: userData.userWhitelist,
                        token:token,
                        user : userData.user,
                        adminWhitelist : userData.adminWhitelist,
                        userStatusCode: null,
                        errorMessage: ''
                    });
                    generExtBody.empty();
                    loadDashboard(userData, domainName, pageName);
                },
                error: function (error) {
                    browser.storage.local.set({
                        userStatusCode: error.status,
                        isGener8On: null,
                        pageWhitelist: null,
                        userWhitelist: null,
                        token:token,
                        user : null,
                        adminWhitelist : null,
                        errorMessage: error.responseJSON.message
                    });

                    switch (error.status) {
                        case 423:
                            generExtBody.append(suspendPage('Account Suspended', error.responseJSON.message));
                            browser.runtime.sendMessage({ action: 'deleteToken' });
                            break;
                        case 503:
                            generExtBody.append(suspendPage('We\'ll back soon!', error.responseJSON.message));
                            break;
                        case 401:
                            browser.runtime.sendMessage({ action: 'deleteToken' });
                            generExtBody.append(loginPage);
                            break;
                        default:
                            generExtBody.append(loginPage);
                            break;
                    }
                }
              });
        }else{
            generExtBody.empty();
            switch (tokenData.userStatusCode) {
                case 423:
                    generExtBody.append(suspendPage('Account Suspended', tokenData.errorMessage ? tokenData.errorMessage: null));
                    browser.runtime.sendMessage({ action: 'deleteToken' });
                    break;
                case 503: 
                    generExtBody.append(suspendPage('We\'ll back soon!', tokenData.errorMessage ? tokenData.errorMessage: null));
                    break;
                default:
                    loadDashboard(tokenData, domainName, pageName);
                    break;
            }
        }
    })
}

function loadDashboard(userData, domainName, pageName){
    generExtBody.append(dashboardPage);
    let isAdminWhitelisted = userData.adminWhitelist && userData.adminWhitelist.indexOf(domainName) > -1;
    let isWhitelist = userData.userWhitelist && userData.userWhitelist.indexOf(domainName) > -1;
    let isPageWhitelist = userData.pageWhitelist && userData.pageWhitelist.indexOf(pageName) > -1;
    $('#styled-checkbox-2').prop('checked', isWhitelist);
    $('#styled-checkbox-1').prop('checked', isPageWhitelist);
    $('#styled-checkbox-1').prop( "disabled", isAdminWhitelisted || isWhitelist );
    $('#styled-checkbox-2').prop( "disabled", isAdminWhitelisted);
    $('#gener8Wallet').html(userData.user ? userData.user.walletToken : 0.00);
    $('#gnr-ref-link').val(userData.user.referralLink);
    $("#currentLevel").html(userData.user.statusLevel.name);
    $('.cstatus').html(userData.user.statusLevel.startLevel);
    $('.progress').width(userData.user.statusLevel.levelPercent+'%');
    $('.nstatus').html(userData.user.statusLevel.endLevel);
    $('.gnr-status-name').append(`<img src="${userData.user.statusLevel.image}" alt="" />`);
    
    if(userData.notificationCount){
        if(!$('.gnr-noti').find('#badge').length){
            $('.gnr-noti').append(`<span id="badge"></span>`)
        }
    }else{
        $('.gnr-noti').find('#badge').remove();
    }
}

/**
 * @author Innovify
 * @description Add/Remove domain from whitelisting
 * @param {string} token
 * @param {string} domainName
 * @param {string} enable
 * @param {string} callback
 */
function whitelistDomain(key, domainName, token, enable, callback) {
    var body = {
        enable: enable,
        type: key,
        domainName: domainName
    };
    ajaxCall('POST', 'application/json', ADD_WHITELIST , body, 'JSON', token, function () {
        callback();
    });
}

/**
* This function is being used to parse domain name from URL
* @param {string} url - full url link
*/
function extractHostname(url) {

    //find & remove protocol (http, ftp, etc.) and get hostname
    var hostname  = url.indexOf('://') > -1 ? url.split('/')[2] : url.split('/')[0];

    //find & remove port number
    hostname = hostname.split(':')[0];

    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

/**
* This function is being used to parse link
* @param {string} url - full url link
*/
function extractLink(url) {
    return url.split('?')[0];
}
