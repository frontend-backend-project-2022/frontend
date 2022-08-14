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
          <el-button text>
            <img class="utils-icon" src="../assets/run.png" />
          </el-button>
          <el-button text>
            <img class="utils-icon" src="../assets/debug.png" />
          </el-button>
          <el-button text style="margin-left: 4px;">
            <img class="utils-icon" src="../assets/stop.png" />
          </el-button>
          <el-button text style="margin-left: 4px;">
            <img class="utils-icon" src="../assets/config.png" />
          </el-button>
        </span>
      </el-row>
    </el-header>

    <el-container>

      <el-aside width="300px">
        <el-row justify="space-between" style="padding-right: 4px;">
          <span class="fs-title">
            文件资源管理器
          </span>
          <el-space :size="0">
            <el-button text>
              <img class="file-utils-icon" src="../assets/refresh.png" />
            </el-button>
            <el-button text>
              <img class="file-utils-icon" src="../assets/new-file.png" />
            </el-button>
            <el-button text>
              <img class="file-utils-icon" src="../assets/new-folder.png" />
            </el-button>
            <el-button text>
              <img class="file-utils-icon" src="../assets/download.png" />
            </el-button>
            <el-button text>
              <img class="file-utils-icon" src="../assets/upload.png" />
            </el-button>

          </el-space>
        </el-row>

        <el-divider class="fs-divider"></el-divider>

        <el-tree :data="filesData" highlight-current indent="8" @contextmenu.prevent="">
          <template #default="{ node }">

            <el-popover ref="popover" :width="100" trigger="contextmenu">
              <template #reference>
                <span class="custom-tree-node">
                  <el-image :src="getFileIconUrl(node)" />
                  <span>{{ node.label }}</span>
                </span>
              </template>
              <el-space class="file-contextmenu" :size="0" direction="vertical">
                <el-button text>重命名</el-button>
                <el-button text>删除</el-button>
              </el-space>

            </el-popover>

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
              <el-input v-model="outputData" type="textarea" readonly resize="none"
                :rows="10" />
            </el-tab-pane>
            <el-tab-pane name="调试">
              <template #label>
                <img class="bottom-shell-icon" src="../assets/debug-black.png" />
                调试
              </template>
              <template #default>
                <el-input v-model="debugOutputData" type="textarea" readonly resize="none"
                :rows="8" />
              <el-input v-model="debugInputData">
                <template #append>
                  <el-button type="primary">
                    发送指令
                  </el-button>
                </template>
              </el-input>
              </template>

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
      },
      outputData: '1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n',
      debugOutputData: '1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n',
      debugInputData: 'qwq'
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
  margin: 0;
  padding-left: 4px;
  padding-right: 4px;
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
  padding-top: 6px;
  padding-left: 12px;
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

.custom-tree-node {
  width: 100%;
  text-align: left;
}

.custom-tree-node > .el-image {
  height: 16px;
  margin-right: 4px;
}

.file-utils-icon {
  height: 20px;
}

.el-textarea, .el-input {
  --el-input-border-radius: none;
}
</style>

<!-- no scoped part -->
<style>
.el-tabs__header {
  margin: 0;
}

.editor-tabs .el-tabs__header {
  border-bottom: 0;
}

.el-popover.el-popper {
  padding: 0;
}

.file-contextmenu,
.file-contextmenu>.el-space__item,
.file-contextmenu>.el-button {
  width: 100%;
}
</style>
