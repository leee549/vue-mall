<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片-->
    <el-card>
      <!--搜索-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable @clear="getOrderList" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="handleCurrentChange(1),getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!--订单数据表格-->
      <!--table表格区域-->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="95px"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status" width="70px"></el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="170px">
          <template v-slot="scope">
            <el-tag v-if="scope.row.pay_status==='1'" type="success">已付款</el-tag>
            <el-tag v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="170px">
          <template v-slot="scope">
            {{scope.row.create_time |dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250px">
          <template v-slot="scope">
            <el-button type="primary" size="medium" @click="showBox" icon="el-icon-edit">
            </el-button>
            <el-button type="success" size="medium" @click="showProgressBox" icon="el-icon-location">
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


    <!--修改地址对话框-->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <!--内容主题区-->
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityData" prop="cityProps" v-model="addressForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addressDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addressDialogVisible=false">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改物流的对话框-->
    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%"

    >
      <!--时间线-->
      <el-timeline >
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
      <!--内容主题区-->
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">

      </el-form>

    </el-dialog>
  </div>
</template>

<script>
  //导入城市列表三级联动
  import {regionData} from 'element-china-area-data'

  export default {
    data() {
      return {
        queryInfo: {
          query: '',
          //当前页
          pagenum: 1,
          pagesize: 10,
        },
        total: 0,
        orderList: [],
        //修改地址对话框
        addressDialogVisible: false,
        //
        addressForm: {
          address1: [],
          address2: ''
        },
        addressFormRules: {
          address1: [{required: true, message: '请选择省市区县', trigger: 'blur'}],
          address2: [{required: true, message: '请填写详细地址', trigger: 'blur'}]
        },
        //城市选择器
        cityData: regionData,
        cityProps: {
          //次级菜单的展开方式
          expandTrigger: 'hover',
          value: 'code',
          label: 'name',
          children: 'children',
        },
        //物流对话框
        progressVisible: false,
        //物流信息
        progressInfo:[]
      }
    },
    created() {
      this.getOrderList()
    },
    methods: {
      async getOrderList() {
        const {data: res} = await this.$http.get('orders', {
          params: this.queryInfo
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取订单列表失败')
        }
        // this.$message.success('获取商品列表成功')
        this.orderList = res.data.goods
        this.total = res.data.total
      },
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getOrderList()
      },
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getOrderList()
      },
      //展示修改地址的对话框
      showBox() {
        this.addressDialogVisible = true
      },
      //关闭事件
      addressDialogClosed() {
        this.$refs.addressFormRef.resetFields()
      },
      //展示物流对话框
      async showProgressBox() {
        const {data:res} = await this.$http.get('/kuaidi/1106975712662')

        if(res.meta.status!==200){
          return this.$message.error('获取物流信息失败！')
        }
        this.progressInfo=res.data

        this.progressVisible = true
      }

    }
  }
</script>

<style lang="less" scoped>
  .el-cascader {
    width: 100%;
  }

</style>
