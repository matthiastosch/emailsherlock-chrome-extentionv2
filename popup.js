document.addEventListener('DOMContentLoaded', function () {

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {

        chrome.tabs.sendMessage(tabs[0].id, {type: "msg_from_popup"}, function (response) {
            let list = document.getElementById('emailList');
            let emailListWrapper = document.getElementById('emailListWrapper');
            let listNoResults = document.getElementById('emailListNoResults');
            let processIssue = document.getElementById('processIssue');
            let manualSearch = document.getElementById('manualSearch');
            let version = document.getElementById('version');



            if (response === undefined) {
                processIssue.style.display = 'block';
                manualSearch.style.display = 'none';
                return;
            }


            if (response === null || response.length === 0) {
                listNoResults.style.display = 'block';
            } else {

                emailListWrapper.style.display = 'block';

                response.forEach(function (email) {
                    let li = document.createElement('li');
                    li.innerHTML = email.toLowerCase() + '<span>Lookup</span>';
                    list.appendChild(li);
                });
            }

            version.innerText = chrome.runtime.getManifest().version;
        });
    });
})