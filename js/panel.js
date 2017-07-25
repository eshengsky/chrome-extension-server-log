(function() {
    var getEl = document.querySelector.bind(document);

    chrome.storage.sync.get('serverlog_record', function (data) {
        var serverlog_record = data['serverlog_record'];
        var recordEl = getEl('#record');
        if (!serverlog_record || serverlog_record === 'true') {
            recordEl.classList.add('active');
            recordEl.title = '关闭监听';
        } else {
            recordEl.classList.remove('active');
            recordEl.title = '开启监听';
        }
    });

    getEl('#record').addEventListener('click', function() {
        if (this.classList.contains('active')) {
            this.classList.remove('active');
            this.title = '开启监听';
            chrome.storage.sync.set({"serverlog_record": "false"});
        } else {
            this.classList.add('active');
            this.title = '关闭监听';
            chrome.storage.sync.set({"serverlog_record": "true"});
        }
    });

    getEl('#clear').addEventListener('click', function() {
        getEl('#logs').innerHTML = '';
    });

    var filterLogs = function() {
        var keyword = getEl('#search').value.replace(/(^\s*)|(\s*$)/g, "");
        var selectLevel = getEl('#level').value;
        var hiddenCount = 0;
        document.querySelectorAll('#logs li').forEach(function(li) {
            var matchLevel = true;
            var logLevel = li.classList.length > 0 ? li.classList[0] : 'info';
            switch(selectLevel) {
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
            }
            if (li.innerHTML.indexOf(keyword) >= 0 && matchLevel) {
                li.style.display = '';
            } else {
                li.style.display = 'none';
                hiddenCount++;
            }
        });
        if (hiddenCount > 0) {
            getEl('#hiddens').innerHTML = hiddenCount + '条日志被筛选隐藏';
        } else {
            getEl('#hiddens').innerHTML = '';
        }
    }

    getEl('#search').addEventListener('input', function() {
        filterLogs();
    });

    getEl('#level').addEventListener('change', function() {
        filterLogs();
    });

    getEl('#cbScroll').addEventListener('change', function() {
        if (this.checked) {
            chrome.storage.sync.set({"serverlog_scroll": "true"});
        } else {
            chrome.storage.sync.set({"serverlog_scroll": "false"});
        }
    });
}());