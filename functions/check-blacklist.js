function blockAllWebsites(blockedWebsites) {
    chrome.tabs.query({}, function (tabs) {
        // Loop through each open tab
        tabs.forEach(function (tab) {
            // Check if the tab's URL contains any of the blocked websites
            blockedWebsites.forEach(function (site) {
                const tabDomain = new URL(tab.url).hostname;

                let blockUrl = site;
                if (!site.includes('https://') && !site.includes('http://')) {
                    blockUrl = `https://${site}`;
                }

                const siteDomain = new URL(`https://${site}`).hostname;

                // Check if the domain is exactly the same as the site
                if (tabDomain === siteDomain || tabDomain === `www.${siteDomain}` || `www.${tabDomain}` === siteDomain) {
                    // Redirect the tab to focus.html
                    chrome.tabs.update(tab.id, { url: `/page/focus.html#${site}` });
                }
            });
        });
    });
}