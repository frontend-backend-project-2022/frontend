<template>
  <MonacoEditor v-model:data="code_str" language="python" id="monaco-editor"/>
  <p>{{this.code_str}}</p>
</template>

<script>
import MonacoEditor from '@/components/MonacoEditor.vue'

export default {
  components: {
    MonacoEditor
  },
  data () {
    return {
      code_str: ''
    }
  }
}
</script>

<style scoped>
#monaco-editor {
  height: 600px;
}
</style>
