chrome.webRequest.onBeforeSendHeaders.addListener(details => {
    // 添加 request-server-log
    const existsServerLog = details.requestHeaders.some(header => header.name === 'request-server-log');
    if (!existsServerLog) {
        if (localStorage.serverlog_activeOn === 'on' || typeof localStorage.serverlog_activeOn === 'undefined') {
            details.requestHeaders.push({
                name: 'request-server-log',
                value: 'enabled'
            });
        }
    }
    return { requestHeaders: details.requestHeaders };
}, { urls: ['<all_urls>'] }, ['blocking', 'requestHeaders']);

