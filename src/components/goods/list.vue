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
      <!--搜索-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable @clear="getGoodsList" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="handleCurrentChange(1),getGoodsList"></el-button>
          </el-input>
        </el-col>
        <!--添加商品按钮-->
        <el-col :span="4">
          <el-button type="primary" @click="toAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!--table表格区域-->
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="170px">
          <template v-slot="scope">
            {{scope.row.add_time |dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="125px">
          <template v-slot="scope">
            <!--<el-button type="primary" size="medium" @click="showEditDialog(scope.row.id)" icon="el-icon-edit">编辑-->
            <!--</el-button>-->
            <el-button type="danger" size="medium" @click="removeById(scope.row.goods_id)" icon="el-icon-delete">删除
            </el-button>
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
  </div>
</template>

<script>
  export default {
    data() {
      return {
        //查询参数对象
        queryInfo: {
          query: '',
          //当前页
          pagenum: 1,
          pagesize: 10
        },
        //商品列表
        goodslist: [],
        //总数据
        total: 0
      }
    },
    created() {
      this.getGoodsList()
    },
    methods: {
      //根据分页获取对应列表
      async getGoodsList() {
        const {data: res} = await this.$http.get('goods', {params: this.queryInfo})
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品列表失败')
        }
        // this.$message.success('获取商品列表成功')
        this.goodslist = res.data.goods
        this.total = res.data.total
      },
      //分页数发生改变
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getGoodsList()
      },
      //当前页码值改变
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getGoodsList()
      },
      //删除
      async removeById(id) {
        //询问是否删除
        const $confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
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
        const {data: res} = await this.$http.delete(`goods/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error("删除商品失败!")
        }
        this.$message.success("删除商品成功!")
        this.getGoodsList()
      },
      //跳转新增商品
      toAddPage(){
        this.$router.push('/goods/add')
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
