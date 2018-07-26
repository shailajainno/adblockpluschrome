const GENER8_BACKEND_URL = 'https://devapi.gener8ads.com/';
const GENER8_FRONTEND_URL = 'https://dev.gener8ads.com/';
const GENER8_WEBSITE = 'https://dev.gener8ads.com/mktweb/';
const SCHEDULER = 'user/ext/scheduler-api';
const FB_CALLBACK_URL = 'auth/social/facebook';
const TW_CALLBACK_URL = 'auth/social/twitter';
const LOGIN_URL = 'auth/signin';
const SIGN_UP_URL = '#/signup';
const FORGOT_PASS_URL = '#/forgot_password';
const VALIDATE_WHITE_LIST = 'user/validatedomain';
const USER_DETAILS = 'user/ext/details';
const ADD_WHITELIST = 'user/whitelist';
const DASHBOARD = '#/dashboard';
const WALLET = '#/wallet';

const EMAIL_IS_REQUIRED = 'Email Id is required';
const EMAIL_NOT_VALID = 'Email Id isn\'t valid';
const PASSWORD_IS_REQUIRED = 'Password is required';

const NOTIFICATION_COUNT = 'notification/updates';
const ACCEPT_TNC= GENER8_BACKEND_URL +'user/accept-tnc';
const NOTIFICATION_LIST = 'notification/getnotification';
const NOTIFICATION_VIEW_LIMIT = 7;
const NOTIFICATION_READ = 'notification/readnotification';
let adTags = {};
let adTagLoaded = false;