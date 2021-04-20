<template>
  <div ref="table"></div>
</template>

<script>
import Tabulator from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css'
export default {
  props: ['tableData', 'tableColumns', 'tableOptions'],
  name: 'tabulator-component',
  data: function () {
    return {
      tabulator: null, //variable to hold your table
    }
  },
  watch: {
    //update table if data changes
    tableData: {
      handler: function (newData) {
        this.tabulator.replaceData(newData);
      },
      deep: true,
    }
  },
  mounted() {
    //instantiate Tabulator when element is mounted
    this.tabulator = new Tabulator(this.$refs.table, {
      data: this.tableData, //link data to table
      reactiveData: true, //enable data reactivity
      columns: this.tableColumns, //define table columns
      ...this.tableOptions
    });


  },
}
</script>

<style>
.spark canvas {
  width: 100% !important;
  /*height: 100% !important;*/
  /*width: 100%;*/
}
.tabulator-row .tabulator-cell{
  /*padding:15px 4px;*/
  height: 50px !important;
}


</style>

