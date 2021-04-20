import Vue from 'vue';
import Vuex from 'vuex';
import createCache from 'vuex-cache';
import mapStore from '@/store/modules/mapStore';
import bikesStore from '@/store/modules/bikesStore';
import error from '@/store/modules/error';
import {version} from '../../package.json';

console.log('version=', version);
Vue.use(Vuex)

const store = new Vuex.Store({
    plugins: [createCache()],
    strict: true,
    modules: {
        mapStore,
        bikesStore,
        error
    },
    state: {
        version: '',
        loading: false,
        snackbar: {
            show: false,
            snackbarText: '',
            snackbarTimeout: 5000,
            snackbarDefaultTimeout: 5000
        }
    },
    mutations: {
        initialiseStore(state) {
            // Check if the store exists
            if (localStorage.getItem('store')) {
                let store = JSON.parse(localStorage.getItem('store'));

                // Check the version stored against current. If different, don't
                // load the cached version
                if (store.version === version) {
                    this.replaceState(
                        Object.assign(state, store)
                    );
                } else {
                    state.version = version;
                }
            }
        },
    }
})

// Subscribe to store updates
store.subscribe((mutation, state) => {
    // Store the state object as a JSON string
    localStorage.setItem('store', JSON.stringify(state));
});

export default store;