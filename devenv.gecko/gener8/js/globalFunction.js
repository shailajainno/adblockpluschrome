/**
 * Get the user access token from cookies
 * @returns {string} - token
 */
function getUserAccessToken(callback) {
    cookieGet('jwtToken', function (token) {
        if (token) {
            token = JSON.parse(token);
            token = atob(token.body);
            callback(token);
        } else {
            callback(null);
        }
    });
}
/**
 * Set value in cookies
 * @param {string} key
 * @param {string} value
 * @param {function} callback
 */
function cookieSet(key, value, callback) {
    function setItem() {
        callback(key, null);
    }
    function onError(error) {
        callback(null, error);
    }
    let cookieExpDate = new Date().getTime()/1000 + 365 * 24 * 60 * 60 * 100;
    browser.cookies.set({
        url: GENER8_FRONTEND_URL,
        name: key,
        value,
        expirationDate: Math.trunc(cookieExpDate)
    }).then(setItem, onError);
}

/**
 * Get any value from cookies
 * @param {string} key
 * @param {function} callback
 */
function cookieGet(key, callback) {
    function logCookie(cookie) {
        callback(cookie ? cookie.value: null);
    }

    browser.cookies.get({
        url: GENER8_FRONTEND_URL,
        name: key
    }).then(logCookie);
}

/**
 * Remove passed key value pair from cookies
 * @param {string} key
 * @param {function} callback
 */
function storageRemove(key, callback) {
    function removeItem() {
        callback('Local storage cleared', null);
    }
    function onError(error) {
        callback(null, error);
    }
    browser.cookies.remove({
        url: GENER8_FRONTEND_URL,
        name: key
    }).then(removeItem, onError);
}

/**
 * Ajax call to back end
 * @param {string} type
 * @param {string} contentType
 * @param {string} url
 * @param {array} content
 * @param {string} dataType
 * @param {string} token
 * @param {function} callback
 */
function ajaxCall(type, contentType, url, content, dataType, token, callback) {
    var obj = {
        type: type,
        contentType: contentType,
        headers: {
            'authorization': token
        },
        url: GENER8_BACKEND_URL + url,
        data: JSON.stringify(content),
        dataType: dataType,
        timeout: 60e3,
        success: function (data) {
            callback(data, null);
        },
        error: function (xhr) {
            callback(null, xhr);
        }
    };
    if (content == null) {
        delete obj['data'];
    }
    if (token == null) {
        delete obj['headers'];
    }
    $.ajax(obj);
}
