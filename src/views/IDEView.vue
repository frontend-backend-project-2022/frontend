<template>
  <el-container class="top-container">

    <el-header>
      <el-row justify="space-between" align="middle" style="height: 100%;">
        <span>
          <el-button text @click="$router.push('/')">
            <img class="home-icon" src="../assets/home.png" />
          </el-button>
        </span>
        <span>
          <img class="utils-icon" src="../assets/run.png" />
          <img class="utils-icon" src="../assets/debug.png" />
          <img class="utils-icon" style="margin-left: 10px;" src="../assets/stop.png" />
          <el-divider class="utils-divider" direction="vertical" />
          <img class="utils-icon" src="../assets/config.png" />
        </span>
      </el-row>
    </el-header>

    <el-container>

      <el-aside width="300px">
        <span class="fs-title">
          文件资源管理器
        </span>
        <el-divider class="fs-divider"></el-divider>
        <el-tree :data="filesData" highlight-current indent="8">
          <template #default="{ node }">
            <span class="custom-tree-node">
              <img :src="getFileIconUrl(node)"/>
              <span>{{ node.label }}</span>
            </span>
          </template>
        </el-tree>
      </el-aside>

      <el-container>
        <el-header class="editor-header" height="20px">
          <el-tabs type="card" class="editor-tabs" v-model="nowActiveFileTab" closable>
            <el-tab-pane name="qwq" label="main.py"></el-tab-pane>
            <el-tab-pane name="f" label="requirements.txt"></el-tab-pane>
          </el-tabs>
        </el-header>

        <el-main>
          <MonacoEditor ref="editor" v-model:data="editorText" language="python" id="monaco-editor" />
        </el-main>

        <el-footer ref="footer" :class="{ 'footer-expanded': footerExpanded }">
          <el-tabs type="card" class="demo-tabs" v-model="nowActiveTab" @tab-click="handleTabClick">
            <el-tab-pane name="终端">
              <template #label>
                <img class="bottom-shell-icon" src="../assets/terminal.png" />
                终端
              </template>
              <div id="xterm-container" style=""></div>
            </el-tab-pane>
            <el-tab-pane name="输出">
              <template #label>
                <img class="bottom-shell-icon" src="../assets/printer.png" />
                输出
              </template>
              TODO: 输出结果框
            </el-tab-pane>
            <el-tab-pane name="调试">
              <template #label>
                <img class="bottom-shell-icon" src="../assets/debug-black.png" />
                调试
              </template>
              TODO: 调试界面
            </el-tab-pane>
          </el-tabs>
        </el-footer>

      </el-container>
    </el-container>
  </el-container>
</template>

<script>
import MonacoEditor from '@/components/MonacoEditor.vue'

import * as xterm from 'xterm'
import 'xterm/css/xterm.css'
import 'xterm/lib/xterm.js'
import { FitAddon } from 'xterm-addon-fit'
import { io } from 'socket.io-client'

