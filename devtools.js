let PanelWindow;
const pageRefs = [];
chrome.devtools.network.onRequestFinished.addListener(requestHandler);

function requestHandler(request) {
    if (!PanelWindow) {
        return;
    }
    try {
        const headers = request.response.headers;

        // 响应头是否包含 X-Server-Log
        const headerLog = headers.filter(item =>

            // HTTP 下是 X-Server-Log，HTTPS 下会自动变成 x-server-log，所以要忽略大小写
            item.name.toLowerCase() === 'x-server-log');

        let logArr,
            fragment,
            html = '';

        const keyword = PanelWindow.document.querySelector('#search')
            .value.replace(/(^\s*)|(\s*$)/g, '');
        const selectLevel = PanelWindow.document.querySelector('.level-wrap .active')
            .id;

        // 开启监听才继续
        try {
            const record = localStorage.serverlog_activeOn;
            if ((typeof record === 'undefined' || record === 'on') && headerLog.length > 0) {
                logArr = JSON.parse(decodeURIComponent(headerLog[0].value));
                fragment = document.createDocumentFragment();

                // 保持日志
                const currentPage = request.pageref;
                if (pageRefs.indexOf(currentPage) === -1) {
                    pageRefs.push(currentPage);
                    const preserveOn = PanelWindow.document.querySelector('#check-preserve').checked;
                    if (!preserveOn) {
                        // 清除当前日志
                        PanelWindow.document.querySelector('#logs').innerHTML = '';
                        PanelWindow.document.querySelector('#total-count').textContent = '0';
                        PanelWindow.document.querySelector('#filter-info').textContent = '';
                    }
                }

                logArr.forEach(logObj => {
                    let child = document.createElement('div');
                    const msgArr = logObj.message;
                    let msgStr = '';
                    const type = logObj.type ? logObj.type.toLowerCase() : 'info';
                    const category = logObj.category ? logObj.category : '';

                    // 将数组转为字符串形式显示
                    msgArr.forEach(msg => {
                        // 错误对象
                        if (msg && msg.message && msg.stack) {
                            if (msg.stack.indexOf(msg.message) >= 0) {
                                msgStr += msg.stack.replace(/\n/g, '<br>')
                                    .replace(/ /g, '&nbsp;');
                            } else {
                                msgStr += `${msg.message}<br>${msg.stack.replace(/\n/g, '<br>')
                                    .replace(/ /g, '&nbsp;')}`;
                            }
                        } else if (typeof msg === 'object') {
                            msgStr += JSON.stringify(msg);
                        } else {
                            msgStr += msg;
                        }
                        msgStr += ' ';
                    });

                    // 将链接包装成a标签
                    msgStr = msgStr.replace(/(https?:\/\/|www\.)\S+/g, url => `<a href="${url}" target="_blank">${url}</a>`);

                    // 超过一定时长的请求加重显示
                    const tooSlow = 2000;
                    msgStr = msgStr.replace(/请求耗时: (\d+)ms/g, (m, s1) => {
                        if (Number(s1) >= tooSlow) {
                            return `请求耗时: <span style="color: #f80; font-weight: bold;">${s1}ms</span>`;
                        } else {
                            return m;
                        }
                    });

                    // 判断 level
                    let matchLevel = true;
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
                        default:
                    }

                    let style = '';
                    if ((logObj.time.indexOf(keyword) >= 0 ||
                        logObj.type.indexOf(keyword) >= 0 ||
                        (logObj.category || '')
                            .indexOf(keyword) >= 0 ||
                        msgStr.indexOf(keyword) >= 0) &&
                        matchLevel) {
                        style = '';
                    } else {
                        style = 'display: none;';
                    }

                    const html = [
                        `<li class="${type} log-li" style="${style}">`,
                        `<span class="log-content"><span class="time">[${logObj.time}]</span> `,
                        `<span class="type">[${logObj.type}]</span> `
                    ];

                    if (logObj.category) {
                        html.push(
                            `<span class="category">${logObj.category}</span> `);
                    }

                    html.push(
                        '<span class="split">- </span>',
                        `<span class="message">${msgStr}</span></span>`,
                        `<button class="copy" title="复制">复制</button>`,
                        '</li>');

                    child.innerHTML = html.join('');
                    child = child.firstChild;
                    fragment.appendChild(child);
                });

                setTimeout(() => {
                    const logsDom = PanelWindow.document.querySelector('#logs');

                    // 将片段插入dom树
                    logsDom.appendChild(fragment);

                    // 超过最大日志数后移除最开始的日志
                    const maxLogs = 9999;
                    const totalNodes = logsDom.querySelectorAll('.log-li').length;
                    if (totalNodes > maxLogs) {
                        for (let i = 0; i < (totalNodes - maxLogs); i++) {
                            logsDom.removeChild(logsDom.children[0]);
                        }
                    }

                    // 设置当前日志数
                    PanelWindow.document.querySelector('#total-count')
                        .textContent = totalNodes;

                    let hiddenCount = 0;
                    const lis = Array.prototype.slice.call(PanelWindow.document.querySelectorAll('#logs li.log-li'));
                    lis.forEach(li => {
                        if (li.style.display === 'none') {
                            hiddenCount++;
                        }
                    });

                    // 没有筛选结果时提示
                    if (totalNodes > 0 && totalNodes === hiddenCount) {
                        PanelWindow.document.querySelector('#no-data').style.display = 'block';
                    } else {
                        PanelWindow.document.querySelector('#no-data').style.display = 'none';
                    }

                    if (hiddenCount > 0) {
                        PanelWindow.document.querySelector('#filter-info')
                            .textContent = `（${hiddenCount}条日志被筛选隐藏）`;
                    } else {
                        PanelWindow.document.querySelector('#filter-info')
                            .textContent = '';
                    }

                    // 自动滚屏
                    const scollOn = PanelWindow.document.querySelector('#check-scroll').checked;
                    if (scollOn) {
                        PanelWindow.scrollTo(0, PanelWindow.document.body.scrollHeight);
                    }
                }, 0);
            }
        } catch (e) {
            alert(e);
        }
    } catch (e) {
        alert(e);
    }
}

chrome.devtools.panels.create('ServerLog',
    '',
    'panel.html',
    panel => {
        panel.onShown.addListener(panelWindow => {
            PanelWindow = panelWindow;
        })
    });
