cordova.define("com.autentia.plugin.sendmail.SendMail", function(require, exports, module) { var sendmail = {

    send: function(successCallback, errorCallback, subject, body, sender, password, recipients, attachment){
        cordova.exec(successCallback,
            errorCallback,
            "SendMail",
            "send",
            [{
                 "subject":subject,
                 "body":body,
                 "sender":sender,
                 "password":password,
                 "recipients":recipients,
                 "attachment": attachment,
            }]
        );
    }
}

module.exports = sendmail;

});
