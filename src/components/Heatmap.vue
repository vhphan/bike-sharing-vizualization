<template>
  <v-card>
    <v-card-title>Heatmap</v-card-title>
    <v-card-text id="heat" ref="heat">

    </v-card-text>
  </v-card>
</template>

<script>
import * as echarts from 'echarts';

import myFunctions from "@/utilities/myFunctions";

export default {
  name: "Heatmap",
  data: function () {
    return {
      heatmap: null,
      parsedData: null,
      chartInstance: null
    }
  },
  props: {
    chartData: {type: Array, required: true},
    xName: {type: String, required: true},
    yName: {type: String, required: true},
    zName: {type: String, required: true},
    groupBy: {type: String, required: true},
  },
  computed: {},
  methods: {
    heatmapOption(parsedData) {
      //({ a, b } = { a: 10, b: 20 });
      // data is array of [x,y,x]
      let xData = parsedData.map(function (d) {
        return d[0];
      });
      let yData = parsedData.map(function (d) {
        return d[1];
      });
      const xLabels = [...new Set(xData)].sort(function (a, b) {
        return a - b;
      });
      const yLabels = [...new Set(yData)].sort(function (a, b) {
        return a - b;
      });
      return {
        dataZoom: [
          { // The first dataZoom component
            yAxisIndex: [0], // Indicates that this dataZoom component
            type: 'slider',
            start: 0,
            end: 100
            // controls the first and the third yAxis
          },
        ],
        xAxis: [{
          data: xLabels,
        }],
        yAxis: [{
          data: yLabels,
        }],

        series: [{data: parsedData}]

      };

    },
    drawChart() {
      const {xName, yName, zName, heatmapOption, groupBy} = this;

      let jsonData = this.chartData;
      let groupByList = [...new Set(myFunctions.rowsUnpack(jsonData, groupBy))];
      let baseOption = {
        tooltip: {
          position: 'top',
          formatter: function (params) {
            if (params.componentType === 'series') {
              return xName + ':' + params.value[0] + ',' + yName + ':' + params.value[1] + ',' + zName + ':' + params.value[2];
            }
            if (params.componentType === 'timeline') {
              return params.name;
            }
          },
        },
        timeline: {
          axisType: 'category',
          show: true,
          autoPlay: true,
          playInterval: 1500,
          data: groupByList,
          label: {
            formatter: function (value) {
              // Formatted to be month/day; display year only in the first label
              return value.toString().replace(' 00:00:00 GMT', '')
            }
          }
        },
        visualMap: {
          min: 0,
          max: 300,
          calculable: true,
          realtime: false,
          inRange: {
            color: [
              'darkblue',
              'blue',
              '#00f7ff',
              '#2dff00',
              'yellow',
              '#ffa200',
              '#ff7700',
              'red',
              'maroon'
            ]
          }
        },
        'xAxis': [
          {
            'type': 'category',
            'name': 'Day',
            'nameLocation': 'end'
          }
        ],
        'yAxis': [
          {
            'type': 'category',
            'name': 'Hour',
            'nameLocation': 'end'
          }
        ],
        grid: {
          containLabel: true,
          left: '20%',
        },
        series: [{
          type: 'heatmap',
          emphasis: {
            itemStyle: {
              borderColor: '#333',
              borderWidth: 1
            }
          },
          progressive: 1000,
          animation: false
        }]
      };
      let chartOptionsList = [];
      groupByList.forEach(function (group) {
        let dayData = jsonData.filter(function (d) {
          return d[groupBy] === group;
        });

        dayData.sort(function (a, b) {
          return a[yName] - b[yName];
        });

        let dataArray = dayData.map(function (d) {
          return [
            d[xName].toString(),
            d[yName].toString(),
            d[zName]
          ];
        });

        chartOptionsList.push(heatmapOption(dataArray));

      });
      if (this.chartInstance) this.chartInstance.dispose();
      this.chartInstance = echarts.init(this.$refs.heat);
      this.chartInstance.setOption({
        baseOption: baseOption,
        options: chartOptionsList
      });
      // this.chartInstance.on('mouseover', function (params) {
      //   console.log('mouseover', params);
      // });

      window.onresize = this.onResize();
    },
    onResize() {
      if (typeof this.$refs.heat == 'undefined') {
        return;
      }
      if (this.chartInstance) {
        this.chartInstance.resize();
      }
    },
  },
  mounted() {
    try {
      this.reObs = new ResizeObserver(this.onResize)
          .observe(this.$refs.heat);
    } catch (e) {
      console.log('Resize error', e);
      console.log(this.$refs);
    }
    if (this.chartData && this.chartData.length) this.drawChart();
  },
  watch: {
    chartData: function () {
      if (this.chartData && this.chartData.length) this.drawChart();
    }
  }

}
</script>

<style scoped>
#heat {
  height: 500px;
  width: 500px;
}
</style>