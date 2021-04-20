import Vue from 'vue'
import App from '@/App.vue'
import vuetify from '@/plugins/vuetify';
import store from '@/store'
import router from '@/router'
import http from '@/plugins/http.js'
import VueObserveVisibility from 'vue-observe-visibility';

Vue.use(VueObserveVisibility)
Vue.config.productionTip = false
Vue.use(http);

new Vue({
  vuetify,
  store,
  router,
  render: h => h(App)
}).$mount('#app')
