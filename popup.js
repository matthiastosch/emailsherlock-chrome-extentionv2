let version = document.getElementById('version');
version.innerText = chrome.runtime.getManifest().version;

let close = document.getElementById('close-icon');
close.addEventListener('click', function () {
    window.close();
});

let maxCheckEmails = 10;

function updateTabContent(response) {

    let list = document.getElementById('emailList');
    let emailListWrapper = document.getElementById('emailListWrapper');
    let listNoResults = document.getElementById('emailListNoResultsWrapper');
    let loader = document.getElementById('loader');
    let foundEmails = document.getElementById('actual-found');
    let tooManyEmails = document.getElementById('too-many-emails');

    if (response === undefined) {
        processIssue.style.display = 'block';
        manualSearch.style.display = 'none';
        return;
    }

    if (response['emails'] === null || response['emails'].length === 0 || JSON.stringify(response['emails']) === "{}") {
        listNoResults.style.display = 'block';
        loader.style.display = 'none';

    } else {

        // output custom error message
        if (response.success === false) {
            if (response.errorCode === 1) {
                listNoResults.innerText = response.error;
            }
        }

        response['emails'].forEach(function (row) {

            let link = document.createElement('a');
            link.href = 'https://www.emailsherlock.com/emailsearch/' + row.email.toLowerCase() + '/';
            link.target = '_blank';
            link.className = 'flex-container';


            let left = document.createElement('div');
            left.className = 'flex-item-left';
            left.innerHTML = row.email.toLowerCase();
            link.appendChild(left);

            let middle = document.createElement('div');
            middle.className = 'flex-item-middle';

            let score;
            let scoreFloat;
            if (row.valid === false) {
                score = '<span class="text-red">invalid</span>';
            } else {
                if (row.domainscore === "new") {

                    score = '<span class="new-color">new</span>';
                } else {
                    if (row.domainscore === 10) {
                        score = '<span class="text-green"><span class="score-badge bg-green"></span>10/10</span>'
                    } else {
                        scoreFloat = parseFloat(row.domainscore);

                        if (scoreFloat < 5) {
                            score = '<span class="score-badge bg-red">' + scoreFloat.toFixed(1) + "/10</span>";
                        } else if (scoreFloat < 7.5) {
                            score = '<span class="score-badge bg-yellow">' + scoreFloat.toFixed(1) + "/10</span>";
                        } else {
                            score = '<span class="score-badge bg-green">' + scoreFloat.toFixed(1) + "/10</span>";
                        }
                    }
                }
            }
            middle.innerHTML += score;
            link.appendChild(middle);

            let right = document.createElement('div');
            right.className = 'flex-item-right';
            //right.innerHTML = "<a href='https://www.emailsherlock.com/emailsearch/"+ row.email.toLowerCase() +"/' target='_blank'>Lookup</a>";

            let rightSpan = document.createElement('span');
            rightSpan.className = 'increase-notification';
            rightSpan.innerHTML = row.socialAccounts;

            right.appendChild(rightSpan);
            link.appendChild(right);


            list.appendChild(link);
        });

        console.log(response['rawLength']);

        if (response['rawLength'] > maxCheckEmails) {
            foundEmails.innerText = response['rawLength'];
            tooManyEmails.style.display = 'block';
        }

        emailListWrapper.style.display = 'block';
        loader.style.display = 'none';
    }
}

function receiveContent(tabId) {

    chrome.tabs.sendMessage(tabId, {type: "msg_from_popup", count: maxCheckEmails}, function (response) {

        if (!chrome.runtime.lastError) {

            updateTabContent(response);
            markedAsRead();

        } else {
            // console.log("lastError", chrome.runtime.lastError);

            // if you don't have any response it's ok, but you should actually handle
            // if and we are doing this when we are examining chrome.runtime.lastError
            let manualSearch = document.getElementById('manualSearch');
            let processIssue = document.getElementById('processIssue');
            let loader = document.getElementById('loader');

            processIssue.style.display = 'block';
            manualSearch.style.display = 'none';
            loader.style.display = 'none';
        }
    });
}

function markedAsRead() {

    // reset Badge Text
    // empty string will remove the badge
    chrome.runtime.sendMessage({
        type: "update_badge", options: {
            type: "basic",
            message: ''
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        receiveContent(tabs[0].id);
    });
})

document.forms['sherlock_lookup_form'].onsubmit = function () {
    // chrome.extension.sendRequest({logout: true});
}
