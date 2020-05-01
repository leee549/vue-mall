<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片-->
    <el-card>
      <el-row :gutter="20">
        <!--添加分类按钮-->
        <el-col :span="4">
          <el-button type="primary" @click="showAddcateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!--表格-->
      <tree-table class="treeTable" :data="catelist"
                  :columns="columns" :selection-type="false" :expand-type="false"
                  show-index index-text="#" border>
        <!--是否有效-->
        <template v-slot:isok="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color: lightgreen ;font-size:20px"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!--排序-->
        <template v-slot:order="scope">
          <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!--操作-->
        <template v-slot:opt="scope">
          <el-button type="primary" size="medium" icon="el-icon-edit" @click="showEditDialog(scope.row.cat_id)">编辑
          </el-button>
          <el-button type="danger" size="medium" icon="el-icon-delete" @click="removeCateById(scope.row.cat_id)">删除
          </el-button>
        </template>

      </tree-table>

      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!--添加分类对话框-->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!--添加分类表单-->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!--options指定数据源-->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange" clearable></el-cascader>
        </el-form-item>

      </el-form>
      <!--底部区-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!--编辑分类对话框-->
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="50%">
      <!--内容主题区-->
      <el-form :model="editForm" :rules="addCateFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        //查询条件
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        //分类列表
        catelist: [],
        //总数据条数
        total: 0,
        //为table指定列的定义
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            //表示将当前列定义为模板l列
            type: 'template',
            //表示当前这一列使用模板名称
            template: 'isok'
          },
          {
            label: '排序',
            //表示将当前列定义为模板l列
            type: 'template',
            //表示当前这一列使用模板名称
            template: 'order'
          },
          {
            label: '操作',
            //表示将当前列定义为模板l列
            type: 'template',
            //表示当前这一列使用模板名称
            template: 'opt'
          }

        ],
        //控制添加分类对话框
        addCateDialogVisible: false,
        //添加分类的表单对象
        addCateForm: {
          //将要添加分类的名称
          cat_name: '',
          //父级分类id
          cat_pid: 0,
          //分类等级默认添加1级
          cat_level: 0
        },
        //添加分类验证规则
        addCateFormRules: {
          cat_name: [
            {required: true, message: "请输入分类名称", trigger: 'blur'}
          ]
        },
        //父级分类列表
        parentCateList: [],
        //
        cascaderProps: {
          //次级菜单的展开方式
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          //设置运行选中任意父子节点
          checkStrictly: true
        },
        //选中的父级分类id数组
        selectedKeys: [],
        //控制修改用户对话框的显示与隐藏
        editDialogVisible: false,
        //编辑框数据
        editForm: {}
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      //获取商品分类数据
      async getCateList() {
        const {data: res} = await this.$http.get('categories', {
          params: this.queryInfo
        });
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类失败！')
        }
        //把查到的数据赋值给catelist
        this.catelist = res.data.result
        //为数据总条数赋值
        this.total = res.data.total
      },
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getCateList()
      },
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getCateList()
      },
      showAddcateDialog() {
        //先获取父级分类列表
        this.getParentCateList();
        this.addCateDialogVisible = true
      },
      //获取父级分类的数据列表
      async getParentCateList() {
        const {data: res} = await this.$http.get('categories', {
          params: {type: 2}
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取父级分类数据失败！')
        }
        this.parentCateList = res.data
      },
      //当选择性变化时触发
      parentCateChange() {
        console.log(this.selectedKeys)
        //如果selectkeys 长度大于0选中了 父级
        //反之没有
        //父类id
        if (this.selectedKeys.length > 0) {
          this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
          //为当前分类等级赋值
          this.addCateForm.cat_level = this.selectedKeys.length
          return
        } else {
          //如果是一级分类
          this.addCateForm.cat_pid = 0
          this.addCateForm.cat_level = 0
        }
      },
      //添加分类
      async addCate() {
        this.$refs.addCateRef.validate(async valid => {
          if (!valid) return;
          const {data: res} = await this.$http.post('categories', this.addCateForm)
          console.log(res)
          if (res.meta.status !== 201) {
            return this.$message.error('添加分类失败！')
          }
          this.$message.success('添加分类成功！')
          this.getCateList();
          this.addCateDialogVisible = false;
        })
      },
      //监听对话框关闭时间
      addCateDialogClosed() {
        this.$refs.addCateRef.resetFields()
        this.selectedKeys = []
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_id = 0
      },
      //根据ID删除分类
      async removeCateById(id) {
        //询问是否删除
        const $confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        //确认删除$confirmResult返回confirm
        //取消删除              返回cancel
        if ($confirmResult !== 'confirm') {
          return this.$message.info("已取消删除")
        }//删除
        const {data: res} = await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error("删除分类失败!")
        }
        this.$message.success("删除分类成功!")
        this.getCateList()
      },
      //展示编辑分类对话框
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error("查询分类信息失败！")
        }
        this.editForm = res.data;
        this.editDialogVisible = true
      },
      //修改分类
      editCateInfo() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return;
          //发起修改分类请求
          const {data: res} = await this.$http.put('categories/' + this.editForm.cat_id, {
            cat_name: this.editForm.cat_name,
          });
          console.log(res);
          if (res.meta.status !== 200) {
            return this.$message.error("更新角色信息失败！")
          }
          //关闭对话框
          this.editDialogVisible = false;
          //刷新数据
          this.getCateList();
          //提示修改成功
          this.$message.success("更新角色信息成功！")
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .treeTable {
    margin-top: 15px;
  }
</style>
