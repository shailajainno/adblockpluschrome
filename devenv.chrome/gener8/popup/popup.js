var generExtBody = $('.gnr-ext-bdy-prt');
$(function () {
    //Check User Token whether to show Login Page or Dashboard
    generExtBody.empty();
    generExtBody.append(loader);
    getUserAccessToken(function (token) {
        if (token) {
            chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                getUserDetails(token, extractHostname(tabs[0].url), extractLink(tabs[0].url),);
            });
        } else {
            chrome.runtime.sendMessage({action: "OPEN_POPUP"});
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

    function openLoginPage () {
        $('.gnr-ext-login-smp').hide();
        $('.gnr-ext-login').show();
        $('.gnr-ext-login-fb-twt').show();
        $('.login-tab-btn').find('span').addClass('active');
        $('.signup-tab-btn').find('span').removeClass('active');
        $('#separatorText').text('Or Login with').css('width', '90px');
        $('.gnr-ext-login-wth').css('border-top','1px solid #dbdbdb' );
    }
    
    function openSignupPage () {
        $('.gnr-ext-login-smp').show();
        $('.gnr-ext-login').hide();
        $('.gnr-ext-login-fb-twt').hide();
        $('.signup-tab-btn').find('span').addClass('active');
        $('.login-tab-btn').find('span').removeClass('active'); 
        $('#separatorText').hide()
        $('.gnr-ext-login-wth').css('border-top','none');
    }

    //Call Login API
    generExtBody.on('click', '.login-tab-btn', openLoginPage);

    //Call Login API
    generExtBody.on('click', '.signup-tab-btn', openSignupPage);

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
        openNewTab(GENER8_FRONTEND_URL + '#/notifications');
    });

    generExtBody.on('click', '.hamburger', function () {
        const url = $(this).attr('id');
        switch (url) {
            case 'faq':
                openNewTab(GENER8_WEBSITE + '/faq');
                window.close();
                break;
            case 'contactus':
                openNewTab(GENER8_WEBSITE + '/contact-us');
                break;
            case 'rateus':
                openNewTab(GENER8_EXT_URL);
                break;
            default:
                break;
        }
    });

    generExtBody.on('click', '.redirection', function () {
        openNewTab(GENER8_FRONTEND_URL + '#/notifications/'+$(this).attr('id'));
    });

    generExtBody.on('click', '#tnc', function () {
        openNewTab(GENER8_FRONTEND_URL + '#/privacy?isPrivacy=true');
    });

    generExtBody.on('click', '#accept-tnc', function () {
        getUserAccessToken(function (token) {
            cookieGet('tnc', function (tnc) {
                // check tnc accepted by user paner
                if (token !== null) {
                    $.ajax({
                        url: ACCEPT_TNC,
                        method: "POST",
                        dataType: "json",
                        crossDomain: true,
                        data: JSON.stringify({
                            version: JSON.parse(tnc).body
                        }),
                        contentType: "application/json; charset=utf-8",
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("Authorization", token);
                        },
                        success: function (success) {
                            let cookieExpDate = new Date().getTime()/1000 + 365 * 24 * 60 * 60 * 100;
                            chrome.cookies.set({
                                url: GENER8_FRONTEND_URL,
                                name: 'tncAccepted',
                                value: JSON.stringify({ "opts":{},"body": true}),
                                expirationDate: Math.trunc(cookieExpDate)
                            });
                            chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                                schedulerAPI(token, extractHostname(tabs[0].url), extractLink(tabs[0].url));
                            });
                        },
                        error: function (jqXHR) {
                          console.error("error in accept tnc", jqXHR);
                          generExtBody.empty();
                          loadDashboard(userData, domainName, pageName);
                          return;
                        }
                    });
                }
            });
            
        });
    });

    function notificationList(token){
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
                xhr.setRequestHeader("Authorization", token);
            },
            success: function (success) {
                generExtBody.empty();
                generExtBody.append(notificationPage);
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
                    });
                    chrome.runtime.sendMessage({action: "resetNotification"});
                }
            },
            error: function (error) {
              requestError(error);
            }
        });
    }

    generExtBody.on('click', '.notification-msg', function () {
        if($(this).attr('data-status') !== 'read'){
            getUserAccessToken( (token) => {
                if(token){
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
                            xhr.setRequestHeader("Authorization", token);
                        },
                        success: ()=>{
                            openNewTab($(this).attr('data-redirect'))
                        },
                        error: ()=>{
                            openNewTab($(this).attr('data-redirect'))
                        }
                    });
                  }
            });
        }else{
            openNewTab($(this).attr('data-redirect'))
        }
    });

    function openNewTab(url){
        chrome.tabs.create({url});
        window.close();
    }

    generExtBody.on('change', '#check02', function () {
        generExtBody.empty();
        generExtBody.append(loader);
        getUserAccessToken(function (token) {
            if(token){
                notificationList(token);
            }
        });
    });
    
    generExtBody.on('click', '#back', function () {
        getUserAccessToken(function (token) {
            if (token !== null) {
                chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
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
        chrome.storage.local.get([type],(local)=>{
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
            chrome.storage.local.set({
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
                chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                    const hostName = extractHostname(tabs[0].url);
                    whitelistDomain('domain', hostName, token, enable, function (reload) {
                        updateStorage('userWhitelist', enable, hostName);
                        chrome.tabs.reload(tabs[0].id);
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
                chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                    const hostName = extractLink(tabs[0].url);
                    whitelistDomain('page',  hostName, token, enable, function (reload) {
                        updateStorage('pageWhitelist', enable, hostName);
                        chrome.tabs.reload(tabs[0].id);
                    });
                });
            }
        });
    });

    /**
     * Open window for Social Logins
     * @author Innovify
     * @param {string} loginType
     */
    function openWindow(loginType) {
        chrome.runtime.sendMessage({
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
                    openLoginPage();
                } else if (success && success.data) {
                    chrome.runtime.sendMessage({
                        action: 'saveLoginDetails',
                        data: success.data
                    });
                    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                        getUserDetails(success.data.token, extractHostname(tabs[0].url),  extractLink(tabs[0].url));
                    });
                    //schedulerAPI(success.data.token);
                } else {
                    generExtBody.empty();
                    generExtBody.append(loginPage);
                    openLoginPage();
                    throw 'Unexpected value of response';
                }
            });
        }
    }

    // Add listener to get user profile
    chrome.runtime.onMessage.addListener(function (request) {
        if (request.action === 'getUserDetails' && request.data) {
            chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
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
    function getUserDetails(token, domainName, pageName, cb) {
        const localStorageKeys = ['token','isGener8On','pageWhitelist','userWhitelist','adminWhitelist','user','userStatusCode','notificationCount', 'errorMessage'];        
        chrome.storage.local.get(localStorageKeys, (tokenData)=>{
            const currentToken = tokenData.token;
            if(currentToken !== token){
                schedulerAPI(token, domainName, pageName, cb);
            }else{
                generExtBody.empty();
                switch (tokenData.userStatusCode) {
                    case 423:
                        generExtBody.append(suspendPage('Account Suspended', tokenData.errorMessage ? tokenData.errorMessage: null));
                        chrome.runtime.sendMessage({ action: 'deleteToken' });
                        break;
                    case 503: 
                        generExtBody.append(suspendPage('We\'ll back soon!', tokenData.errorMessage ? tokenData.errorMessage: null));
                        break;
                    case 451:
                        cookieGet('tncAccepted', function (tnc) {
                            // check tnc accepted by user paner
                            if(tnc && JSON.parse(tnc).body){
                                schedulerAPI(token, domainName, pageName, cb);
                            }else{
                                const message = `We have updated the new T&C,
                                please accept it to continue.
                                You can read the new T&C <a href='#' id='tnc'>here</a>
                                <button class="g8-tnc" id='accept-tnc'>Accept</button>
                                `;
                                generExtBody.append(suspendPage('Please accept T&C', message));
                            }
                        });
                        break;
                    default:
                        loadDashboard(tokenData, domainName, pageName);
                        break;
                }
            }
        })
    }

    function schedulerAPI(token, domainName, pageName, cb) {
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
                userData.user.walletToken = parseFloat(userData.user.walletToken);
                chrome.storage.local.set({
                    isGener8On: userData.isGener8On,
                    pageWhitelist: userData.pageWhitelist,
                    userWhitelist: userData.userWhitelist,
                    token:token,
                    user : userData.user,
                    adminWhitelist : userData.adminWhitelist,
                    userStatusCode: null,
                    errorMessage: ''
                });

                let adTags = {};
                success.data.adtags.forEach(tag=>{
                    adTags[tag.width+'x'+tag.height] = tag.content;
                });
                userData.user.tokenRate = success.data.tokenRate;
                chrome.runtime.sendMessage({action: "SET_USERDATA", data: userData.user, adTags});
                chrome.runtime.sendMessage({
                    action: 'FRAUD_PREVENTION',
                    data: userData
                });
                generExtBody.empty();
                loadDashboard(userData, domainName, pageName);
                if(cb) cb(userData);
            },
            error: function (error) {
                chrome.storage.local.set({
                    userStatusCode: error.status,
                    isGener8On: null,
                    pageWhitelist: null,
                    userWhitelist: null,
                    token:token,
                    user : null,
                    adminWhitelist : null,
                    errorMessage: error.responseJSON.message
                });
                requestError(error);
            }
        });
    }

    function requestError(error) {
        generExtBody.empty();
        switch (error.status) {
            case 423:
                generExtBody.append(suspendPage('Account Suspended', error.responseJSON.message));
                chrome.runtime.sendMessage({ action: 'deleteToken' });
                break;
            case 503:
                generExtBody.append(suspendPage('We\'ll back soon!', error.responseJSON.message));
                break;
            case 401:
                chrome.runtime.sendMessage({ action: 'deleteToken' });
                generExtBody.append(loginPage);
                break;
            case 451:
                chrome.runtime.sendMessage({action: "SET_TNC", data: error.responseJSON.data.tnc.version});
                const message = `We have updated the new T&C,
                please accept it to continue.
                You can read the new T&C <a href='#' id='tnc'>here</a>
                <button class="g8-tnc" id='accept-tnc'>Accept</button>
                `;
                generExtBody.append(suspendPage('Please accept T&C', message));
                break;
            default:
                generExtBody.append(loginPage);
                break;
        }
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
        $('#gener8Wallet').html(userData.user ? userData.user.walletToken.toFixed(2) : '0.00');
        $('#gnr-ref-link').val(userData.user.referralLink);
        $("#currentLevel").html(userData.user.statusLevel.name);
        $('.cstatus').html(userData.user.statusLevel.startLevel);
        $('.progress').width(userData.user.statusLevel.levelPercent+'%');
        $('.nstatus').html(userData.user.statusLevel.endLevel);
        $('.gnr-status-name').append(`<img src="${userData.user.statusLevel.image}" alt="" />`);
        if(userData.notificationCount){
            var badgeWidth = userData.notificationCount < 10 ? "": 'padding: 2px;'
            if(!$('.gnr-noti').find('#badge').length){
                $('.gnr-noti').append(`<span id="badge" style="${badgeWidth}">${userData.notificationCount}</span>`)
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
        if(!url) return '';
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
        if(!url){
            return ''
        }else return url.split('?')[0];
    }
});
