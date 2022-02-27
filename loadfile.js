//Load a text resource from a file over the internet
var loadTextResource = function (url, callback) {
	var request = new XMLHttpRequest();
	request.open('GET', url + '?please-dont-cache=' + Math.random(), true);
	request.onload = function ()
    {
		if (request.status < 200 || request.status > 299)
        {
			callback(true,'Error: HTTP Status ' + request.status + ' on resource ' + url);
		} else {
			callback(false, request.responseText);
		}
    };
	request.send();
};
