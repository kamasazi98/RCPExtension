const button = document.querySelector("#btn-add-task");
//const errorSpan = document.querySelector("#error-span");


button.addEventListener("click", async () => {
	try {
		const currentWindow = await chrome.windows.getCurrent();
		const activeTabs = await chrome.tabs.query({ active: true, windowId: currentWindow.id });

		function sendPromise(tab) {
			return new Promise((resolve, reject) => {
				chrome.runtime.sendMessage({ action: "ADD_TASK" }, response => {
					debugger
					if (response && response.success)
						resolve(response.result);
					else
						reject(response.result);
				});
			});
		}

		const userData = await Promise.all(activeTabs.map(tab => sendPromise(tab)));
		console.log(userData);
	} catch (error) {
		console.log("Error: ", error);
		//errorSpan.hidden = false;
		//errorSpan.value = error;
	}
	//await chrome.windows.getCurrent(async function (currentWindow) {
	//	await chrome.tabs.query({ active: true, windowId: currentWindow.id }, async function (activeTabs) {
	//		await activeTabs.map(async function (tab) {
	//		});
	//	});
	//});
});