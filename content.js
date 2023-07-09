let apiResult = null;
let apiResultPromise = null;

let eSherlock = {
    regexObj: /(?![x22]|[x3e])[*a-zA-Z0-9._\-+]+@[a-zA-Z0-9.-]+\.(?!png|jpg|jpeg|gif|tiff|svg|mov|mp3)[a-zA-Z]{2,4}/gim,
    apiResult: null,
    uniqueEmails: null,
    uniqueEmailsCount: null,

    processDocument: function (c) {
        Array.prototype.unique = function () {
            return Array.from(new Set(this));
        }
        let rawEmails = null;

        rawEmails = document.body.innerHTML.match(this.regexObj);
        if (rawEmails !== null) {
            return rawEmails.length > 0 ? rawEmails.unique() : null;
        }

        return null
    },
    processBadges: function (emails) {
        chrome.runtime.sendMessage({
            type: "update_badge", options: {
                type: "basic",
                message: (emails === null ? '' : emails.length)
            }
        });
    },
    sendEmails: function (emails) {

        return new Promise((resolve, reject) => {
            return chrome.runtime.sendMessage({
                type: "apiCall", options: {
                    type: "basic",
                    message: emails
                }
            }, function (response) {
                apiResult = response;
                console.log(response);
                resolve(response);
            });
        });
    },
    dataFlowHandler: async function () {
        // 1. Parse document on every call
        // 2. compare with previous email count. If same, return previous result

        // parse document
        let emails = this.processDocument();

        if (emails !== null && this.uniqueEmails !== null && emails.length === this.uniqueEmails.length) {
            return this.apiResult;
        }

        // Update badge
        this.processBadges(emails);

        // if no emails found don't send to API
        if (emails === null) {
            return null;
        }

        // send emails to API
        apiResultPromise = this.sendEmails(emails);
        this.apiResult = await apiResultPromise;

        // set unique emails in object variable
        this.uniqueEmails = emails;
        this.uniqueEmailsCount = emails.length;

        return this.apiResult;
    }
};

window.addEventListener('load', (event) => {
    eSherlock.dataFlowHandler().then(result => {
        apiResult = result;
    });

    setTimeout(function () {
        eSherlock.dataFlowHandler().then(r => apiResult = r);
    }, 2500);
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        if (request["type"] === 'msg_from_popup') {

            eSherlock.dataFlowHandler().then(result => {
                // this is how you send message to popup

                sendResponse({
                    rawLength: eSherlock.uniqueEmailsCount,
                    emails: result === null ? null : result.slice(0, request.count)
                });
            });
        }
        if (request["type"] === 'tab_change') {
            sendResponse(eSherlock.apiResult.length);
        }
        return true; // this make sure sendResponse will work asynchronously
    }
);
