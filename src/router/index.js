import Vue from 'vue'
import Router from 'vue-router'
import login from "../components/login";
import home from "../components/home";
//全局样式
import '../assets/global.css'
Vue.use(Router)

const router = new Router({
  routes: [

    {path:"/",redirect:"/login"},
    {path:"/login",component:login},
    {path:"/home",component:home},


  ]
})
//挂载路由导航守卫
router.beforeEach((to,from,next)=>{
    //to:访问的路径
    //from：从那个路径跳转而来
    //next 是一个函数 表示放行4
    //next（）放行 next（'/login'）强制跳转
  if (to.path==='/login') return next();
  //获取token
  const tokenStr = window.sessionStorage.getItem("token")
  if(!tokenStr) return next('/login');
  next()
})

export default router
