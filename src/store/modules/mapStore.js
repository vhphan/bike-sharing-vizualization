import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default {
    state: {
        defaultCenter:  [3.03046, 101.5633],
        lastCenter: null,
        lastZoom: null,
        defaultZoom: 14,
    },
    getters: {
        center: state => state.lastCenter ? state.lastCenter : state.defaultCenter,
        zoom: state => state.lastZoom ? state.lastZoom : state.defaultZoom
    },
    mutations: {},
    actions: {},


};

