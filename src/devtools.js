var PanelWindow;
chrome.devtools.network.onRequestFinished.addListener(requestHandler);
function requestHandler(request) {
    if (!PanelWindow) {
        return;
    }
    try {
        var headers = request.response.headers;

        // 响应头是否包含 X-Server-Log
        var headerLog = headers.filter(function (item) {
            // HTTP 下是 X-Server-Log，HTTPS 下会自动变成 x-server-log，所以要忽略大小写
            return item.name.toLowerCase() === 'x-server-log'
        });

        var logArr,
            fragment,
            html = '';

        var keyword = PanelWindow.document.querySelector('#search').value.replace(/(^\s*)|(\s*$)/g, "");
        var selectLevel = PanelWindow.document.querySelector('#level').value;

        // 开启监听才继续
        chrome.storage.sync.get('serverlog_record', function (data) {
            try {
                var record = data['serverlog_record'];
                if ((!record || record === 'true') && headerLog.length > 0) {
                    logArr = JSON.parse(decodeURIComponent(headerLog[0].value));
                    fragment = document.createDocumentFragment();
                    logArr.forEach(function (logObj) {
                        var child = document.createElement('div');
                        var msgArr = logObj.message;
                        var msgStr = '';
                        var type = logObj.type ? logObj.type.toLowerCase() : 'info';

                        // 将数组转为字符串形式显示
                        msgArr.forEach(function (msg) {
                            // 错误对象
                            if (msg.message && msg.stack) {
                                if (msg.stack.indexOf(msg.message) >= 0) {
                                    msgStr += msg.stack.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')
                                } else {
                                    msgStr += msg.message + '<br>' + msg.stack.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')
                                }
                            } else if (typeof msg === 'object') {
                                msgStr += JSON.stringify(msg);
                            } else {
                                msgStr += msg;
                            }
                            msgStr += ' ';
                        });

                        // 将链接包装成a标签
                        msgStr = msgStr.replace(/(https?:\/\/|www\.)\S+/g, function (url) {
                            return '<a href="' + url + '" target="_blank">' + url + '</a>'
                        });

                        var icon = 'fa-info-circle';
                        switch (type) {
                            case 'warn':
                                icon = 'fa-warning';
                                break;
                            case 'error':
                                icon = 'fa-times-circle';
                                break;
                        }

                        // 显示隐藏状态判断
                        var matchLevel = true;
                        switch (selectLevel) {
                            case 'warn':
                                if (type !== 'warn' && type !== 'error') {
                                    matchLevel = false;
                                }
                                break;
                            case 'error':
                                if (type !== 'error') {
                                    matchLevel = false;
                                }
                                break;
                        }
                        var style = '';
                        if ((logObj.time.indexOf(keyword) >= 0 
                            || logObj.type.indexOf(keyword) >= 0
                            || (logObj.category || '').indexOf(keyword) >= 0
                            || msgStr.indexOf(keyword) >= 0) 
                            && matchLevel) {
                            style = '';
                        } else {
                            style = 'display: none;';
                        }

                        var html = [
                            '<li class="' + type + '" style="' + style + '">',
                            '<i class="fa ' + icon + ' fa-fw"></i>',
                            '<span class="time">[' + logObj.time + ']</span> ',
                            '<span class="type">[' + logObj.type + ']</span> '
                        ];

                        if (logObj.category) {
                            html.push(
                                '<span class="category">' + logObj.category + '</span> ');
                        }

                        html.push(
                            '<span class="split">- </span>',
                            '<span class="message">' + msgStr + '</span>',
                            '</li>');

                        child.innerHTML = html.join('');
                        child = child.firstChild;
                        fragment.appendChild(child);
                    });

                    setTimeout(function () {
                        var logsDom = PanelWindow.document.querySelector('#logs');
                        // 将片段插入dom树
                        logsDom.appendChild(fragment);

                        // 超过最大日志数后移除最开始的日志
                        var maxLogs = 999;
                        var totalNodes = logsDom.childElementCount;
                        if (totalNodes > maxLogs) {
                            for (var i = 0; i < (totalNodes - maxLogs); i++) {
                                logsDom.removeChild(logsDom.children[0]);
                            }
                        }

                        // 设置当前日志数
                        PanelWindow.document.querySelector('#total-count').textContent = totalNodes;

                        var hiddenCount = 0;
                        var lis = Array.prototype.slice.call(PanelWindow.document.querySelectorAll('#logs li'));
                        lis.forEach(function (li) {
                            if (li.style.display === 'none') {
                                hiddenCount++;
                            }
                        });
                        if (hiddenCount > 0) {
                            PanelWindow.document.querySelector('#filter-info').textContent = hiddenCount + '条日志被筛选隐藏';
                        } else {
                            PanelWindow.document.querySelector('#filter-info').textContent = '';
                        }

                        // 自动滚屏
                        chrome.storage.sync.get('serverlog_scroll', function (data) {
                            var isScroll = data['serverlog_scroll'];
                            if (!isScroll || isScroll === 'true') {
                                PanelWindow.scrollTo(0, PanelWindow.document.body.scrollHeight);
                            }
                        });
                    }, 0)
                }
            } catch (e) {
                alert(e)
            }
        });
    } catch (e) {
        alert(e);
    }
}

chrome.devtools.panels.create("Server Log",
    "",
    "panel.html",
    function (panel) {
        panel.onShown.addListener(function (panelWindow) {
            PanelWindow = panelWindow;
        });
    });