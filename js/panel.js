(function () {
    const getEl = document.querySelector.bind(document);

    getEl('#clear')
        .addEventListener('click', () => {
            getEl('#logs')
                .innerHTML = '';
            getEl('#total-count')
                .textContent = '0';
            getEl('#filter-info')
                .textContent = '';
        });

    const filterLogs = function () {
        const keyword = getEl('#search')
            .value.replace(/(^\s*)|(\s*$)/g, '');
        const selectLevel = getEl('.level-wrap .active')
            .id;
        let hiddenCount = 0;
        document.querySelectorAll('#logs li.log-li')
            .forEach(li => {
                // 判断 level
                let matchLevel = true;
                const logLevel = li.classList.length > 0 ? li.classList[0] : 'info';
                switch (selectLevel) {
                    case 'warn':
                        if (logLevel !== 'warn' && logLevel !== 'error') {
                            matchLevel = false;
                        }
                        break;
                    case 'error':
                        if (logLevel !== 'error') {
                            matchLevel = false;
                        }
                        break;
                    default:
                }

                if (li.textContent.toLowerCase()
                    .indexOf(keyword.toLowerCase()) >= 0 && matchLevel) {
                    li.style.display = '';
                } else {
                    li.style.display = 'none';
                    hiddenCount++;
                }
            });

        // 没有筛选结果时提示
        const totalCount = Number(getEl('#total-count').textContent);
        if (totalCount > 0 && totalCount === hiddenCount) {
            getEl('#no-data').style.display = 'block';
        } else {
            getEl('#no-data').style.display = 'none';
        }

        if (hiddenCount > 0) {
            getEl('#filter-info')
                .textContent = `（${hiddenCount}条日志被筛选隐藏）`;
        } else {
            getEl('#filter-info')
                .textContent = '';
        }
    };

    getEl('#search')
        .addEventListener('input', () => {
            filterLogs();
        });

    getEl('.level-wrap')
        .addEventListener('click', e => {
            const target = e.target;
            if (e.target.id) {
                document.querySelectorAll('.level-wrap div')
                    .forEach(el => el.classList.remove('active'));
                e.target.classList.add('active');
                filterLogs();
            }
        });

    getEl('#settings')
        .addEventListener('click', () => {
            chrome.tabs.create({ url: 'popup.html' });
        });

    getEl('#logs')
        .addEventListener('click', e => {
            if (e.target.classList.contains('copy')) {
                e.target.classList.remove('copy');
                e.target.classList.add('copied');
                const log = e.target.previousElementSibling.textContent;
                copyTextToClipboard(log);
                e.target.textContent = '已完成';
                setTimeout(() => {
                    e.target.textContent = '复制';
                    e.target.classList.remove('copied');
                    e.target.classList.add('copy');
                }, 800);
            }
        });

    getEl('footer')
        .addEventListener('click', e => {
            if (e.target.id === 'check-now') {
                checkUpdate();
            }
        });

    const version = `v${chrome.app.getDetails().version}`;
    getEl('#curr-version').innerHTML = version;


    function copyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.style.position = 'fixed';
        textArea.style.top = 0;
        textArea.style.left = 0;

        textArea.style.width = '2em';
        textArea.style.height = '2em';

        textArea.style.padding = 0;

        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';

        textArea.style.background = 'transparent';


        textArea.value = text;

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('复制出错了！', err);
        }

        document.body.removeChild(textArea);
    }
}());