export default {
  data () {
    return {
      containerid: '',
      projectInfo: {},
      editorText: 'from flask import Flask\nfrom flask_cors import CORS\nfrom views.docker import *\nfrom views.database import *\nfrom views.login import login_bp\n\n\n\napp = Flask(__name__, template_folder="templates")\napp.register_blueprint(docker_bp, url_prefix="/docker")\napp.register_blueprint(database_bp, url_prefix="/database")\napp.register_blueprint(login_bp, url_prefix="/login")\n\napp.config["SECRET_KEY"] = "secret!qwq"\n# CSRFProtect(app)\nCORS(app, supports_credentials=True)\n\n# python language server: websocket\nfrom views.pyls import sock\nsock.init_app(app)\n\n# xterm.js\nfrom views.xterm import socketio\nsocketio.init_app(app)\n\n\n@app.route("/")\ndef hello_world():\n    return "<p>Hello, World!</p>"\n\ndb_init()\n# id = docker_connect()\n# docker_exec_bash(id,"mkdir dir1 && mkdir dir2 && touch file2 && cd dir1 && touch file1 && mkdir dir3")\n# docker_getdir(id)\n# docker_rm(id)\n# id = put_test()\n# get_test(id)\n\n# docker_rm(id)\n\nif __name__ == "__main__":\n    app.run(debug=True)\n',
      filesData: [
        {
          label: 'src',
          children: [{
            label: 'main.py'
          }]
        }, {
          label: 'requirements.txt'
        }, {
          label: '1.cpp'
        }
      ],
      footerExpanded: true,
      nowActiveTab: '终端',
      nowActiveFileTab: '',
      FileTypeIconUrlSet: {
        folder: require('../assets/folder.png'),
        file: require('../assets/file.png'),
        python: require('../assets/python.png'),
        cpp: require('../assets/cpp.png')
      }
    }
  },
  mounted () {
    const term = new xterm.Terminal()
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(document.getElementById('xterm-container'))
    fitAddon.fit()

    const socket = io('http://localhost:5000')
    term.onData(chunk => {
      socket.emit('message', chunk)
    })
    term.onResize(function (evt) {
      fitAddon.fit()
    })
    socket.emit('connectSignal', 'Dave', () => {
      console.log(socket.id) // x8WIv7-mJelg7on_ALbx
    })
    socket.on('response', (data) => {
      term.write(data)
    })
  },
  components: {
    MonacoEditor
  },
  async created () {
    this.containerid = this.$route.params.containerid
    await this.$axios.get(`/api/database/getProject/${this.containerid}`)
      .then((response) => {
        this.projectInfo = response.data
      })
  },
  methods: {
    handleOpenTerminal () {
      if (this.footerExpanded === true) {
        this.footerExpanded = false
      } else {
        this.footerExpanded = true
      }
    },
    handleTabClick (pane, event) {
      console.log(this.nowActiveTab, pane, event)
      if (this.footerExpanded === false) {
        this.footerExpanded = true
      } else {
        if (pane.active) {
          this.footerExpanded = false
        }
      }
    },
    getFileIconUrl (node) {
      console.log(node.label)
      let filetype = 'file'
      if ('children' in node.data) { // folder
        filetype = 'folder'
      } else if (node.label.endsWith('.py')) {
        filetype = 'python'
      } else if (node.label.endsWith('.cpp')) {
        filetype = 'cpp'
      }
      return this.FileTypeIconUrlSet[filetype]
    }
  }
}
</script>

<style scoped>
.top-container {
  height: 100vh;
  box-sizing: border-box;
  letter-spacing: 1px;
  background: #FAFAFA;
}

.el-aside,
.el-footer,
.el-header,
.el-main {
  border: 1px solid var(--el-border-color);
  margin: 0;
  box-sizing: border-box;
}

.el-header {
  height: 50px;
}

.el-main {
  padding: 0;
}

.el-button.is-text {
  padding-left: 8px;
  margin: 0;
}

.project-title {
  display: inline;
  margin-left: 4px;

  font-family: Arial, Helvetica, sans-serif;
  font-weight: 100;
  font-size: 24px;
  letter-spacing: 2px;
  color: #606266;
}

.home-icon {
  width: 24px;
  vertical-align: -4px;
  margin-right: 4px;
}

.utils-icon {
  width: 24px;
  margin-left: 8px;
}

.utils-divider {
  vertical-align: 4px;
  margin-left: 12px;
}

.fs-divider {
  margin: 2px 0;
}

.fs-title {
  text-align: left;
  padding: 4px;
  margin: 0;
  letter-spacing: 0;
  font-family: Arial, Helvetica, sans-serif;
}

.el-tree {
  background: #FAFAFA;
  letter-spacing: 0;
  font-size: 14px;
  font-family: monospace;
}

.el-footer {
  padding: 0;
  text-align: left;
  height: 36px;
  overflow: hidden;
}

.footer-expanded {
  height: 255px;
}

.bottom-shell-container {
  height: 100%;
}

.bottom-shell-icon {
  width: 16px;
  margin-right: 4px;
}

#xterm-container {
  margin-top: 4px;
  height: 216px;
  width: 100%;

  text-align: left;
}

.editor-tabs {
  border: none;
}

.editor-header {
  padding: 0;
  height: 41px;
}
</style>

<style>
.el-tabs__header {
  margin: 0;
}

.editor-tabs .el-tabs__header {
  border-bottom: 0;
}

.custom-tree-node > img {
  height: 16px;
  margin-right: 4px;
}
</style>
