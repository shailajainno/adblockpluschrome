const GENER8_BACKEND_URL = 'https://devapi.gener8ads.com/';
const GENER8_FRONTEND_URL = 'https://dev.gener8ads.com/';
const GENER8_WEBSITE = 'https://www.gener8ads.com/';
const GENER8_AD_URL = 'https://dev.gener8ads.com/mktweb/adServe.html';
const GENER8_AD_DOMAIN = 'aj1549.online ';
const INSTALL_API = GENER8_BACKEND_URL + 'web/install';
const VALIDATE_WHITE_LIST = 'user/validatedomain';
const SCHEDULER = 'user/ext/scheduler-api';
const SCHEDULER_DELAY_MIN = 60; // 60 * hours
const NOTIFICATION = 'notification/updates';
let adTags = {};
var gener8TabData = {
    whitelist: {

    }
};
var userData;
var tokenRate = 0;
