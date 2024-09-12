importScripts('/functions/check-blacklist.js');

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    chrome.storage.local.get(['focusMode', 'blockedWebsites'], function (result) {
        if (result.focusMode) {
            let allBlockedWebsites = result.blockedWebsites || [];

            blockAllWebsites(allBlockedWebsites);
        }
    });
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'startTimer') {
        showProgressNotification(message, sender);
    }
});


function showProgressNotification(message, sender) {
    const durationMs = message.duration;
    let notificationId = 'focus-mode';

    // Create a progress notification
    chrome.notifications.create(notificationId, {
        title: 'Focus Mode',
        message: `Focus mode will be re-enabled in ${durationMs / 1000} seconds.`,
        iconUrl: '/assets/icon-active-128.png',
        type: 'progress',
        progress: 0
    }, function (id) {
        // Only for multiple notifications
        // Important remove id by create if you want to use multiple ids
        // notificationId = id; // Store notification ID for updates
    });

    // Set up a progress updater
    let progress = 0;
    const updateInterval = durationMs / 100;

    const progressUpdater = setInterval(function () {
        progress += 1;

        // Update the notification progress
        chrome.notifications.update(notificationId, {
            progress: progress
        });

        // If progress reaches 100%, stop updating
        if (progress >= 100) {
            clearInterval(progressUpdater);

            // Timer has ended, perform action
            chrome.storage.local.get(['blockedWebsites'], function (result) {
                chrome.storage.local.set({ focusMode: true });
                let blockedWebsites = result.blockedWebsites || [];
                blockAllWebsites(blockedWebsites);

                // Update notification to show that focus mode is re-enabled
                chrome.notifications.update(notificationId, {
                    title: 'Focus Mode Re-Enabled',
                    message: 'Focus mode is now active again.',
                    iconUrl: '/assets/icon-active-128.png',
                    type: 'basic'
                });

                /// Remove notification after 10 seconds
                setTimeout(() => {
                    chrome.notifications.clear(notificationId);
                }, 10_000);
            });
        }
    }, updateInterval);

}