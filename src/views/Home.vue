<template>
  <v-row class="ma-0 pa-0 left">
    <Map/>
    <v-col cols="12" sm="6" class="right">
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
    </v-col>
  </v-row>
</template>

<script>
// @ is an alias to /src

import Map from "@/components/Map";
import Heatmap from "@/components/Heatmap";
import {mapActions, mapState} from "vuex";

export default {
  name: 'Home',
  components: {Heatmap, Map},
  data: function () {
    return {}
  },
  computed: {
    ...mapState({
      heatmapData: state => state.bikesStore.heatmapData,
      popupContent: state => state.bikesStore.popupContent,
    }),

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