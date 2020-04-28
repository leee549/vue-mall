<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片-->
    <!--添加角色按钮-->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!--角色列表区域-->
      <el-table :data="roleList" border stripe>
        <!--展开列-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom',i1===0?'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children"
                    :key="item1.id">
              <!--渲染一级权限-->
              <el-col :span="4">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级权限-->
              <el-col :span="16">
                <!--嵌套for循环-->
                <el-row :class="[i2===0?'':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                  <el-col :span="4">
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!--渲染三级权限-->
                  <el-col :span="16">
                    <el-tag type="warning" @close="removeRightById(scope.row,item3.id)"
                            v-for="(item3,i3) in item2.children" :key="item3.id" closable>
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>

          </template>

        </el-table-column>
        <!--索引列-->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="350px">
          <template slot-scope="scope">
            <el-button type="primary" size="medium" @click="showEditDialog(scope.row.id)" icon="el-icon-edit">编辑</el-button>
            <el-button type="danger"  size="medium" @click="removeRoleById(scope.row.id)" icon="el-icon-delete">删除</el-button>
            <el-button type="warning" size="medium" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--添加角色的对话框-->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!--内容主题区-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改角色的对话框-->
    <el-dialog
      title="修改角色"
      :visible.sync="editDialogVisible"
      width="50%" >
      <!--内容主题区-->
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!--分配权限对话框-->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed">
      <!--树形控件-->
      <el-tree :data="rightsList" :props="treeProps" ref="treeRef"
               :default-checked-keys="defKeys" node-key="id" default-expand-all
               show-checkbox></el-tree>

      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        //所有角色列表数据
        roleList: [],
        //控制新增对话框的显示隐藏
        addDialogVisible: false,
        //添加角色的表单数据
        addForm: {
          roleName: '',
          roleDesc: '',
        },
        //添加表单的验证规则对象
        addFormRules: {
          roleName: [
            {required: true, message: '请输入角色名称', trigger: 'blur'},
          ],
          roleDesc: [
            {required: true, message: '请输入角色描述', trigger: 'blur'},
          ]
        },
        //控制修改用户对话框的显示与隐藏
        editDialogVisible: false,
        // 编辑框的数据
        editForm: {},
        //控制分配权限对话框的显示与隐藏
        setRightDialogVisible: false,
        //所有权限的数据
        rightsList: [],
        //树形控件的属性绑定
        treeProps: {
          label: 'authName',
          children: 'children'
        },
        //默认选中的节点id值数组
        defKeys: [],
        //即将分配权限的角色id
        roleId: ''
      }
    },
    created() {
      this.getRoleList()
    },
    methods: {
      //获取角色列表
      async getRoleList() {
        const {data: res} = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          return this.$message.error("获取角色列表失败！")
        }
        this.roleList = res.data;
        console.log(res.data)
      },
      //监听对话框关闭的事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields();
      },
      // 点击按钮，添加角色
      addRole() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return;
          //发起添加请求
          const {data: res} = await this.$http.post('roles', this.addForm);
          //console.log(res + "data");
          if (res.meta.status !== 201) {
            this.$message.error('添加角色失败！');
            return;
          }
          this.$message.success('添加角色成功！');
          this.addDialogVisible = false;
          //重新获取用户列表
          this.getRoleList();
        })
      },
      //根据id删除角色
      async removeRoleById(id) {
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
        const {data: res} = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error("删除角色失败!")
        }
        this.$message.success("删除角色成功!")
        this.getRoleList()
      },
      //展示编辑角色对话框
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('roles/' + id)
        console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error("查询用户信息失败！")
        }
        this.editForm = res.data;
        this.editDialogVisible = true
      },
      //修改角色
      editRoleInfo() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return;
          //发起修改用户请求
          const {data: res} = await this.$http.put('roles/' + this.editForm.roleId, {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          });
          console.log(res);
          if (res.meta.status !== 200) {
            return this.$message.error("更新角色信息失败！")
          }
          //关闭对话框
          this.editDialogVisible = false;
          //刷新数据
          this.getRoleList();
          //提示修改成功
          this.$message.success("更新角色信息成功！")
        })
      },
      //根据id删除权限
      async removeRightById(role, rightId) {
        //询问是否删除
        const $confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
        //确认删除$confirmResult返回confirm
        //取消删除              返回cancel
        if ($confirmResult !== 'confirm') {
          return this.$message.info("已取消删除")
        }
        const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
        if (res.meta.status !== 200) {
          return this.$message.error("删除权限失败!")
        }
        this.$message.success("删除权限成功!");
        role.children = res.data
        // this.getRoleList()
      },
      //显示分配权限对话框
      async showSetRightDialog(role) {
        //获取即将分配权限的角色
        this.roleId = role.id;
        //查询所有
        const {data: res} = await this.$http.get('rights/tree')
        if (res.meta.status !== 200) {
          return this.$message.error("获取权限数据失败!")
        }
        //把获取到的权限数据保存到data中
        this.rightsList = res.data;
        //递归获取三级节点id
        this.getLeafKeys(role, this.defKeys)
        this.setRightDialogVisible = true;

      },
      //递归获取三级权限id并保存到数组中
      getLeafKeys(node, arr) {
        //如果不包含children则是三级节点,往数组加id
        if (!node.children) {
          return arr.push(node.id)
        }
        //递归
        node.children.forEach(item => {
          this.getLeafKeys(item, arr)
        })
      },
      // 监听分配权限对话框关闭事件
      setRightDialogClosed() {
        this.defKeys = []
      },
      //点击为角色分配权限
      async allotRights() {
        //...表示数组解构
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys(),

        ]
        const idStr = keys.join(",")
        const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {
          rids: idStr
        })
        if (res.meta.status !== 200) {
          return this.$message.error("更新权限失败!")
        }
        this.$message.success("更新权限成功!")
        this.getRoleList()
        this.setRightDialogVisible = false
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-input {

  }

  .el-col {
    margin: 7px;
  }

  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }

  //纵向居中对齐
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
