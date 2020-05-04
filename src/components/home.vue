<template>
  <!--头部区域-->
  <el-container class="home-container">
    <el-header>
      <div>
        <img style="border-radius: 100%" src="../assets/me.jpg" alt="">
        <span>电商后台管理系统</span>
      </div>

      <el-button type="info" @click="logout">退了</el-button>
    </el-header>
    <!--页面主体区域-->
    <el-container>
      <!--侧边栏-->
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!--侧边栏菜单-->
        <el-menu background-color="#333744" text-color="#fff"
                 active-text-color="#409BFF" unique-opened :collapse="isCollapse"
                 :collapse-transition="false" router @click="saveNavState"
                 :default-active="activePath">
          <!--一级菜单-->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!--二级菜单-->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children"
                          :key="subItem.id" @click="saveNavState('/' + subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>


        </el-menu>
      </el-aside>
      <!--右侧内容-->
      <el-main>
        <!--路由占位符-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    data() {
      return {
        menulist: [],
        //菜单图标
        iconObj: {
          '125': 'el-icon-user-solid',
          '103': 'el-icon-s-home',
          '101': 'el-icon-s-data',
          '102': 'el-icon-tickets',
          '145': 'el-icon-coin',
        },
        //是否折叠
        isCollapse: false,
        //被激活的地址
        activePath: ''
      }
    },
    created() {
      this.getMenuList()
      this.activePath = window.sessionStorage.getItem("activePath")
    },
    methods: {
      logout() {
        window.sessionStorage.clear();
        this.$router.push("/login")
      },
      //获取所有菜单
      async getMenuList() {
        const {data: res} = await this.$http.get('menus');
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.menulist = res.data;
        console.log(res)

      },
      //点击按钮实现菜单折叠
      toggleCollapse() {
        this.isCollapse = !this.isCollapse
      },
      //保存链接的激活状态
      saveNavState(activePath) {
        window.sessionStorage.setItem('activePath', activePath);
        this.activePath = activePath
      }
    }
  }
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }

  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #ffff;
    font-size: 20px;

    > div {
      display: flex;
      align-items: center;

      span {
        margin-left: 15px;
      }
    }
  }

  .el-aside {
    background-color: #333744;

    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    background-color: #EAEDF1;
  }

  .iconfont {
    margin-left: 10px;
  }

  .toggle-button {
    background-color: #475163;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
</style>
