let eSherlock = {
    regexObj: /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/gim,
    isVisible: !1,
    popUp: null,
    email: null,

    processDocument: function (c) {
        Array.prototype.unique = function () {
            return Array.from(new Set(this));
        }

        let emails = document.body.innerText.match(this.regexObj);

        if (emails === null) {
            chrome.runtime.sendMessage({
                type: "update_badge", options: {
                    type: "basic",
                    message: ''
                }
            });
            return emails;
        }

        let uniqueEmails = emails.unique();

        chrome.runtime.sendMessage({
            type: "update_badge", options: {
                type: "basic",
                message: uniqueEmails.length
            }
        });

        return uniqueEmails
    },
    processBadges: function (c) {
    }
};

emails = eSherlock.processDocument();
eSherlock.processBadges();

//chrome.browserAction.setBadgeText({text: "10+"});/
// chrome.action.setBadgeText({text: "2"});


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        // when there was a reset from the plugin, search for emails again
        if (emails === undefined) {
            emails = eSherlock.processDocument();
        }

        if (request["type"] === 'msg_from_popup') {
            sendResponse(emails);
            // this is how you send message to popup
        }
        return true; // this make sure sendResponse will work asynchronously

    }
);

