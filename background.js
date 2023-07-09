chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request["type"] === 'update_badge') {
            chrome.action.setBadgeBackgroundColor({color: '#0d6efd'}, () => {
                let message = request.options.message === undefined ? '' : request.options.message.toString();
                chrome.action.setBadgeText({text: message});
            });
        }
        return true
    }
)

let apiResult = null;

async function apiCall(emails) {
    const params = {
        emails: emails,
        authToken: "822b9066b37d0fbe1ecfd2cfbc671b4f"
    }

    return await fetch("https://emailsherlock/api/emailsearch/", {
        method: 'POST',
        body: JSON.stringify(params),
        mode: 'cors',
        redirect: 'follow',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(response => {
            // Do something with response.

            if (response.success === true) {
                // console.log("response from api", response);
                return response.data;
            }
            // return response;
        })
        .catch((error) => {
            console.log(error)
            return {success: false, errorCode: 1, error: "Could not connect to Emailsherlock"}
        });
}

async function getApiRequest(sendResponse, emails) {
    return await apiCall(emails);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

        if (request["type"] === 'apiCall') {
            getApiRequest(sendResponse, request.options.message).then(r => sendResponse(r));
            return true;
        }
    }
);
