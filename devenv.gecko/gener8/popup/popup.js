$(function () {
    //Check User Token whether to show Login Page or Dashboard
    getUserAccessToken(function (token) {
        if (token !== null) {
            browser.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                getUserDetails(token, extractHostname(tabs[0].url));
            });
        } else {
            $('.gnr-ext-bdy-prt').append(loginPage);
        }
    });

    //Focus In on email
    $(".gnr-ext-bdy-prt").on('focusin', '#emailid', function () {
        $('.gnr-error-server-msg').text('');
    });

    //Focus In on password
    $(".gnr-ext-bdy-prt").on('focusin', '#password', function () {
        $('.gnr-error-server-msg').text('');
    });

    //Check validations on Focus Out of Email Id
    $(".gnr-ext-bdy-prt").on('focusout', '#emailid', function () {
        var email = $('#emailid').val();
        emailValidation(email);
    });

    //Check validations on Focus Out of Password
    $(".gnr-ext-bdy-prt").on('focusout', '#password', function () {
        var password = $('#password').val();
        passwordValidation(password);
    });

    //Catch Enter event after password entered
    $(".gnr-ext-bdy-prt").on('keypress', '#password', function (event) {
        if (event.which === 13) {
            checkEmailPass();
        }
    });

    //Catch Enter event on Login button
    $(".gnr-ext-bdy-prt").on('keypress', '.gnr-ext-login-btn', function (event) {
        if (event.which === 13) {
            checkEmailPass();
        }
    });

    //Call Login API  
    $(".gnr-ext-bdy-prt").on('click', '.gnr-ext-login-btn', function () {
        checkEmailPass();
    });

    //Copy Referral Link to the Clipboard
    $(".gnr-ext-bdy-prt").on("click", "#gnr-copy-ref-link", function () {
        $('#gnr-ref-link').select();
        document.execCommand('copy');
        document.selection.empty();
    });

    //Call Facebook Login API
    $(".gnr-ext-bdy-prt").on('click', '#gnr-fbLoginBtn', function () {
        openWindow(FB_CALLBACK_URL);
    });

    //Call Twitter Login API
    // $(".gnr-ext-bdy-prt").on('click', '#gnr-twLoginBtn', function () {
    //     openWindow(TW_CALLBACK_URL);
    // });

    //Open Gener8 website 
    $(".gnr-ext-bdy-prt").on('click', '#gnr-website', function () {
        window.close();
        window.open(GENER8_WEBSITE);
    });

    //Open Forgot Password webpage 
    $(".gnr-ext-bdy-prt").on('click', '#gnr-forgot-password', function () {
        window.close();
        window.open(GENER8_FRONTEND_URL + FORGOT_PASS_URL);
    });

    //Open Signup webpage 
    $(".gnr-ext-bdy-prt").on('click', '#gnr-sign-up', function () {
        window.close();
        window.open(GENER8_FRONTEND_URL + SIGN_UP_URL);
    });

    //Open Dashboard webpage
    $(".gnr-ext-bdy-prt").on('click', '#gnr-dashboard', function () {
        window.close();
        window.open(GENER8_FRONTEND_URL + DASHBOARD);
    });

    //Open Wallet webpage 
    $(".gnr-ext-bdy-prt").on('click', '#gnr-wallet', function () {
        window.close();
        window.open(GENER8_FRONTEND_URL + WALLET);
    });

    //Checkmark whitelist domain
    $(".gnr-ext-bdy-prt").on('change', '#styled-checkbox-2', function () {
        let enable = this.checked;
        getUserAccessToken(function (token) {
            if (token !== null) {
                browser.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                    whitelistDomain(extractHostname(tabs[0].url), token, enable, function () {
                        browser.tabs.reload(tabs[0].id);
                    });
                });
            }
        });
    });

    //Pause domain for one instance
    $(".gnr-ext-bdy-prt").on('change', '#styled-checkbox-1', function () {
        let enable = this.checked;
        getUserAccessToken(function (token) {
            if (token !== null) {
                browser.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                    browser.tabs.reload(tabs[0].id);
                });
            }
        });
    });
});

/**
 * @description Open window for Social Logins 
 * @param {string} loginType
 * @returns {string} loginName
 */
function openWindow(loginType) {
    browser.runtime.sendMessage({
        action: 'openPopUpAndLogin',
        data: loginType
    }, function () { });
}
/**
 * @description show error messages for EmailId
 * @param {string} email
 * @returns {boolean} 
 */
function emailValidation(email) {
    var emailValid = false;
    if (!email) {
        $('.gnr-emailid .gnr-error-msg').text(EMAIL_IS_REQUIRED);
    } else {
        var test = validateEmailRegex(email);
        if (!test) {
            $('.gnr-emailid .gnr-error-msg').text(EMAIL_NOT_VALID);
        } else {
            $('.gnr-emailid .gnr-error-msg').text("");
            emailValid = true;
        }
    }
    return emailValid;
}

/**
 * @description show error messages for Password
 * @param {string} password
 * @returns {boolean} 
 */
function passwordValidation(password) {
    var passwordValid = false;
    if (!password) {
        $('.gnr-password .gnr-error-msg').text(PASSWORD_IS_REQUIRED);
    } else {
        $('.gnr-password .gnr-error-msg').text("");
        passwordValid = true;
    }
    return passwordValid;
}

/**
 * @description validate Email Address
 * @param {string} email
 * @returns {boolean} 
 */
function validateEmailRegex(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/**
 * @description Check Email and Password Validations and call API for login
 */
function checkEmailPass() {
    var email = $('#emailid').val();
    var password = $('#password').val();

    var emailValid = emailValidation(email);
    var passwordValid = passwordValidation(password);

    if (emailValid && passwordValid) {
        ajaxCall("POST", "application/json", LOGIN_URL, {
            "email": email,
            "password": sha256_digest(password)
        }, "JSON", null, function (success, error) {
            if (error && error.responseJSON && error.responseJSON.message) {
                $('.gnr-error-server-msg').text(error.responseJSON.message);
            } else if (success && success.data) {
                browser.runtime.sendMessage({
                    action: 'saveToken',
                    data: success.data.token
                });
            }
        });
    }
}


browser.runtime.onMessage.addListener(function (request, sender) {
    if (request.action === 'getUserDetails' && request.data) {
        browser.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            getUserDetails(request.data, extractHostname(tabs[0].url));
        });
    }
});

/**
 * @description Get User Details 
 * @param {string} token
 */
function getUserDetails(token, domainName) {
    ajaxCall("GET", "application/json", USER_DETAILS, null, "JSON", token, function (success, error) {
        $('.gnr-ext-bdy-prt').empty();
        $('.gnr-ext-bdy-prt').append(dashboardPage);
        if (success && success.data) {
            $('#gnr-ref-link').val(success.data.referralLink);
            //Checkbox check for whitelisting 
        }
    });
}

/**
 * @description Add/Remove domain from whitelisting 
 * @param {string} token
 */
function whitelistDomain(domainName, token, enable, callback) {
    ajaxCall("POST", "application/json", ADD_WHITELIST, { "domainName": domainName, "enable": enable }, "JSON", token, function (success, error) {
        callback();
    });
}

/**
* @description its used to convert full website name to just name
* @param {string} url - full url link
*/
function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname
    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }
    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];
    return hostname;
}