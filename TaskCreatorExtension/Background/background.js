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

	if (request.action == "AUTHORIZE") {
		getToken().then(userData => {
			user = userData
			sendResponse({ success: true, result: userData });
		}).catch(error => {
			sendResponse({ success: false, result: error });
		});
	}
	else if (request.action == "ADD_TASK") {
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
		chrome.tabs.query({ active: false, url: 'https://rcp.eastsoft.pl/' }, function (tabs) {
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
	return window.sessionStorage.getItem('oidc.user:https://id.eastsoft.pl/:app_rcp');
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

		if (activeTab.url.includes('https://tfs.eastsoft.pl'))
			callback(null, activeTab);
		else if (activeTab.url.includes('https://dev.azure.com/symfoniapl/'))
			callback(null, activeTab);
		else
			callback(Error('Invalid active tab. Active tab is not a eastsoft tfs or symfonia.'), null);
	});
}