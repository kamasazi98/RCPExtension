const url = 'https://rcp.eastsoft.pl/api/Tasks';

export async function RequestAddTask(userData, task) {
	try {
		var headers = {
			'Authorization': userData.token_type + ' ' + userData.access_token,
			'Content-Type': 'application/json'
		};
		var requestOptions = {
			method: 'POST',
			headers: headers,
			body: JSON.stringify(task)
		};

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