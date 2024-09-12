document.addEventListener('DOMContentLoaded', function () {
  const focusToggle = document.getElementById('focusToggle');
  const websiteInput = document.getElementById('websiteInput');
  const addWebsiteBtn = document.getElementById('addWebsiteBtn');
  const blockedSitesList = document.getElementById('blockedSitesList');

  // Initialize the switch state and blocked websites list from storage
  chrome.storage.local.get(['focusMode', 'blockedWebsites'], function (result) {
    focusToggle.checked = result.focusMode || false;
    const blockedWebsites = result.blockedWebsites || [];
    blockedWebsites.sort((a, b) => a.localeCompare(b));

    // Populate the list of blocked websites
    blockedWebsites.forEach(site => {
      addWebsiteToList(site);
    });

    // If Focus Mode is enabled, block all websites in the blocklist
    if (result.focusMode) {
      blockAllWebsites(blockedWebsites);
    }

  });

  // Handle the focus mode switch toggle
  focusToggle.addEventListener('change', function () {
    const isChecked = this.checked;
    chrome.storage.local.set({ focusMode: isChecked });

    chrome.action.setIcon({ path: `/assets/icon-${isChecked ? 'active' : 'inactive'}-128.png` });

    // When Focus Mode is enabled, block all websites on the blocklist
    chrome.storage.local.get('blockedWebsites', function (result) {
      const blockedWebsites = result.blockedWebsites || [];
      if (isChecked) {
        blockAllWebsites(blockedWebsites);
      } else {
        unblockAllWebsites(blockedWebsites);
      }
    });
  });


  // Add a new website to the block list
  websiteInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      addToBlockList();
    }
  });
  addWebsiteBtn.addEventListener('click', function () {
    addToBlockList();
  });

  function addToBlockList() {
    const website = websiteInput.value.trim();
    if (website) {
      chrome.storage.local.get(['blockedWebsites'], function (result) {
        let blockedWebsites = result.blockedWebsites || [];
        if (!blockedWebsites.includes(website)) {
          blockedWebsites.push(website);
          blockedWebsites.sort((a, b) => a.localeCompare(b));
          chrome.storage.local.set({ blockedWebsites: blockedWebsites }, function () {
            addWebsiteToList(website);
          });
        }
      });
      websiteInput.value = '';  // Clear input field
    }
  }

  // Helper function to display websites in the list
  function addWebsiteToList(website) {
    const li = document.createElement('li');
    const text = document.createElement('span');
    text.innerText = website;

    li.appendChild(text);

    const button = document.createElement('button');
    button.onclick = function () {
      chrome.storage.local.get(['blockedWebsites'], function (result) {
        let blockedWebsites = result.blockedWebsites || [];
        if (blockedWebsites.includes(website)) {
          const i = blockedWebsites.findIndex(el => el === website);
          blockedWebsites.splice(i, 1);
          chrome.storage.local.set({ blockedWebsites: blockedWebsites }, function () {
            li.remove();
          });
        }
      });
    };
    const removeIcon = document.createElement('img');
    removeIcon.src = '/assets/delete_outline.svg';
    button.appendChild(removeIcon);
    li.appendChild(button);

    blockedSitesList.appendChild(li);
  }
});
