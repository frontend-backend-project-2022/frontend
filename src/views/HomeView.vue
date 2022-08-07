<template>
  <div class="home">
    <h1>User Page, Show Project List.</h1>
    <el-button type="primary" @click="logoutSubmit">
      logout
    </el-button>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  methods: {
    async logoutSubmit () {
      const response = await this.$axios.get('/api/login/logout')
      if (response.status === 200) { this.$router.push('/login/') }
    }
  }
}
</script>
