import { mapUserData } from './Models/UserModel.js';
import * as CategoryRequester from './Requesters/CategoryRequester.js';
import * as ProjectRequester from './Requesters/ProjectRequester.js';
import * as ExternalSystemRequester from './Requesters/ExternalSystemRequester.js';
import * as CompanyRequester from './Requesters/CompanyRequester.js';
import * as TaskRequester from './Requesters/TaskRequester.js';




var user = null;
var categories = null;
var projects = null;
var externalSystems = null;
var companies = null;
var task = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

	if (request.action == `${LISTENER_AUTHORIZE}`) {
		getToken().then(userData => {
			user = userData
			sendResponse({ success: true, result: userData });
		}).catch(error => {
			sendResponse({ success: false, result: error });
		});
	}
	else if (request.action == `${LISTENER_ADD_TASK}`) {
		acquireData().then(() => {
			return retrieveTask()
		}).then(() => {
			sendResponse({ success: true, result: null });
		}).catch(error => {
			sendResponse({ success: false, result: error });
		});
	}
	return true;
})

function getToken() {
	return new Promise((resolve, reject) => {
		chrome.tabs.query({ active: false, url: `${RCP_URL}` }, function (tabs) {
			if (tabs.length <= 0)
				throw new Error('RCP main site not found');
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
function getSessionStorage() {
	return window.sessionStorage.getItem(`${RCP_USER_ID_KEY}`);
}


async function acquireData() {
	try {
		categories = await CategoryRequester.RequestCategories(user);
		projects = await ProjectRequester.RequestProjects(user);
		externalSystems = await ExternalSystemRequester.RequestExternalSystems(user);
		companies = await CompanyRequester.RequestCompanies(user);
		if (categories == undefined || (categories && categories.length == 0))
			throw new Error('Categories not found or empty.');
		if (projects == undefined || (projects && projects.length == 0))
			throw new Error('Projects not found or empty.');
		if (externalSystems == undefined || (externalSystems && externalSystems.length == 0))
			throw new Error('External Systems not found or empty.');
		if (companies == undefined || (companies && companies.length == 0))
			throw new Error('Companies not found or empty.');
	} catch (error) {
		throw error;
	}
}
async function retrieveTask() {
	try {
		await acquireTaskTab((error, activeTab) => {
			if (error)
				throw error;

			var resultOfScripting = await chrome.scripting.executeScript({
				target: { tabId: activeTab[0].id },
				func: searchDivByClass,
				args: [`${TASK_SELECTOR_DIV_CONTAINER}`]
			});

			if (result == undefined)
				throw new Error('Could not find container with task.');

			const domParser = new DOMParser();
			const doc = domParser.parseFromString(resultOfScripting, 'text/html');
			const taskIdLabel = doc.querySelector(`${TASK_SELECTOR_TASK_IDENTIFIER}`);
			const taskNameLabel = doc.querySelector(`${TASK_SELECTOR_TASK_NAME}`);
			const taskProjectLabel = doc.querySelector(`${TASK_SELECTOR_TASK_PROJECT}`);
			const taskExternalSystemLabel = EXTERNAL_SYSTEMS_NONE;

			if (activeTab[0].url.includes(EXTERNAL_SYSTEMS_SYMFONIA))
				taskExternalSystemLabel = EXTERNAL_SYSTEMS_SYMFONIA;
			else if (activeTab[0].url.includes(EXTERNAL_SYSTEMS_EASTSOFT))
				taskExternalSystemLabel = EXTERNAL_SYSTEMS_EASTSOFT;
			else if (activeTab[0].url.includes(EXTERNAL_SYSTEMS_JIRA))
				taskExternalSystemLabel = EXTERNAL_SYSTEMS_JIRA;

		})
	}
	catch (error) {
		throw error;
	}
}
async function acquireTaskTab(callback) {
	chrome.tabs.query({ active: true }, function (tabs) {
		var activeTab = tabs[0];
		if (!activeTab)
			callback(new Error('Active tab not found'), null);

		if (activeTab.url.includes(`${TFS_URL_EASTSOFT}`))
			callback(null, activeTab);
		else if (activeTab.url.includes(`${TFS_URL_SYMFONIA}`))
			callback(null, activeTab);
		else
			callback(Error('Invalid active tab. Active tab is not a eastsoft tfs or symfonia.'), null);
	});
}
async function searchDivByClass(className) {
	const div = document.querySelector(`.${className}`);
	return div ? div.outerHTML : null;
}