# FrontEnd

要查看Xterm.js Demo，请先在`localhost:5000`运行后端。

## 启动前端开发服务器
```shell
yarn install
yarn serve
```

## Monaco Editor Demo
`./python-language-server`是一个展示用Python语言服务器后端，欲查看Monaco Editor Demo，请先运行该后端
```shell
cd python-language-server
pip install -r requirements.txt
python langserver_ext.py
```
后端运行后，访问[localhost:3001/python](http://localhost:3001/python)可以看到`Can "Upgrade" only to "WebSocket".`

之后访问前端的Editor Demo页面，可以看到Python后端的效果（未启动后端时只有语法高亮，启动后有代码自动补全、格式化等功能）