const buttonAuthorize = document.querySelector("#btn-authorize");
const buttonAddTask = document.querySelector("#btn-add-task");
const userNameLabel = document.getElementById('UserName');

buttonAuthorize.addEventListener("click", async () => {
	try {
		const currentWindow = await chrome.windows.getCurrent();
		const activeTabs = await chrome.tabs.query({ active: true, windowId: currentWindow.id });

		function sendPromise(tab) {
			return new Promise((resolve, reject) => {
				chrome.runtime.sendMessage({ action: "AUTHORIZE" }, response => {
					debugger
					if (response && response.success)
						resolve(response.result);
					else
						reject(response.result);
				});
			});
		}

		const userData = await Promise.all(activeTabs.map(tab => sendPromise(tab)));
		userNameLabel.innerHTML = userData.visibleName;
		console.log(userData);
	} catch (error) {
		console.log("Error: ", error);
	}
});


buttonAddTask.addEventListener("click", async () => {
	try {
		const currentWindow = await chrome.windows.getCurrent();
		const activeTabs = await chrome.tabs.query({ active: true, windowId: currentWindow.id });

		function sendPromise(tab) {
			return new Promise((resolve, reject) => {
				chrome.runtime.sendMessage({ action: "ADD_TASK" }, response => {
					if (response && response.success)
						resolve(response.result);
					else
						reject(response.result);
				});
			});
		}

		const responseData = await Promise.all(activeTabs.map(tab => sendPromise(tab)));

	} catch (error) {
		console.log("Error: ", error);
	}
})
