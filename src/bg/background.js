chrome.contextMenus.create({
	title: 'Reset all Bingosync counters',
	id: 'resetBingosyncCounters',
	contexts: ["all"],
	documentUrlPatterns: ["https://bingosync.com/*"]
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
	if (info.menuItemId === "resetBingosyncCounters") {
		chrome.storage.sync.clear(function() {
			chrome.tabs.sendMessage(tab.id, {type: "resetBingosyncCounters"});
		});
	}
});