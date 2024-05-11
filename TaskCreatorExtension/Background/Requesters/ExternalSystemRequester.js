const url = 'https://rcp.eastsoft.pl/api/ExternalSystems';

export async function RequestExternalSystems(userData) {
	var headers = {
		'Authorization': userData.token_type + ' ' + userData.access_token
	};
	var requestOptions = {
		method: 'GET',
		headers: headers
	};
	try {
		var response = await fetch(url, requestOptions);
		if (!response.ok)
			throw new Error('Invalid response');

		const responseData = await response.json();
		return responseData;
	}
	catch (error) {
		return error;
	}

}