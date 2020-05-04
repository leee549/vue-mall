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
import treeTable from 'vue-table-with-tree-grid'
//全局样式
import './assets/global.css'

//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

//配置请求的根路径
Axios.defaults.baseURL='http://timemeetyou.com:8889/api/private/v1/'
// Axios.defaults.baseURL='https://www.liulongbin.top:8888/api/private/v1/'
//为每个请求获取token
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
//注册富文本编辑器
Vue.use(VueQuillEditor)

Vue.component('tree-table',treeTable)

//日期格式化注册
Vue.filter('dateFormat',function (originVal) {
  const dt = new Date(originVal*1000)

  const y = dt.getFullYear()
  const m =(dt.getMonth()+1+'').padStart(2,'0')
  const d =(dt.getDate()+1+'').padStart(2,'0')

  const hh = (dt.getHours()+'').padStart(2,'0')
  const mm = (dt.getMinutes()+'').padStart(2,'0')
  const ss = (dt.getSeconds()+'').padStart(2,'0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
