chrome.runtime.sendMessage({}, function (response) {
	var readyStateCheckInterval = setInterval(function () {
		if (document.readyState === "complete" && $(".square").length > 0 && $(".square").first().children().length > 0) {
			clearInterval(readyStateCheckInterval);

			// Setup CSS
			chrome.storage.sync.get(
				{ show_when_complete: false },
				(items) => {
					if (!items.show_when_complete) {
						$("<style type='text/css'> .bg-color ~ .counter, .bg-color ~ .countButton { display: none !important; } </style>").appendTo("head");
					}
				}
			);


			// Get room ID
			var roomId = window.sessionStorage.getItem("room");

			// Add buttons to interface
			$(".square").append('<div class="countButton countButtonPlus">+</div>');
			$(".square").append('<div class="countButton countButtonMinus">-</div>');
			$(".square").append('<div class="counter hidden"></div>');

			// A function to get the storage key for a particular square
			getStorageKey = function (elem) {
				var idRaw = elem.attr("id");
				if (!idRaw.startsWith("slot")) {
					return; // sanity check
				}
				var id = idRaw.slice(4);

				return roomId + "_" + id;
			}

			// A function to try and guess at the "max" num for a value
			getPossibleMaxNum = function (elem) {
				var text = elem.children(".text-container").text();
				var match = text.match(/ (\d+) /);
				if (match) {
					return parseInt(match[1]);
				}
				return undefined;
			}

			// A function to update all the counter elements
			updateCounters = function () {
				$(".counter").each(function () {
					var storageKey = getStorageKey($(this).parent());
					var num = getPossibleMaxNum($(this).parent());
					var _this = this;

					chrome.storage.sync.get(storageKey, function (result) {
						var current = result[storageKey];
						if (current == undefined || current == 0) {
							$(_this).addClass("hidden");
						} else {
							$(_this).text(current);
							$(_this).removeClass("hidden");
						}

						if (num != undefined && current >= num) {
							$(_this).addClass("counterGreen");
						} else {
							$(_this).removeClass("counterGreen");
						}
					});
				});
			}

			// Update all counters immediately
			updateCounters();

			// Handle button clicks
			$(".countButton").click(function (event) {
				// Stop click from propagating to parent (and triggering bingo square)
				event.stopPropagation();

				// Get the current value of our square's counter
				var storageKey = getStorageKey($(this).parent());
				var _this = this;
				chrome.storage.sync.get(storageKey, function (result) {
					var current = result[storageKey];
					if (current == undefined) {
						current = 0;
					}

					// Update the current value based on which button was pressed
					if ($(_this).hasClass("countButtonPlus")) {
						current++;
					} else {
						current--;
					}

					// Send the new value back to storage
					var d = {}
					d[storageKey] = current;
					chrome.storage.sync.set(d, function () {
						// Update all counters
						updateCounters();
					});
				});
			});

			// When someone resets the counters via right click, update
			chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
				if (typeof message === 'object' && message.type === 'resetBingosyncCounters') {
					updateCounters();
				}
			});
		}
	}, 300);
});