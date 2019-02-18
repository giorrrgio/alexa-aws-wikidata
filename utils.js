const url = require('url');

const getContent = function(urlStr, headers) {

    // return new pending promise
    return new Promise((resolve, reject) => {
            const q = url.parse(urlStr, false);
    var lib = (q.protocol == "http") ? require('http') : require('https');
    let options = {
        path:  q.path,
        host: q.hostname,
        method: 'GET',
        headers: {},
    };

    if (headers) {
        options.headers = headers
    }

    options.headers['content-type'] = 'application/json';
    const request = lib.request(options, (response) => {
            // handle http errors
            if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error('Failed to load page, status code: ' + response.statusCode));
    }
    // temporary data holder
    const body = [];
    // on every content chunk, push it to the data array
    response.on('data', (chunk) => body.push(chunk));
    // we are done, resolve promise with those joined chunks
    response.on('end', () => resolve(body.join('')));
});
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
    request.end();
})
};

const escapeXml = function(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

const ucCase = function(str) {
    var lower = String(str).toLowerCase();
    return lower.replace(/(^| )(\w)/g, function(x) {
        return x.toUpperCase();
    });
}

module.exports.getContent = getContent;
module.exports.escapeXml = escapeXml;
module.exports.ucCase = ucCase;