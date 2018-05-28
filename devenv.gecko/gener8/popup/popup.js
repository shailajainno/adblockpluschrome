var generExtBody = $('.gnr-ext-bdy-prt');

$(function () {
    //Check User Token whether to show Login Page or Dashboard
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

    //Call Facebook Login API
    generExtBody.on('click', '#gnr-fbLoginBtn', function () {
        openWindow(FB_CALLBACK_URL);
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

    //Checkmark whitelist domain
    generExtBody.on('change', '#styled-checkbox-2', function () {
        const enable = this.checked;
        $('#styled-checkbox-1').prop( "disabled", enable );
        getUserAccessToken(function (token) {
            if (token !== null) {
                browser.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                    whitelistDomain('domain', extractHostname(tabs[0].url), token, enable, function (reload) {
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
                    whitelistDomain('page', extractLink(tabs[0].url), token, enable, function (reload) {
                        browser.tabs.reload(tabs[0].id);
                    });
                });
            }
        });
    });
});

function addWhitelist(){
    
}

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
        ajaxCall('POST', 'application/json', LOGIN_URL, {
            'email': email,
            'password': sha256_digest(password)
        }, 'JSON', null, function (success, error) {
            if (error && error.responseJSON && error.responseJSON.message) {
                $('.gnr-error-server-msg').text(error.responseJSON.message);
            } else if (success && success.data) {
                browser.runtime.sendMessage({
                    action: 'saveToken',
                    data: success.data.token
                });
            } else {
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
     
    ajaxCall('GET', 'application/json', USER_DETAILS + '?domainName=' + domainName+'&pageName='+ encodeURI(pageName), null, 'JSON', token, function (success) {
        setTimeout(function () {
            generExtBody.empty();
            generExtBody.append(dashboardPage);
            if (success && success.data) {
                $('#gnr-ref-link').val(success.data.referralLink);
                $('#styled-checkbox-2').prop('checked', success.data.web ? success.data.web.domainWhitelisted : false);
                $('#styled-checkbox-1').prop('checked', success.data.web ? success.data.web.pageWhitelisted : false);
                $('#styled-checkbox-1').prop( "disabled", success.data.web ? success.data.web.domainWhitelisted : false );
                $('#gener8Wallet').html(success.data.walletToken ? success.data.walletToken : 0.00);
            }
        }, 1000);
    });
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
