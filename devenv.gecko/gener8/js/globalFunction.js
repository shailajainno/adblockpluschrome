/**
 * @description - get the user token from cookies
 * @returns {string} - token
 */
function getUserAccessToken(callback) {
    cookieGet('gnr-ext-token', function (token) {
        if (token) {
            callback(token);
        } else {
            callback(null);
        }
    });
}
/**
 * @description set value in cookies
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
    browser.cookies.set({
        url: GENER8_FRONTEND_URL,
        name: key,
        value: value
    }).then(setItem, onError);
}

/**
 * @description get any value from cookies
 * @param {string} key 
 * @param {function} callback 
 */
function cookieGet(key, callback) {
    function logCookie(cookie) {
        if (cookie) {
            callback(cookie.value, null);
        } else {
            callback(null, null);
        }
    }
    function onError(error) {
        callback(null, error);
    }
    browser.cookies.get({
        url: GENER8_FRONTEND_URL,
        name: key
    }).then(logCookie, onError);
}

/**
 * @description remove passed key value pair from cookies
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
 * @description ajax call to back end
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
        delete obj["data"];
    }
    if (token == null) {
        delete obj["headers"];
    }
    $.ajax(obj);
}