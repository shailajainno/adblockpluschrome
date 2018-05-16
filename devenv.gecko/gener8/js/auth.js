/**
* @description this function will send token to background js and close the login popup
*/
if (document.getElementsByTagName('p')) {
    var id = document.getElementsByTagName('p')[0].id;
    if (id === "authToken") {
        browser.runtime.sendMessage({
            action: 'saveToken',
            data: document.getElementById(id).innerText
        }, function () {
            window.close();
        });
    }
} else {
    window.close();
}
