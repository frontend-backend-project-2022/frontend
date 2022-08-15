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
            <el-button text @click="getFileSystemData">
              <img class="file-utils-icon" src="../assets/refresh.png" />
            </el-button>

            <el-popover placement="top-start" :width="250" v-model:visible="newFilePopoverVisible">
              <template #reference>
                <el-button text>
                  <img class="file-utils-icon" src="../assets/new-file.png" />
                </el-button>
              </template>
              <template #default>
                <el-input v-model="newFilename" placeholder="请输入新文件名">
                  <template #append>
                    <el-button type="primary" @click="createNewFile">
                      创建
                    </el-button>
                  </template>
                </el-input>
              </template>
            </el-popover>

            <el-popover placement="top-start" :width="250" v-model:visible="newFolderPopoverVisible">
              <template #reference>
                <el-button text>
                  <img class="file-utils-icon" src="../assets/new-folder.png" />
                </el-button>
              </template>
              <template #default>
                <el-input v-model="newFoldername" placeholder="请输入新文件夹名称">
                  <template #append>
                    <el-button type="primary" @click="createNewFolder">
                      创建
                    </el-button>
                  </template>
                </el-input>
              </template>
            </el-popover>

            <el-button text @click="downloadFolder">
              <img class="file-utils-icon" src="../assets/download.png" />
            </el-button>

            <el-upload v-model:file-list="uploadFileList" :http-request="uploadFileXHR" :show-file-list="false">
              <el-button text>
                <img class="file-utils-icon" src="../assets/upload.png" />
              </el-button>
            </el-upload>

          </el-space>
        </el-row>

        <el-divider class="fs-divider"></el-divider>

        <el-tree ref="file-tree" :data="filesData" highlight-current indent="8" @contextmenu.prevent="" draggable
          @current-change="handleFileTreeCurrentChange">
          <template #default="{ node }">

            <el-popover ref="popover" :width="50" trigger="contextmenu" v-model:visible="node.contextmenuVisible">
              <template #reference>
                <span class="custom-tree-node">
                  <el-image :src="getFileIconUrl(node)" />
                  <span>{{ node.label }}</span>
                </span>
              </template>
              <el-space class="file-contextmenu" :size="0" direction="vertical">

                <el-popover placement="top-end" :width="250" v-model:visible="node.renamePopoverVisible">
                  <template #reference>
                    <el-button text>重命名</el-button>
                  </template>
                  <template #default>
                    <el-input v-model="renameNewName" placeholder="请输入新文件名">
                      <template #append>
                        <el-button type="primary" @click="renameFile(node)">
                          重命名
                        </el-button>
                      </template>
                    </el-input>
                  </template>
                </el-popover>

                <el-button text v-if="!node.data.isDir" @click="downloadFile(node)">下载</el-button>

                <el-popconfirm popper-class="el-popover delete-file-popconfirm" style="padding: 0;" title="确定要删除吗？"
                  confirm-button-text="确定" cancel-button-text="取消" icon="WarningFilled"
                  @confirm="deleteFileOrFolder(node)">
                  <template #reference>
                    <el-button text type="danger">删除</el-button>
                  </template>
                </el-popconfirm>

              </el-space>
            </el-popover>

          </template>
        </el-tree>

        <!-- hidden link for download -->
        <el-link ref="download-link" :href="downloadLinkData.href" :download="downloadLinkData.download"></el-link>

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
              <el-input v-model="outputData" type="textarea" readonly resize="none" :rows="10" />
            </el-tab-pane>
            <el-tab-pane name="调试">
              <template #label>
                <img class="bottom-shell-icon" src="../assets/debug-black.png" />
                调试
              </template>
              <template #default>
                <el-input v-model="debugOutputData" type="textarea" readonly resize="none" :rows="8" />
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
      editorText: 'from flask import Flask\n',
      filesData: [],
      fileTreeCurrentFileData: '',
      newFilename: '',
      newFilePopoverVisible: false,
      newFoldername: '',
      newFolderPopoverVisible: false,
      renameNewName: '',
      downloadLinkData: {
        href: '',
        download: ''
      },
      uploadFileList: [],
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
    this.initXtermTerimial()
  },
  components: {
    MonacoEditor
  },
  async created () {
    this.containerid = this.$route.params.containerid
    await Promise.all([this.getContainerData(), this.getFileSystemData()])
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
      if (this.footerExpanded === false) {
        this.footerExpanded = true
      } else {
        if (pane.active) {
          this.footerExpanded = false
        }
      }
    },
    getFileIconUrl (node) {
      let filetype = 'file'
      if ('children' in node.data) { // folder
        filetype = 'folder'
      } else if (node.label.endsWith('.py')) {
        filetype = 'python'
      } else if (node.label.endsWith('.cpp')) {
        filetype = 'cpp'
      }
      return this.FileTypeIconUrlSet[filetype]
    },
    initXtermTerimial () {
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
      socket.emit('connectSignal', this.containerid, () => {
      })
      socket.on('response', (data) => {
        term.write(data)
      })
    },
    transferRawFilesData (rawData, prefix) {
      const result = []
      for (const [label, childData] of Object.entries(rawData)) {
        const fileObject = {
          label: label,
          url: prefix + label,
          isDir: false,
          contextmenuVisible: false,
          renamePopoverVisible: false
        }
        if (childData !== '') {
          fileObject.isDir = true
          fileObject.children = this.transferRawFilesData(childData, prefix + label + '/')
        }
        result.push(fileObject)
      }
      // folder go first.
      result.sort((a, b) =>
        (('children' in b) - ('children' in a)))
      return result
    },
    getContainerData () {
      return this.$axios.get(`/api/database/getProject/${this.containerid}`)
        .then((response) => {
          this.projectInfo = response.data
        })
    },
    getFileSystemData () {
      return this.$axios.get(`/api/docker/getdir/${this.containerid}`)
        .then((response) => {
          console.log(response.data)
          this.filesData = this.transferRawFilesData(response.data, './')
        })
    },
    handleFileTreeCurrentChange (nodeData, node) {
      this.fileTreeCurrentFileData = nodeData
    },

    createNewFile () {
      this.$axios.post('/api/docker/createFile/', {
        dir: this.currentDir,
        filename: this.newFilename,
        containerid: this.containerid
      }).finally(() => {
        this.newFilename = ''
        this.getFileSystemData()
        this.newFilePopoverVisible = false
      })
    },
    createNewFolder () {
      this.$axios.post('/api/docker/createFolder/', {
        dir: this.currentDir + '/' + this.newFoldername,
        containerid: this.containerid
      }).finally(() => {
        this.newFoldername = ''
        this.getFileSystemData()
        this.newFilePopoverVisible = false
      })
    },
    downloadFile (node) {
      const dir = node.data.url
        .split('/').slice(0, -1).join('/')
      this.downloadLinkData.href = `/api/docker/downloadFile/?dir=${dir}&containerid=${this.containerid}&filename=${node.label}`
      this.downloadLinkData.download = node.label

      setTimeout(() => {
        this.$message.success('开始下载')
        this.$refs['download-link'].$el.click()
        node.contextmenuVisible = false
      }, 0)
    },
    downloadFolder () {
      this.downloadLinkData.href = `/api/docker/downloadFolder/?dir=.&containerid=${this.containerid}`
      this.downloadLinkData.download = 'project.tar'

      setTimeout(() => {
        this.$message.success('开始下载')
        this.$refs['download-link'].$el.click()
      }, 0)
    },
    deleteFileOrFolder (node) {
      let deleteTask
      if (node.data.isDir) {
        const dir = node.data.url
        deleteTask = this.$axios.delete('/api/docker/deleteFolder/', {
          data: {
            dir: dir,
            containerid: this.containerid
          }
        })
      } else {
        const dir = node.data.url
          .split('/').slice(0, -1).join('/')
        deleteTask = this.$axios.delete('/api/docker/deleteFile/', {
          data: {
            dir: dir,
            filename: node.label,
            containerid: this.containerid
          }
        })
      }
      deleteTask.finally(() => {
        this.getFileSystemData()
      })
    },
    renameFile (node) {
      const dir = node.data.url
        .split('/').slice(0, -1).join('/')
      this.$axios.post('/api/docker/renameFile/', {
        dir: dir,
        filename: node.label,
        newname: this.renameNewName,
        containerid: this.containerid
      }).finally(() => {
        node.renamePopoverVisible = false
        node.contextmenuVisible = false
        this.getFileSystemData()
      })
    },
    uploadFileXHR (options) {
      const formData = new FormData()
      formData.append('file', options.file)
      formData.append('dir', this.currentDir)
      formData.append('containerid', this.containerid)

      this.$axios.post('/api/docker/uploadFile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(() => {
        this.getFileSystemData()
      })
    }
  },
  computed: {
    currentDir () {
      if (this.fileTreeCurrentFileData === '') {
        return '.'
      } else {
        if (this.fileTreeCurrentFileData.isDir) { return this.fileTreeCurrentFileData.url } else {
          return this.fileTreeCurrentFileData.url
            .split('/').slice(0, -1).join('/')
        }
      }
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

.custom-tree-node>.el-image {
  height: 16px;
  margin-right: 4px;
}

.file-utils-icon {
  height: 20px;
}

.el-textarea,
.el-input {
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

.delete-file-popconfirm.el-popover.el-popper {
  padding: 12px;
}

.file-contextmenu,
.file-contextmenu>.el-space__item,
.file-contextmenu>.el-button {
  width: 100%;
}
</style>
