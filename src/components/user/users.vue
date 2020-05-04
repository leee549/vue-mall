<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片-->
    <el-card>
      <!--搜索-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable @clear="getUserList" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="handleCurrentChange(1);getUserList"></el-button>
          </el-input>
        </el-col>
        <!--添加用户按钮-->
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!--用户列表区-->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button type="primary" @click="showEditDialog(scope.row.id)" icon="el-icon-edit" size="medium"
                         circle></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type="danger" @click="removeUserById(scope.row.id)" icon="el-icon-delete" size="medium"
                         circle></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" @click="setRole(scope.row)" icon="el-icon-setting" size="medium"
                         circle></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total" background>
      </el-pagination>
    </el-card>
    <!--添加用户的对话框-->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!--内容主题区-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改用户的对话框-->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
    >
      <!--内容主题区-->
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!--分配角色对话框-->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <!--内容主题区-->
      <el-form  label-width="70px">
        <el-form-item label="当前用户">
          <el-input v-model="userInfo.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="当前角色">
          <el-input v-model="userInfo.role_name" disabled></el-input>
        </el-form-item>
        <!--<p>当前用户：{{userInfo.username}}</p>-->
        <!--<p>当前角色：{{userInfo.role_name}}</p>-->
        <p>分配新角色
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </el-form>
      <!--底部区-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        //获取用户列表参数对象
        queryInfo: {
          //查询关键字
          query: '',
          //当前的页数
          pagenum: 1,
          //当前每页显示多少条数据
          pagesize: 2
        },
        userlist: [],
        total: 0,
        //控制对话框的显示隐藏
        addDialogVisible: false,
        //添加用户的表单数据
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        //添加表单的验证规则对象
        addFormRules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 3, max: 10, message: '用户名长度在 3 到 10 个字符', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 3, max: 10, message: '用户名长度在 6到 15 个字符', trigger: 'blur'}
          ],
          email: [
            {required: true, message: '请输入邮箱', trigger: 'blur'},
            {message: '格式不正确', pattern: /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/}
          ],
          mobile: [
            {required: true, message: '请输入手机', trigger: 'blur'},
            {message: '格式不正确', pattern: /^[1][3,4,5,7,8][0-9]{9}$/}

          ]
        },
        //控制修改用户对话框的显示与隐藏
        editDialogVisible: false,
        editForm: {},
        //控制分配角色的显示隐藏
        setRoleDialogVisible: false,
        //需要被分配角色的用户信息
        userInfo: {},
        //角色下拉列表
        rolesList: {},
        //已经选中的下拉角色id值
        selectedRoleId: '',

      }
    },
    created() {
      this.getUserList()
    },
    methods: {
      async getUserList() {
        const {data: res} = await this.$http.get("users", {params: this.queryInfo})
        if (res.meta.status !== 200) {
          return this.$message.error('获取用户列表失败!');
        }
        this.userlist = res.data.users;
        this.total = res.data.total
        // console.log(res)
      },
      //监听pagesize改变的事件
      handleSizeChange(newSize) {
        // console.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      //监听页码值改变
      handleCurrentChange(newPage) {
        //
        // console.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },
      //监听开关状态改变
      async userStateChanged(userinfo) {
        //console.log(userinfo)
        const {data: res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
        //console.log(res);
        if (res.meta.status !== 200) {
          userinfo.mg_state = !this.userinfo.mg_state;
          return this.$message.error("更新用户状态失败！")
        }
        this.$message.success("更新用户状态成功！")
      },
      //监听对话框关闭的事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields();
      },
      //点击按钮，添加用户
      addUser() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return;
          //发起添加请求
          const {data: res} = await this.$http.post('users', this.addForm)
          //console.log(res + "data");
          if (res.meta.status !== 201) {
            this.$message.error('添加用户失败！');
            return;
          }
          this.$message.success('添加用户成功！');
          this.addDialogVisible = false;
          //重新获取用户列表
          this.getUserList();

        })
      },
      //展示编辑用户对话框
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('users/' + id)
        // console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error("查询用户信息失败！")
        }
        this.editForm = res.data;
        this.editDialogVisible = true
      },
      //修改用户信息
      editUserInfo() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return;
          //发起修改用户信息请求
          const {data: res} = await this.$http.put('users/' + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          });
          if (res.meta.status !== 200) {
            return this.$message.error("更新用户信息失败！")
          }
          //关闭对话框
          this.editDialogVisible = false;
          //刷新数据
          this.getUserList();
          //提示修改成功
          this.$message.success("更新用户信息成功！")

        })
      },
      //删除用户
      async removeUserById(id) {
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
        }
        //删除
        const {data: res} = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error("删除用户失败!")
        }
        this.$message.success("删除用户成功!")
        this.getUserList()
      },
      //展示分配角色对话框
      async setRole(userInfo) {
        this.userInfo = userInfo;
        //展示对话框之前获取角色列表
        const {data: res} = await this.$http.get('roles');
        if (res.meta.status !== 200) {
          return this.$message.error("删除用户失败!")
        }
        this.rolesList = res.data;
        this.setRoleDialogVisible = true
      },
      //点击按钮分配角色
      async saveRoleInfo() {
        if (!this.selectedRoleId) {
          return this.$message.error('请选择要分配的角色')
        }
        const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`,
          {
            rid:this.selectedRoleId
          })
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error("分配角色失败!")
        }
        this.$message.success('分配角色成功')
        this.getUserList()
        this.setRoleDialogVisible=false;
      },
      //监听分配角色对话框关闭事件
      setRoleDialogClosed(){
        this.selectedRoleId=''
        this.userInfo={}
      }
    }

  }
</script>

<style scoped lang="less">

</style>
