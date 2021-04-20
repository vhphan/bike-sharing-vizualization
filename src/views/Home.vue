<template>
  <v-row class="ma-0 pa-0 left">
    <Map/>
    <v-col cols="12" sm="6" class="right">
      <v-card>

        <v-tabs
            v-model="tabs"
            fixed-tabs
        >
          <v-tabs-slider></v-tabs-slider>
          <v-tab
              class="primary--text"
          >
            <v-icon>mdi-phone</v-icon>
          </v-tab>
          <v-tab
              class="primary--text"
          >
            <v-icon>mdi-heart</v-icon>
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tabs">
          <v-tab-item>
            <v-card flat>
              <v-card-text>
                <tabulator-component
                    v-if="tableData && tableData.length"
                    :table-columns="tableColumns"
                    :table-options="tableOptions"
                    :table-data="tableData"
                />
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card>
              <v-card-title>
                {{ selectedStation.stationId }}
                <v-card-subtitle>
                  {{ selectedStation.stationName }}
                </v-card-subtitle>
                <v-btn class="ml-6" @click="resetPopupContent">Clear Selection</v-btn>
              </v-card-title>
            </v-card>
            <heatmap
                :chart-data="heatmapData"
                x-name="start_day"
                y-name="start_hour"
                z-name="count"
                group-by="year_week"/>
          </v-tab-item>
        </v-tabs-items>

      </v-card>

    </v-col>
  </v-row>
</template>

<script>
// @ is an alias to /src

import Map from "@/components/Map";
import Heatmap from "@/components/Heatmap";
import {mapActions, mapState} from "vuex";
import TabulatorComponent from "@/components/Table";

export default {
  name: 'Home',
  components: {TabulatorComponent, Heatmap, Map},
  data: function () {
    return {
      tabs: null,
      tableOptions: {
        height: '45vh',
        layout: "fitColumns"
      },

    }
  },
  computed: {
    ...mapState({
      heatmapData: state => state.bikesStore.heatmapData,
      popupContent: state => state.bikesStore.popupContent,
      bikesData: state => state.bikesStore.bikesData,
    }),
    tableData() {
      if ('features' in this.bikesData) {
        return this.bikesData.features.map(d=>d.properties);
      }
      return []
    },
    valuesMinMax() {
      const countArray = this.tableData.map(d=>d.count);
      return {
        max: Math.max(...countArray),
        min: Math.min(...countArray)
      }
    },
    tableColumns() {
      const {min, max} = this.valuesMinMax;
      return [ //Define Table Columns
        {
          title: "Count",
          field: "count",
          hozAlign: "left",
          formatter: "progress",
          formatterParams: {
            min: min,
            max: max,
            color: ["green", "orange", "red"],
            legendColor: "#000000",
            legendAlign: "center",
          },
        },
        {title: "Station ID", field: "start_station_id"},
        {title: "Station Name", field: "start_station_name"},
      ]
    },


    selectedStation: function () {
      if (Object.keys(this.popupContent).includes('start_station_id')) {
        return {
          stationId: this.popupContent['start_station_id'],
          stationName: this.popupContent['start_station_name']
        }
      }
      return {
        stationId: 'All',
        stationName: 'All'
      };
    },
    selectedStationId: function () {
      if (Object.keys(this.popupContent).includes('start_station_id')) {
        return this.popupContent['start_station_id']
      }
      return 'All';
    },
  },
  methods: {
    ...mapActions(['resetPopupContent', 'getHeatmapData']),
  },
  watch: {
    selectedStationId(newStation) {
      console.log(newStation);
      this.getHeatmapData();
    }
  }
}
</script>

<style scoped>
.left {
  height: 100%;
}

.right {
  height: 100%;
  background-color: #bfc1c0;
}

</style>