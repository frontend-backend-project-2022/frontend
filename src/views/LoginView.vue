<template>
  <div class="login">
    <h1>登录</h1>
    <el-form :model="formData" label-width="120px" label-position="top">
        <el-form-item label="用户名">
            <el-input v-model="formData.username" type="text" id="name" name="username"/>
        </el-form-item>
        <el-form-item label="密码">
            <el-input v-model="formData.password" type="password" show-password/>
        </el-form-item>
        <el-form-item>
          <el-row class="buttons-container" justify="space-evenly">
              <el-button type="primary" @click="loginSubmit">登录</el-button>
              <el-button @click="$router.push('/register/')">注册新账号</el-button>
          </el-row>
        </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data () {
    return {
      formData: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    async loginSubmit () {
      const response = await this.$axios.post('/api/login/', this.formData)
      if (response.data !== 'failed') {
        this.$router.push('/')
      } else {
        this.$message.error('登录失败')
      }
    }
  }
}
</script>

<style scoped>
.el-form {
  margin: 40px auto;
  width: 18%;

  border-top: 1px solid hsla(210,18%,87%,1);;
  border-radius: 6px;
  padding: 16px;
  padding-bottom: 0;
  font-size: 14px;
  background-color: #f6f8fa;
  border: 1px solid hsla(210,18%,87%,1);;
}

.buttons-container {
  width: 100%;
}
</style>
