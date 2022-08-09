<template>
  <el-container class="top-container">
    <el-header class="blue-header">
      <h1 class="user-title">你好, {{ username }}</h1>
    </el-header>
    <el-container>
      <el-aside width="320px">
        <el-menu default-active="1" @select="handleSelect" background-color="transparent">
          <el-menu-item index="1">
            <el-icon>
              <document />
            </el-icon>
            <span>所有工程</span>
          </el-menu-item>
          <el-menu-item index="2">
            <img class="menu-icon" src="../assets/python.png" />
            <span>Python 工程</span>
          </el-menu-item>
          <el-menu-item index="3">
            <img class="menu-icon" src="../assets/cpp.png" />
            <span>C/C++ 工程</span>
          </el-menu-item>
          <el-popconfirm title="确定要登出吗？" confirm-button-text="确认" cancel-button-text="取消" confirm-button-type="danger"
            @confirm="logoutSubmit">
            <template #reference>
              <el-menu-item index="4">
                <img class="menu-icon" src="../assets/logout.png" />
                <span>登出账号</span>
              </el-menu-item>
            </template>
          </el-popconfirm>
        </el-menu>
      </el-aside>
      <el-main>
        <el-row justify="space-between">
          <h1 class="class-title" style="">工程列表</h1>
          <el-button class="add-button" type="primary" icon="plus" @click="createDialogVisible = true">
            创建新的工程
          </el-button>
        </el-row>
        <el-table size="large" :data="tableData" @row-click="handleTableRowClick">
          <el-table-column prop="projectname" label="工程名称" width="180" />
          <el-table-column prop="language" label="语言" width="180" />
          <el-table-column prop="version" label="版本" />
          <el-table-column prop="time" label="创建时间" />
        </el-table>
      </el-main>
    </el-container>
  </el-container>

  <el-dialog v-model="createDialogVisible" title="创建新的工程" width="40%">
    <el-form ref="projectForm" :model="projectForm" label-width="180px">
      <el-form-item label="工程名称" prop="projectname">
        <el-input v-model="projectForm.projectname" autocomplete="off" placeholder="请填写工程名称" />
      </el-form-item>
      <el-form-item label="语言" prop="language">
        <el-select v-model="projectForm.language" placeholder="请选择编程语言">
          <el-option label="Python" value="Python" />
          <el-option label="C/C++" value="C/C++" />
        </el-select>
      </el-form-item>
      <el-form-item label="编译器 / 解释器版本" prop="version">
        <el-select v-model="projectForm.version" placeholder="请选择版本">
          <el-option v-for="option in versionSelectOptions" :label="option" :value="option" :key="option" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="projectFormSubmit">提交</el-button>
      </span>
    </template>
  </el-dialog>

</template>

<script>
export default {
  name: 'HomeView',
  async created () {
    const getProjectList = this.$axios.get('/api/database/getAllProjects/')
      .then((response) => {
        this.rawData = response.data
      })
    const getUserName = this.$axios.get('/api/login/is_logged_in/')
      .then((response) => {
        this.username = response.data
      })
    await Promise.all([getProjectList, getUserName])
    this.tableData = this.rawData
  },
  data () {
    return {
      username: '',
      rawData: [], // raw data from backend
      createDialogVisible: false,
      projectForm: {
        projectname: '',
        language: '',
        version: ''
      },
      nowSelectingLanguage: ''
    }
  },
  methods: {
    async logoutSubmit () {
      const response = await this.$axios.get('/api/login/logout')
      if (response.status === 200) { this.$router.push('/login/') }
    },
    handleSelect (index) {
      if (index === '1') {
        this.nowSelectingLanguage = ''
      } else if (index === '2') {
        this.nowSelectingLanguage = 'Python'
      } else if (index === '3') {
        this.nowSelectingLanguage = 'C/C++'
      }
    },
    handleTableRowClick (row, column, event) {
      // TODO: to project page
      console.log(row)
    },
    async projectFormSubmit () {
      const response = await this.$axios.post('/api/database/createProject', this.projectForm)
      if (response.status === 200) {
        this.$message.success('创建工程成功')
        this.$router.go(0) // reload page
      } else {
        this.$message.error('创建工程失败', response.data)
      }
    }
  },
  computed: {
    versionSelectOptions: function () {
      if (this.projectForm.language === 'Python') {
        return ['Python 3.8', 'Python 3.9', 'Python 3.10']
      } else if (this.projectForm.language === 'C/C++') {
        return ['GCC 8.3', 'MSC v.1916']
      } else {
        return []
      }
    },
    tableData: function () {
      if (this.nowSelectingLanguage === '') {
        return this.rawData
      } else {
        return this.rawData.filter(project => project.language === this.nowSelectingLanguage)
      }
    }
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

.blue-header {
  height: 120px;
  background: #1DA9F4;
}

.user-title {
  margin: 0;
  padding-left: 16px;
  padding-top: 40px;

  font-size: 32px;
  text-align: left;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 100;
  color: white;
}

.el-aside {
  padding-top: 32px;
  padding-left: 48px;
}

.el-menu {
  border: none;
}

.menu-icon {
  width: 16px;
  margin-left: 4px;
  margin-right: 10px;
}

.el-main {
  position: relative;
  top: -84px;
  min-height: calc(100% + 64px);
  margin-right: 36px;
  padding-top: 32px;
  padding-left: 48px;

  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
  background: white;
}

.add-button {
  margin-right: 32px;
  margin-top: 4px;
  padding-left: 12px;
  letter-spacing: 1px;
}

.class-title {
  margin-top: 0;

  font-size: 32px;
  text-align: left;
  letter-spacing: 4px;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 100;
  color: black;
}

.el-table {
  width: 100%;
  letter-spacing: 1px;
}
</style>
