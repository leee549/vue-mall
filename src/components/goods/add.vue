<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片-->
    <el-card>
      <!--警告区-->
      <el-alert show-icon title="添加商品信息" type="info" :closable="false"></el-alert>
      <!--步骤条-->
      <el-steps :space="200" :active="activeIndex-0" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!--tab标签栏-->
      <el-form :model="addForm" :rules="addFormRules" label-position="top" ref="addFormRef" label-width="100px">
        <el-tabs v-model="activeIndex" @tab-click="tabClicked" :tab-position="'left'" :before-leave="beforeTabLeave">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!--  渲染表单的item项-->
            <el-form-item :label="item.attr_name" :key="item.attr_id" v-for="item in manyTableData">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" :key="item.attr_id" v-for="item in onlyTableData">
              <el-input v-model="item.attr_vals"></el-input>
              <!--<el-input v-for="(value,i) in item.attr_vals" :key="i" v-model="item.attr_vals" ></el-input>-->
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!--富文本编辑器组件-->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!--添加商品按钮-->
            <el-button type="primary" class="btn_add" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!--图片预览区域-->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="50%">
      <img :src="previewPath" class="previewImg">
    </el-dialog>
  </div>

</template>

<script>
  export default {
    data() {
      return {
        activeIndex: '0',
        //添加商品的表单数据对象
        addForm: {
          goods_name: '',
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          //商品所属的分类
          goods_cat: [],
          //图片数组
          pics: [],
          //商品详细描述
          goods_introduce: '',
          //
          attrs:[]

        },
        addFormRules: {
          goods_name: [{required: true, message: '请输入商品名称', trigger: 'blur'}],
          goods_price: [{required: true, message: '请输入商品价格', trigger: 'blur'}],
          goods_weight: [{required: true, message: '请输入商品重量', trigger: 'blur'}],
          goods_number: [{required: true, message: '请输入商品数量', trigger: 'blur'}],
          goods_cat: [{required: true, message: '请选择商品分类', trigger: 'blur'}]
        },
        //商品分类列表
        cateList: [],
        //级联
        cateProps: {
          //次级菜单的展开方式
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
        },
        //动态参数列表数据
        manyTableData: [],
        //静态参数列表数据
        onlyTableData: [],
        //上传地址
        uploadURL: 'http://timemeetyou.com:8889/api/private/v1/upload',
        //图片上传的请求头
        headerObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        //预览图片URL
        previewPath: '',
        //预览区域的隐藏显示
        previewVisible: false,


      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      //获取所有的商品分类数据
      async getCateList() {
        const {data: res} = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类数据失败！')
        }
        this.cateList = res.data
      },
      //级联选择器选中项变化会触发
      handleChange() {
        if (this.addForm.goods_cat.length !== 3) {
          this.addForm.goods_cat = []
        }
      },
      //即将跳转标签页
      beforeTabLeave(activeName, oldActiveName) {
        if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
          this.$message.error('请先选择商品分类!')
          return false
        }
      },
      //点击tab
      async tabClicked() {
        if (this.activeIndex === '1') {
          const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
            params: {sel: 'many'}
          })
          if (res.meta.status !== 200) {
            return this.$message.error('获取动态参数列表失败!')
          }
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length === 0 ? [] :
              item.attr_vals.split(' ')
          })
          this.manyTableData = res.data
        } else if (this.activeIndex === '2') {
          const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
            params: {sel: 'only'}
          })
          if (res.meta.status !== 200) {
            return this.$message.error('获取静态参数列表失败!')
          }
          res.data.forEach(item => {
            // const newItem = JSON.parse(JSON.stringify(item))
            // newItem.attr_vals=newItem.attr_vals.join(',')

            item.attr_vals = item.attr_vals.length === 0 ? []:
               // item.attr_vals.split(' ')
               item.attr_vals

            // console.log(item)
          })
          this.onlyTableData = res.data
        }
      },
      //图片预览操作
      handlePreview(file) {
        console.log(file)
        this.previewPath = file.response.data.url
        this.previewVisible = true
      },
      //图片删除
      handleRemove(file) {
        //1.获取将要删除的图片路径
        const filePath = file.response.data.tmp_path
        //2.从pics数组中找到这个图片的索引
        const i = this.addForm.pics.findIndex(x =>
          x.pic === filePath)
        //3.调用数组的splice方法，把图片信息对象，从pics数组中移除
        this.addForm.pics.splice(i, 1)
        console.log(this.addForm)

      },
      //监听图片上传成功的事件
      handleSuccess(response) {
        console.log(response)
        //1.拼接得到一个图片信息对象
        const picInfo = {pic: response.data.tmp_path}
        //2.将图片信息对象push到pics 数组中
        this.addForm.pics.push(picInfo);
        console.log(this.addForm)
      },
      //添加商品
        add() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) {
            return this.$message.error('请填写必要的表单项！')
          }
          //添加业务逻辑
          //深拷贝 解决数组转换成字符串
          // this.addForm.goods_cat = this.addForm.goods_cat.join(',')
          const form = JSON.parse(JSON.stringify(this.addForm))
          form.goods_cat=form.goods_cat.join(',')
          //处理动态参数
          this.manyTableData.forEach(item=>{
            const newInfo= {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            }
            this.addForm.attrs.push(newInfo)
          })
          //处理静态属性
          this.onlyTableData.forEach(item=>{
            const newInfo= {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addForm.attrs.push(newInfo)
          })
          form.attrs=this.addForm.attrs
          console.log(form)
          //发起请求添加商品
          //商品名称必须是唯一的
          const {data:res} = await this.$http.post('goods',form)
          if(res.meta.status!==201){
            return this.$message.error('添加商品失败!')
          }
          this.$message.success('添加商品成功!')
          await this.$router.push('/goods')
        })
      },

    },
    computed: {
      //获取三级分类id
      cateId() {
        if (this.addForm.goods_cat.length === 3) {
          return this.addForm.goods_cat[2]
        }
        return null;
      },

    }
  }
</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }

  .previewImg {
    width: 100%;
  }

  .btn_add {
    margin-top: 15px;
  }
</style>
