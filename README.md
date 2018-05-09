<a href="https://github.com/eshengsky/chrome-extension-server-log/"><img src="https://github.com/eshengsky/chrome-extension-server-log/blob/master/icon.png" height="120" align="right"></a>

# chrome-extension-server-log

Chrome 浏览器扩展插件，用于在 F12 中查看服务器端的日志。  

* 支持任意服务器类型，Node.js、Asp.Net、JSP、PHP 等均可。
* 支持 3 种日志级别：Info，Warn，Error。
* 支持快速复制日志。
* 自动识别并将日志中的 URL 包装为链接。

## 预览

![image](https://raw.githubusercontent.com/eshengsky/chrome-extension-server-log/master/preview.png)

## 安装

1. 打开 Chrome 浏览器，在地址栏输入 `chrome://extensions/` 进入 Chrome 扩展页面，勾选"开发者模式"；
1. 将下载后的源码文件夹拖到页面中，点击"添加扩展程序"按钮；
1. 按 F12 打开开发者工具，点击 `ServerLog` 面板，后端日志将会展示在这里。

## 原理

服务器端按照 [约定](#约定)，将日志插入响应头 `X-Server-Log` 中；

扩展会监听 Network 中接收到的网络请求，当发现请求的响应头中包含 `X-Server-Log`，则进行解析并将得到的日志信息输出到开发者工具的 `ServerLog` 面板中。

## 约定

服务器端可以使用任何语言或技术，只需要遵循如下约定：

<<<<<<< HEAD
1. 日志集合必须是一个数组，该数组元素为对象，每一个对象代表一条日志，对象必须包含 `time`、`type`、`message` 3个属性，分别表示时间、日志级别（info、warn、error）、日志内容，日志内容也需要是一个数组。
=======
1. 日志集合必须是一个数组，该数组的元素类型为对象，每一个对象代表一条日志，对象必须包含 `time`、`type`、`message` 3个属性，分别表示时间、日志级别（info、warn、error）、日志内容，日志内容也需要是一个数组。
>>>>>>> 94fae0c3156f73ca4fb0d94d61a3dc23d49f0e72

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

1. 数组需要转为字符串类型，并进行编码。

    示例（JavaScript）：
    ```js
    const result = encodeURIComponent(JSON.stringify(logArr));
    ```

1. 上述结果需要放在响应头 `X-Server-Log` 中。

## 后端示例

[这里](https://github.com/eshengsky/chrome-extension-log-node-demo/) 提供了一个简单的基于 Node.js 的后端实现，可供参考。

## 许可
MIT License

Copyright (c) 2018 孙正华

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
