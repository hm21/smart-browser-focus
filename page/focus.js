document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.ignore-btn');

    // Loop through the buttons and add an event listener to each
    buttons.forEach(function (button) {
        button.addEventListener('click', function () {
            // Get the duration from the data-duration attribute
            const duration = this.getAttribute('data-duration');

            const site = window.location.hash.substring(1);

            if (site) {
                chrome.storage.local.set({ focusMode: false });
                window.location.replace(`https://${site}`);
            }

            if (duration !== 'forever') {
                chrome.runtime.sendMessage({
                    action: 'startTimer',
                    duration: +duration * 1000,
                    site: site
                });
            }
        });
    });
});
