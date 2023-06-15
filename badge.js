/** Shared logic */
class Badge {

    /**
     * Gets the active Tab
     * @returns {Promise<*>} Active tab
     */
    getActiveTab = async () => {
        const query = { active: true, currentWindow: true };
        const getTabTitlePromise = new Promise((resolve, reject) => {
            chrome.tabs.query(query, (tabs) => {
                resolve(tabs[0]);
            });
        });
        return getTabTitlePromise;
    }

    /**
     * Concatenates the tab title with Acho's barks.
     * @param {String} tabTitle Current tab title
     * @returns {String}
     */
    getBarkedTitle = (tabTitle) => {
        const barkTitle = `${this.getRandomBark()} Ahem.. I mean, we are at: <br><b>${tabTitle}</b>`
        return barkTitle;
    }

    /**
     * Display a badge with the text 'grr' over the browser action icon
     */
    growl = () => {
        chrome.browserAction.setBadgeBackgroundColor({ color: '#F00' }, () => {
            chrome.browserAction.setBadgeText({ text: 'grr' });
        });
    }

    /**
     * Hide the browser action badge.
     */
    quiet = () => {
        chrome.browserAction.setBadgeText({});
    }

    /**
     * Array of available bark sounds
     * @private
     * @returns {String[]}
     */
    getBarks = () => {
        return [
            'Barf barf!',
            'Birf birf!',
            'Woof woof!',
            'Arf arf!',
            'Yip yip!',
            'Biiiirf!'
        ];
    }
    /**
     * Returns a random bark from the list of possible barks.
     * @private
     * @returns {String}
     */
    getRandomBark = () => {
        const barks = this.getBarks();
        const bark = barks[Math.floor(Math.random() * barks.length)];
        return bark;
    }
}