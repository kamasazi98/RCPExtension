const buttonAuthorize = document.querySelector("#btn-authorize");
const buttonAddTask = document.querySelector("#btn-add-task");
const userNameLabel = document.getElementById('UserName');
const errorDiv = document.getElementById('errors');
const errorLabel = document.getElementById('error-value');


buttonAuthorize.addEventListener("click", async () => {
	try {
		errorDiv.style.display = 'none';
		const currentWindow = await chrome.windows.getCurrent();
		const activeTabs = await chrome.tabs.query({ active: true, windowId: currentWindow.id });

		function sendPromise(tab) {
			return new Promise((resolve, reject) => {
				chrome.runtime.sendMessage({ action: "AUTHORIZE" }, response => {
					if (response == undefined)
						reject('Response undefined.');

					if (response && response.success) {
						resolve(response.result);
					}
					else
						reject(response.result);
				});
			});
		}

		const userData = await Promise.all(activeTabs.map(tab => sendPromise(tab)));
		if (userData.length > 0)
			userNameLabel.innerHTML = userData[0].profile.username;
	} catch (error) {
		errorDiv.style.display = 'block';
		errorLabel.textContent = error;
	}
});


buttonAddTask.addEventListener("click", async () => {
	try {
		errorDiv.style.display = 'none';
		const currentWindow = await chrome.windows.getCurrent();
		const activeTabs = await chrome.tabs.query({ active: true, windowId: currentWindow.id });

		function sendPromise(tab) {
			return new Promise((resolve, reject) => {
				chrome.runtime.sendMessage({ action: "ADD_TASK" }, response => {
					if (response == undefined)
						reject('Response undefined.');

					if (response && response.success)
						resolve(response.result);
					else {
						reject(response.result);
					}
				});
			});
		}

		const responseData = await Promise.all(activeTabs.map(tab => sendPromise(tab)));

	} catch (error) {
		errorDiv.style.display = 'block';
		errorLabel.textContent = error;
	}
})
