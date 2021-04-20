<template>
  <v-col id="map-container" cols="12" sm="6" class="left ma-0 pa-0" style="height: 100%;">
    <v-row class="mt-1">
      <v-col cols="2" class="ml-1">
        <v-btn
            style="z-index: 500;"
            small
            @click="drawScatter"
            dark
        >
          Draw
        </v-btn>
      </v-col>
      <v-col
          class="ma-0 pa-0"
          cols="3">
        <v-card
            style="z-index: 500; height: 3.2rem;"
            class="ma-1"
        >
          <v-menu
              background-color="white"
              v-model="datePickerMenu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                  clear-icon="mdi-delete"
                  clearable
                  v-model="dateRange"
                  label="Select start and end dates"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
                v-if="this.availableDates.length>0"
                v-model="dateRange"
                range
                :allowed-dates="getAvailableDatesForDatePicker"
            ></v-date-picker>
          </v-menu>
        </v-card>
      </v-col>
    </v-row>
  </v-col>
</template>

<script>
import {mapActions, mapGetters, mapState} from "vuex";
import mapFunctions from "@/utilities/mapFunctions";
import chroma from 'chroma-js';


export default {
  name: "Map",
  data() {
    return {
      datePickerMenu: false,

      mapObj: {
        id: 'map-container',
        map: null,
        lControl: null,
        ctlTree: null,
        layerGroups: {},
        myFeatureGroup: [],
        searchControl: null,
        pointsLayer: null,
        chloropleth: null,
        chloroplethInfo: {},
        legend: null
      },
      mapIsLoaded: false,

    }
  },
  computed: {
    dateRange: {
      get() {
        return this.$store.state.bikesStore.dateRange;
      },
      set(d) {
        this.setDateRange(d)
      },
    },
    endDate: {
      get() {
        return this.$store.state.bikesStore.endDate;
      },
      set(d) {
        this.setEndDate(d)
      },
    },
    ...mapState({
      'availableDates': state => state.bikesStore.availableDates,
      'bikesData': state => state.bikesStore.bikesData,
      'popupContent': state => state.bikesStore.popupContent,

    }),

    ...mapGetters(['center', 'bikesUrl']),

  },
  methods: {
    ...mapActions(['getAvailableDates', 'getBikesData', 'getHeatmapData', 'setDateRange', 'setPopupContent']),
    getAvailableDatesForDatePicker(val) {
      const dates = this.availableDates.map(d => d['day'])
      return dates.indexOf(val) !== -1;
    },
    drawScatter() {
      if (!Object.keys(this.bikesData).length && 'features' in Object.keys(this.bikesData)) return;
      const countArray = this.bikesData.features.map(d => {
        return d.properties.count;
      })
      console.log(countArray);
      const maxValue = Math.max(...countArray);
      const minValue = Math.min(...countArray);
      const scaled = function (value) {
        return (value - minValue) / (maxValue - minValue);
      }
      const colorFunction = function (value) {
        const f = chroma.scale(['yellow', 'red', 'black']);
        return f(scaled(value))
      }
      mapFunctions.drawPointsLayer(this, this.mapObj, this.bikesData, colorFunction, 'count', this.setPopupContent, {
        minValue,
        maxValue,
        minRadius: 5,
        maxRadius: 30
      })
      mapFunctions.addColorGradientLegend(this.mapObj, colorFunction, minValue, maxValue, 'Count');
      const bounds = this.mapObj.pointsLayer.getBounds();
      const latLng = bounds.getCenter();
      this.mapObj.map.setView(latLng);

    }

  },
  created: function () {
    this.getAvailableDates().then(() => {
    });
    this.getBikesData().then(() => {
    });
    this.getHeatmapData().then(() => {
    });
  },
  mounted: function () {
    mapFunctions.setupLeafletMap(
        this.mapObj,
        'Positron (CartoDB)',
        this.center);
    this.mapIsLoaded = true;
    this.drawScatter();


  },
  watch: {
    popupContent: function (newValue) {
      if (!this.mapObj.pointsLayer){return}
      if (!Object.keys(newValue).length) {
        this.mapObj.pointsLayer.resetStyle();
      }
    }
  }

}
</script>

<style>
#map-container {
  height: 100%;
}

.legend {
  line-height: 18px;
  color: #555;
  background-color: white;
  width: 500px;
}

.legend i {
  width: 2px;
  height: 20px;
  float: left;

}

.legend {
  padding: 10px 10px;
  font: 14px Arial, Helvetica, sans-serif;
  background: #fff;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  line-height: 5px;
  width: 350px;
}

.legend h4 {
  text-align: center;
  font-size: 16px;
  text-transform: uppercase;
  color: black;
  font-weight: 400;
  margin-bottom: 5px;
}

.legend span {
  bottom: 3px;
  padding-right: 10px;
}

.info-pane {
  padding: 6px 8px;
  font: 14px/16px Arial, Helvetica, sans-serif;
  background: white;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  max-height: 150px;
}
</style>