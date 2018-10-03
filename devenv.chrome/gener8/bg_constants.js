
const GENER8_AD_DOMAIN = 'aj1549.online';
const INSTALL_API = GENER8_BACKEND_URL + 'web/install';
const VALIDATE_WHITE_LIST = 'user/validatedomain';
const SCHEDULER = 'user/ext/scheduler-api';
const NOTIFICATION = 'notification/updates';
let adTags = {};
var gener8TabData = {
    whitelist: {

    },
    replace: {
        
    }
};
var userData;
var tokenRate = 0;
let minCount = 0;
let hourCount = 0;
let dayCount = 0;
let defaultMinCount = 0;
let defaultHourCount = 0;
let defaultDayCount = 0;
let lastSyncAt = null;