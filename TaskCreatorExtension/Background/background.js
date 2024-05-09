import { mapUserData } from './Models/UserModel.js';
var user = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

	if (request.action == "ADD_TASK") {
		getToken().then(userData => {
			user = userData
			sendResponse({ success: true, result: userData });
		}).catch(error => {
			sendResponse({ success: false, result: error });
		});
		return true;
	}
})


function getSessionStorage() {
	return window.sessionStorage.getItem('oidc.user:https://id.eastsoft.pl/:app_rcp');
}
function getToken() {
	return new Promise((resolve, reject) => {
		chrome.tabs.query({ active: false, url: 'https://rcp.eastsoft.pl/' }, function (tabs) {
			var pageId = tabs[0].id;
			chrome.scripting.executeScript({
				target: { tabId: pageId },
				func: getSessionStorage
			}, function (results) {
				if (chrome.runtime.lastError) {
					console.error('Error executing script:', chrome.runtime.lastError.message);
					reject(chrome.runtime.lastError.message);
				} else {
					console.log('Script executed successfully:', results[0].result);
					const userData = mapUserData(results[0].result);
					resolve(userData);
				}
			});
		})
	});
}