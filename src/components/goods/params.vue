<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片试图-->
    <el-card>
      <!--警告区-->
      <el-alert show-icon title="注意: 只允许为三级分类设置相关参数" type="warning" :closable="false"></el-alert>
      <!--选择商品分类区域-->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <el-cascader
            v-model="selectedCateKeys"
            :options="catelist"
            :props="cateProps"
            @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!--tab标签-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!--1、动态参数面板-->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数
          </el-button>
          <!--动态数据表格-->
          <el-table :data="manyTableData" border stripe>
            <!--展开行-->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!--循环渲染tag标签-->
                <el-tag @close="handleClosed(i,scope.row)" closable v-for="(item,i) in scope.row.attr_vals" :key="i">{{item}}</el-tag>
                <!--输入的文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!--添加的按钮-->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>

            </el-table-column>
            <!--索引列-->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!--2、静态属性面板-->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性
          </el-button>
          <!--静态数据表格-->
          <el-table :data="onlyTableData" border stripe>
            <!--展开行-->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!--循环渲染tag标签-->
                <el-tag @close="handleClosed(i,scope.row)" closable v-for="(item,i) in scope.row.attr_vals" :key="i">{{item}}</el-tag>
                <!--输入的文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!--添加的按钮-->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!--索引列-->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--添加参数的对话框-->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!--添加参数表单-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
    </el-dialog>
    <!--修改参数对话框-->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!--添加参数表单-->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
    </el-dialog>
  </div>

</template>

<script>
  export default {
    data() {
      return {
        catelist: [],
        cateProps: {
          //次级菜单的展开方式
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
        },
        //级联选中的数组
        selectedCateKeys: [],
        //被激活的页签
        activeName: 'many',
        //动态表格数据
        manyTableData: [],
        //静态表格数据
        onlyTableData: [],
        //添加对话框的显示与隐藏
        addDialogVisible: false,
        //添加参数的表单
        addForm: {},
        //添加验证规则
        addFormRules: {
          attr_name: [{required: true, message: '请输入参数名称', trigger: 'blur'}],
        },
        //控制修改对话框的显示隐藏
        editDialogVisible: false,
        //编辑表单的数据对象
        editForm: {},
        //编辑表单的验证规则对象
        editFormRules: {
          attr_name: [{required: true, message: '请输入参数名称', trigger: 'blur'}],
        },
        //tag文本框与按钮
        // inputVisible: false,
        // 文本框输入的内容
        // inputValue: ''
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      //获取所有的商品分类
      async getCateList() {
        const {data: res} = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          this.$message.error("获取商品分类失败！")
        }
        this.catelist = res.data
      },
      //级联选中会触发
      handleChange() {
        this.getParamsData()
      },
      // tab页签点击事件
      handleTabClick() {
        this.getParamsData()
      },
      //获取参数的列表数据
      async getParamsData() {
        //选中的不是三级分类
        if (this.selectedCateKeys.length !== 3) {
          this.selectedCateKeys = []
          //情况表格数据防止不必要的问题
          this.manyTableData=[]
          this.onlyTableData=[]
          return
        }
        //选中的是三级分类
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {sel: this.activeName}
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败！')
        }
        //遍历attr value
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ?
            item.attr_vals.split(' ') : []
          //文本框的显示隐藏
          item.inputVisible = false
          // 文本框输入的值
          item.inputValue = ''
        })
        //判断数据属于哪个表格
        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      },
      //监听添加框关闭
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      //添加参数
      addParams() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 201) {
            return this.$message.error('添加参数失败！')
          }
          this.$message.success('添加参数成功！')
          this.addDialogVisible = false;
          this.getParamsData()
        })
      },
      //点击按钮展示 修改对话框
      async showEditDialog(attr_id) {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {
          params: {attr_sel: this.activename}
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败！')
        }
        this.editForm = res.data
        this.editDialogVisible = true
      },
      //监听修改对话框的关闭
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      //点击按钮修改参数
      editParams() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 200) {
            return this.$message.error('修改参数失败！')
          }
          this.$message.success('修改参数成功！')
          this.getParamsData()
          this.editDialogVisible = false;
        })
      },
      //点击按钮删除
      async removeParams(attr_id) {
        //询问是否删除
        const $confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        //确认删除$confirmResult返回confirm
        //取消删除              返回cancel
        if ($confirmResult !== 'confirm') {
          return this.$message.info("已取消删除")
        }
        //删除
        const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)

        if (res.meta.status !== 200) {
          return this.$message.error('删除参数失败！')
        }
        this.$message.success('删除参数成功！')
        this.getParamsData()
      },
      //tag文本框失去焦点或者单机Enter键
      async handleInputConfirm(row) {
        //去掉空格的长度
        if(row.inputValue.trim().length===0){
          row.inputValue=''
          //隐藏文本框,显示按钮
          row.inputVisible = false
          return
        }
        //如果没有return 输入的内容正确,做后续处理
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue=''
        //隐藏文本框,显示按钮
        row.inputVisible = false
        // 发起请求保存这次操作
        this.saveAttrVals(row)
      },
      //保存(新增,删除)的属性
      async saveAttrVals(row){
        //发起请求保存这次操作
        const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
          attr_name:row.attr_name,
          attr_sel:row.attr_sel,
          attr_vals:row.attr_vals.join(' ')
        })
        if(res.meta.status!==200){
          return this.$message.error('修改参数项失败!')
        }
        this.$message.success('修改参数项成功!')
      },
      //点击按钮展示tag文本框
      showInput(row) {
        row.inputVisible = true
        //让文本框自动获得焦点
        //$nextTick方法的作用 就是当页面的元素被重新渲染之后
        // ,才会调用回调函数的代码
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      //tag删除事件
      handleClosed(i,row){
        row.attr_vals.splice(i,1)
        //发请求保存
        this.saveAttrVals(row)
      }


    },
    computed: {
      //如果按钮需要被禁用 true
      isBtnDisabled() {
        return this.selectedCateKeys.length !== 3
      },
      //当前选中的三级分类的ID
      cateId() {
        if (this.selectedCateKeys.length === 3) {
          return this.selectedCateKeys[2]
        }
        return null
      },
      //动态计算标题文本
      titleText() {
        if (this.activeName === 'many') {
          return '动态参数'
        }
        return '静态属性'
      }
    }
  }
</script>

<style lang="less" scoped>
  .cat_opt {
    margin-top: 15px;
  }

  .el-tag {
    margin: 10px;
  }

  .input-new-tag {
    width: 120px;
  }
</style>
