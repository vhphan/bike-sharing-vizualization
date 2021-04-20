import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default {
    state: {
        show: false,
        text: 'Error'
    },
    mutations: {
        hideError(state) {
            state.show = false;
            state.text = '';
        },
        showError(state, message, timeout = 10) {
            state.show = true;
            state.text = message;
            setTimeout(this.hideError
                , timeout * 5000)
        },
        toggleError(state) {
            state.show = !state.show;
        }
    },
    getters: {},
    actions: {
        showError(context, message) {
            context.commit('showError', message);
        },
        toggleError(context) {
            context.commit('toggleError');
        }
    }
};