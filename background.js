chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
        if(request["type"] === 'update_badge'){
            chrome.action.setBadgeText({text: request.options.message.toString()});
        }
    }
)


