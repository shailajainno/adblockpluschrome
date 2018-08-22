

function socialLoader(){
    document.getElementsByTagName('body')[0].innerHTML = `
    <style>
    .loader {
        border: 16px solid #f3f3f3; /* Light grey */
        border-top: 16px solid #3498db; /* Blue */
        border-radius: 50%;
        width: 100px;
        height: 100px;
        animation: spin 2s linear infinite;
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 1;
        margin: -50px 0 0 -50px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    </style>
    <div class="loader"></div>`
}

function checkAuth(){
    var body = document.getElementsByTagName('body')[0].textContent;
    try {
        body = JSON.parse(body);
        console.log('-->>',JSON.stringify(body));
        if(body.status === 0){
            loadErrorMessage(body.message);
        }else if(body.data.emailRequired){
            openForm(JSON.stringify(body.data));
        }else{
            console.log('token banto..', body.data)
            socialLoader();
            browser.runtime.sendMessage({
                action: "LOGIN",
                token: body.data.token,
                data: {
                    tncAccepted: body.data.tncAccepted
                }
            })
            window.close();
        }
    } catch (error) {
        console.log(error);
    }
}

function loadErrorMessage(message){
    document.body.innerHTML = `
        <style>
        .gnr-ext-log{
            height: 45px;
            background:red;
            text-align: center;
        }
        </style>

        <div class="gnr-ext-log">
        
        <p style="padding: 10px;color: white;font-size: 18px;">
        ${message}
  </p></div>
    `;
}

checkAuth();

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event){
    if(event.data === 'refresh'){
        checkAuth();
    }
}

function openForm(body){
    document.body.innerHTML = `
    <style>
body {
    font-family: Arial, Helvetica, sans-serif
}

* {
    box-sizing: border-box;
}

/* Add padding to containers */
.container {
    padding: 16px;
    background-color: white;
    width: 500px;
   	margin: auto;
    border: 3px solid #4375b9;
}

/* Full-width input fields */
input[type=email] {
    width: 100%;
    padding: 15px;
    margin: 5px 0 22px 0;
    display: inline-block;
    border: none;
    background: #f1f1f1;
}

input[type=email]:focus{
    background-color: #ddd;
    outline: none;
}

/* Overwrite default styles of hr */
hr {
    border: 1px solid #f1f1f1;
    margin-bottom: 25px;
}

/* Set a style for the submit button */
.registerbtn {
    background-color: #4375b9;
    color: white;
    padding: 16px 20px;
    margin: 8px 0;
    border: none;
    cursor: pointer;
    width: 100%;
    opacity: 0.9;
}

.registerbtn:hover {
    opacity: 1;
}

button:disabled, button[disabled] {
    opacity: 0.5 !important;
}

/* Set a grey background color and center the text of the "sign in" section */
.signin {
    background-color: #f1f1f1;
    text-align: center;
}

.error{
    color: red;
}

</style>



<form onsubmit="return false;">
  <div class="container">
    <h1>Social Login</h1>
    <p class="error" id="errorMessage"></p>
    <hr>
    <label for="email"><b>Email id:</b></label>
    <input type="email" id="email"  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" placeholder="Email Address" name="email" required onkeyup="onEmailChange()">
    <span class="error" style="display:none;" id="required">This is a mandatory field and can't be left empty.</span>
    <span class="error" style="display:none;" id="valid">Please enter a valid email address.</span>
    <input type="hidden" id="userData" value='${body}'/>
    <button type="button" id="submit" disabled="true" onclick="return submitMe()" class="registerbtn">Submit</button>
  </div>
</form>

`

$('head').html(`
    <script>
        function testEmailAddress(email) {
            // If no email or wrong value gets passed in (or nothing is passed in), immediately return false.
            if(typeof email === 'undefined') return null;
            if(typeof email !== 'string' || email.indexOf('@') === -1) return false;
        
            // Get email parts
            var emailParts = email.split('@'),
                emailName = emailParts[0],
                emailDomain = emailParts[1],
                emailDomainParts = emailDomain.split('.'),
                validChars = 'abcdefghijklmnopqrstuvwxyz.0123456789_-';
        
            // There must be exactly 2 parts
            if(emailParts.length !== 2) {
                return false;
            }
        
            // Must be at least one char before @ and 3 chars after
            if(emailName.length < 1 || emailDomain.length < 3) {
                return false;
            }
        
            // Domain must include but not start with .
            if(emailDomain.indexOf('.') <= 0) {
                return false;
            }
        
            // emailName must only include valid chars
            for (var i = emailName.length - 1; i >= 0; i--) {
                if(validChars.indexOf(emailName[i]) < 0) {
                    return false;
                }
            };
        
            // emailDomain must only include valid chars
            for (var i = emailDomain.length - 1; i >= 0; i--) {
                if(validChars.indexOf(emailDomain[i]) < 0) {
                    return false;
                }
            };
        
            // Domain's last . should be 2 chars or more from the end
            if(emailDomainParts[emailDomainParts.length - 1].length < 2) {
                return false;   
            }
        
            return true;
        }
        
        function onEmailChange(){
            const email = document.getElementById('email').value;
            if(email){
                console.log(email);
                if(testEmailAddress(email)){
                    document.getElementById("required").style.display = "none";
                    document.getElementById("valid").style.display = "none";
                    document.getElementById("submit").disabled = false;
                }else{
                    document.getElementById("required").style.display = "none";
                    document.getElementById("valid").style.display = "block";
                    document.getElementById("submit").disabled = true;
                }
            }else{
                document.getElementById("required").style.display = "block";
                document.getElementById("valid").style.display = "none";
                document.getElementById("submit").disabled = true;
            }
        }

        function submitMe(){
            console.log(document.getElementById('userData').value)
            let userData = JSON.parse(document.getElementById('userData').value);
            userData.email = document.getElementById('email').value;
            userData.socialHandle = userData.provider;
            console.log(document.getElementById('email').value);
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 ) {
                    const response = JSON.parse(this.responseText);
                    console.log(this.status, response);
                    if(this.status === 200){
                        document.body.innerHTML = this.responseText;
                        window.postMessage("refresh","*");
                    }else{
                        document.getElementById('errorMessage').innerHTML = response.message;
                        setTimeout(() => {
                            document.getElementById('errorMessage').innerHTML = '';
                        }, 3000);
                    }
                }
            };
            xhttp.open("POST", "../../sociallogin", true);
            xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhttp.send(JSON.stringify(userData));
        }
    </script>
`)
}