import Vue from 'vue';
import Vuex from 'vuex';
import myFunctions from "@/utilities/myFunctions";

Vue.use(Vuex);


export default {
    state: {
        dateRange: ['2013-12-21', '2017-07-31'],
        bikesData: {},
        heatmapData: {},
        availableDates: [],
        popupContent: {}
    },
    getters: {
        bikesUrl: (state) => {
            return `bikes/count-per-station/${state.dateRange[0]}/${state.dateRange[1]}`
        },
        heatmapUrl: (state) => {
            if ('start_station_id' in state.popupContent) {
                return `bikes/count-day-hour/${state.dateRange[0]}/${state.dateRange[1]}/${state.popupContent['start_station_id']}`
            }
            return `bikes/count-day-hour/${state.dateRange[0]}/${state.dateRange[1]}/All`
        },
    },
    mutations: {
        setBikesData(state, value) {
            state.bikesData = value;
        },
        setHeatmapData(state, value) {
            state.heatmapData = value;
        },
        setAvailableDates(state, value) {
            state.availableDates = value;
        },
        setDateRange(state, value) {
            state.dateRange = myFunctions.sortDataArray(value);
        },
        setPopupContent(state, value) {
            state.popupContent = value;
        },

    },
    actions: {
        resetPopupContent({commit}) {
            commit('setPopupContent', {})
        },
        setPopupContent({commit}, value) {
            commit('setPopupContent', value)
        },
        setDateRange({commit}, value) {
            commit('setDateRange', value)
        },

        async getAvailableDates(context) {
            try {
                const availableDates = (await this._vm.$flask.get('bikes/available-dates')).data;
                context.commit('setAvailableDates', availableDates);
            } catch (e) {
                context.commit('showError', e);
                console.log(e);
            }
        },
        async getBikesData(context) {
            try {
                const bikesData = (await this._vm.$flask.get(context.getters.bikesUrl)).data;
                context.commit('setBikesData', bikesData);


            } catch (e) {
                context.commit('showError', e);
                console.log(e);
            }
        },
        async getHeatmapData(context) {
            try {
                const heatmapData = (await this._vm.$flask.get(context.getters.heatmapUrl)).data;
                context.commit('setHeatmapData', heatmapData);
            } catch (e) {
                context.commit('showError', e);
                console.log(e);
            }
        },
    },


};

