<template>
  <div class="login" id="login">
    <h1>注册</h1>
    <el-form :model="formData" label-width="80px">
      <el-form-item label="用户名">
        <el-input v-model="formData.username" type="text" id="name" name="username" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="formData.password" type="password" show-password />
      </el-form-item>
      <el-form-item label="确认密码">
        <el-input v-model="formData.password_confirm" type="password" show-password />
      </el-form-item>
      <el-form-item>
        <el-row class="buttons-container" justify="space-evenly">
          <el-button type="primary" @click="registerSubmit">注册</el-button>
          <el-button @click="$router.push('/login/')">返回登录页面</el-button>
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
        this.$router.push('/')
      } else {
        this.$message.error('注册失败')
      }
    }
  }
}
</script>

<style scoped>
.el-form {
  margin: 40px auto;
  width: 25%;

  border-top: 1px solid hsla(210, 18%, 87%, 1);
  ;
  border-radius: 6px;
  padding: 16px;
  padding-bottom: 0;
  font-size: 14px;
  background-color: #f6f8fa;
  border: 1px solid hsla(210, 18%, 87%, 1);
  ;
}

</style>
