// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import "./assets/font/iconfont.css";
import qs from 'qs'
import Axios from "axios";
//配置请求的根路径
// Axios.defaults.baseURL='http://localhost:8081/api/user/'
Axios.defaults.baseURL='http://timemeetyou.com:8889/api/private/v1/'
Axios.interceptors.request.use(config =>{
  console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
})
//设置axios为form-data
Axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
Axios.defaults.headers.get['Content-Type'] = 'application/x-www-form-urlencoded';
Vue.prototype.$http=Axios;

Vue.prototype.$qs = qs

Vue.config.productionTip = false;
Vue.use(ElementUI);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
