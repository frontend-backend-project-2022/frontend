<template>
  <div class="login-container">
    <div class="login-panel">
      <h1>注册新账号</h1>
      <el-form :model="formData" label-width="120px" label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="formData.username" type="text" id="name" name="username" placeholder="请输入用户名">
          </el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="formData.password" type="password" show-password placeholder="请输入密码">
          </el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="formData.password_confirm" type="password" show-password placeholder="请再次输入密码">
          </el-input>
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="registerSubmit">注册</el-button>
      <p class="register-container">
        <router-link to="/login/">返回登录页面</router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data () {
    return {
      formData: {
        username: '',
        password: '',
        password_confirm: ''
      }
    }
  },
  methods: {
    async registerSubmit () {
      if (this.formData.password !== this.formData.password_confirm) {
        this.$message.error('两次输入密码不一致')
        return
      }
      const response = await this.$axios.post('/api/login/register/', this.formData)
      if (response.data === 'suceess') {
        this.$message.success('注册成功')
        this.$router.push('/')
      } else {
        this.$message.error('注册失败')
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  box-sizing: border-box;
  height: 100vh;
  padding-top: 15vh;

  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  background-position: 200% 150%;
}

.login-panel {
  margin: 0 auto;
  padding: 32px;
  width: 20%;

  background: #FAFCFF;
  border-radius: 10px;
  font-size: 14px;
}

.login-panel>h1 {
  font-family: Arial, Helvetica, sans-serif;
  letter-spacing: 2px;
  font-weight: 100;
}

.el-form {
  margin: 48px 0;
  margin-top: 24px;
}

.el-button {
  width: 100%;
  font-size: 16px;
  letter-spacing: 2px;
  padding: 16px 0;
}

.register-container>span {
  color: #909399;
}
</style>
