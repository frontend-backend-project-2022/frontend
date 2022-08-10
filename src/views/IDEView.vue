<template>
  <el-container class="top-container">
    <el-header>
      <el-row justify="space-between">
        <span>
          <el-icon size="32px" class="home-icon" ><HomeFilled /></el-icon>
          <h1 class="project-title">
            工程名称：{{ projectInfo.projectname }}
          </h1>
        </span>
        <span>
          <img class="utils-icon" src="../assets/run.png"/>
          <img class="utils-icon" src="../assets/debug.png"/>
          <img class="utils-icon" src="../assets/stop.png"/>
          <el-divider direction="vertical" />
          <img class="utils-icon" src="../assets/config.png"/>
        </span>
      </el-row>
    </el-header>
    <el-container>
      <el-aside width="300px">文件结构</el-aside>
      <el-container>
        <el-main>
          <MonacoEditor v-model:data="editorText" language="python" id="monaco-editor"/>
        </el-main>
        <el-footer>Shell，运行结果，Debug Shell（可弹出）</el-footer>
      </el-container>
    </el-container>
  </el-container>
</template>

<script>
import MonacoEditor from '@/components/MonacoEditor.vue'

export default {
  data () {
    return {
      containerid: '',
      projectInfo: {},
      editorText: 'from flask import Flask\nfrom flask_cors import CORS\nfrom views.docker import *\nfrom views.database import *\nfrom views.login import login_bp\n\n\n\napp = Flask(__name__, template_folder="templates")\napp.register_blueprint(docker_bp, url_prefix="/docker")\napp.register_blueprint(database_bp, url_prefix="/database")\napp.register_blueprint(login_bp, url_prefix="/login")\n\napp.config["SECRET_KEY"] = "secret!qwq"\n# CSRFProtect(app)\nCORS(app, supports_credentials=True)\n\n# python language server: websocket\nfrom views.pyls import sock\nsock.init_app(app)\n\n# xterm.js\nfrom views.xterm import socketio\nsocketio.init_app(app)\n\n\n@app.route("/")\ndef hello_world():\n    return "<p>Hello, World!</p>"\n\ndb_init()\n# id = docker_connect()\n# docker_exec_bash(id,"mkdir dir1 && mkdir dir2 && touch file2 && cd dir1 && touch file1 && mkdir dir3")\n# docker_getdir(id)\n# docker_rm(id)\n# id = put_test()\n# get_test(id)\n\n# docker_rm(id)\n\nif __name__ == "__main__":\n    app.run(debug=True)\n'
    }
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
  }
}
</script>

<style scoped>
.top-container {
  height: 100vh;
  box-sizing: border-box;
  background: #F9F9F9;
  letter-spacing: 1px;
}

.el-aside,
.el-footer,
.el-header,
.el-main{
  border: solid
}

.el-main {
  padding: 0;
}

.project-title {
  display: inline;
  margin-left: 12px;
}

.home-icon {
  margin-top: 12px;
}

.utils-icon {
  width: 32px;
  margin-top: 12px;
  margin-right: 4px;
}
</style>
