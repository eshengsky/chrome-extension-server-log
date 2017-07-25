<a href="https://github.com/eshengsky/chrome-extension-server-log/"><img src="https://github.com/eshengsky/chrome-extension-server-log/blob/master/icon.png" height="120" align="right"></a>

# chrome-extension-server-log

Chrome 浏览器扩展插件，用于在 F12 中查看服务器端的日志。

* 支持任意服务器类型，Node.js、Asp.Net、JSP、PHP 等均可；
* 支持 3 种日志级别：Info，Warn，Error；
* 自动识别并将日志中的 URL 包装为链接。

## 预览

![image](https://github.com/eshengsky/chrome-extension-server-log/blob/master/screenshot.png)

## 安装

* 打开 Chrome 浏览器，在地址栏输入 `chrome://extensions/` 进入 Chrome 扩展页面，勾选"开发者模式"。
* 将下载后的 `dist/server-log.src` 文件拖到页面中，点击"添加扩展程序"按钮。
* 按 F12 打开开发者工具，点击 `Server Log` 面板，后端日志将会展示在这里。

## 原理

服务器端按照 [约定](#约定)，将日志插入响应头 `X-Server-Log` 中；

扩展会监听 Network 中接收到的网络请求，当发现请求的响应头中包含 `X-Server-Log`，则进行解析并将得到的日志信息输出到 `Server Log` 面板中。

## 约定

服务器端可以使用任何语言或技术，只需要遵循如下约定：

1. 日志集合必须是一个数组，该数组又对象组成，每一个对象代表一条日志，对面必须包含 `time`、`type`、`message` 3个属性，分别表示时间、日志级别（info、warn、error）、日志内容，日志内容也需要是一个数组。

    示例：
    ```js
    [{
        "time": "2017-07-01 09:30:00.200",
        "type": "info",
        "message": ["hello", "world"]
    }, {
        "time": "2017-07-01 09:30:01.300",
        "type": "error",
        "message": ["error occurs！"]
    }]
    ```

1. 将上述数组（JSON）转为字符串类型，并进行编码。

    示例（JavaScript）：
    ```js
    const result = encodeURIComponent(JSON.stringify(logArr));
    ```

1. 将上述结果放入响应头 `X-Server-Log` 中。

## 后端示例

[这里](https://github.com/eshengsky/chrome-extension-node-demo/) 提供了一个简单的基于 Node.js 的后端实现，可供参考。

## 许可
MIT License

Copyright (c) 2017 孙正华

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
