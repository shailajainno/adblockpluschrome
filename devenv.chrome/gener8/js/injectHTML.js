//Login HTML for popup.html
var loginPage = `
<div class="gnr-ext-log">
   <a id="gnr-website"><img src="../img/logo.svg"></a>
</div>
<div class="gnr-flex">
<div class="col-6 login-tab-btn"><span >LOGIN</span></div>
<div class="col-6 signup-tab-btn"><span class="active">SIGN UP</span></div>
</div>
<div class="gnr-login-tab" style='display:none;'>
    <div class="gnr-ext-login">
        <div class="gnr-error-server-msg">
        </div>
        <div class="gnr-ext-log-ep">
            <div class="gnr-emailid">
                <div class="gnr-error-msg">
                </div>
                <input id="emailid" type="text" alt="Email" placeholder="Email *">
            </div>
        </div>
        <div class="gnr-ext-log-ep">
            <div class="gnr-password">
                <div class="gnr-error-msg">
                </div>
            <input id="password" type="password" alt="Password" placeholder="Password *">
        </div>
   </div>
        <div class="gnr-ext-frgt-ps">
            <a id="gnr-forgot-password">Forgotten Password?</a>
        </div>
        <div class="gnr-ext-login-btn" >
            <input type="submit" value="Login with email" style=" cursor:pointer;">
        </div>
    </div>
    <div class="gnr-ext-login-wth">
    <span>Or Login with</span>
    <div class="gnr-ext-login-fb-twt">
        <ul>
            <li>
                <a id="gnr-fbLoginBtn" style="cursor:pointer;">
                <img src="../img/fb.png" >
                </a>
            </li>
            <li>
                <a id="gnr-twLoginBtn" style="cursor:pointer;">
                    <img src="../img/twt.png" >
                </a>
            </li>
        </ul>
    </div>
    </div>
</div>
<div class="gnr-ext-login-smp">
   <a id="gnr-sign-up">Sign-Up</a>
</div>
`;

//Dashboard HTML for popup.html
var dashboardPage = `
<div class="gnr-ext-log gnr-txt-left">
   <img src="../img/logo.svg" alt="logo">
   <div class="gnr-menu">
      <ul id="menu">
         <li>
            <input id="check01" type="checkbox" name="menu"/>
            <label for="check01"><img src="../img/menu.png" alt="menu" /></label>
            <ul class="submenu">
               <div class="gnr-arrow-up"></div>
               <li><a href="#" class="hamburger" id="faq">FAQ</a></li>
               <li><a href="#" class="hamburger" id="contactus">CONTACT US</a></li>
               <li><a href="#" class="hamburger" id="rateus">RATE US</a></li>
            </ul>
         </li>
      </ul>
   </div>
   <div class="gnr-noti">
      <ul id="menu">
         <li>
            <input id="check02" type="checkbox" name="noti"/>
            <label for="check02"><img src="../img/noti.png" alt="noti" /></label>
         </li>
      </ul>
   </div>
</div>
<div class="gnr-login-page">
   <div class="gnr-ext-login">
      <div class="gnr-status-name">
         <p>Status Level : <b id="currentLevel"></b></p>
      </div>
      <div class="gnr-slider-prog">
         <div class="progress"></div>
      </div>
      <div class="gnr-status-fname">
         <span class="cstatus">Level 1</span>
         <span class="nstatus">Level 2</span>
      </div>
   </div>
   <a class="gnr-wall-main" id="gnr-wallet">
      <div class="gnr-wall">
         <p class="gnr-name"><img src="../img/wallet.png">Tokens in Wallet</p>
         <p class="gnr-amt"><img style="position:relative;top:-2px;" src="../img/gnr.png"><span id="gener8Wallet">0.00</span></p>
      </div>
   </a>
   <a class="gnr-wall-main" id="gnr-dashboard" href="#">
      <div class="gnr-wall">
         <p class="gnr-name"><img src="../img/dashboard.png">My Dashboard</p>
      </div>
   </a>
   <div class="gnr-ext-login gnr-brdr-top">
      <div class="gnr-chk-pause">
         <input class="gnr-styled-checkbox" id="styled-checkbox-1" type="checkbox" value="value1">
         <label for="styled-checkbox-1">Pause Gener8 on this Page</label>
      </div>
      <div class="gnr-chk-web">
         <input class="gnr-styled-checkbox" id="styled-checkbox-2" type="checkbox" value="value1">
         <label for="styled-checkbox-2">Always Pause Gener8 on this website</label>
      </div>
      <div class="gn-ref-frnd">
         <p>Refer Friend</p>
         <p class="coplnk"><input type="text" class="gen-reg-link" readonly id="gnr-ref-link"><button id="gnr-copy-ref-link">Copy Link</button></p>
      </div>
   </div>
</div>
`;

var notificationPage = `
<div class="gnr-ext-log gnr-txt-left">
   <div id="back" class="gnr-back">
    < Back
   </div>
</div>

<div class="gnr-notification-nw">
    <ul id="notificationList">

    </ul>
    <a class="see-more" id="seeMore" href="#">See More</a>
</div>

`;

var loader = `
<div class="loader" style="display: block;">
   <div class="animation-1">
      <div class="box1"></div>
      <div class="box2"></div>
      <div class="box3"></div>
      <div class="box4"></div>
   </div>
</div>
`

var suspendPage = function(title, message){
    return `
    <div class="gnr-ext-login gnr-ext-suspag">
        <img src="../img/icon128.png" style="">
        <h3>${title}</h3>
        <p>${message}</p>
    </div>
    `
};

//loginPage = dashboardPage;
// dashboardPage = notificationPage;