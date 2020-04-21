<template>
  <div>
    <el-button type="info" @click="logout">退了</el-button>
    home
  </div>
</template>

<script>
    export default {
       methods:{
         logout(){
           window.sessionStorage.clear();
           this.$router.push("/login")
         }
       }
    }
</script>

<style lang="less" scoped>

</style>
