<template>
  <v-app id="app">
    <v-app-bar
        app
        dark
        dense id="app-bar"
        style="z-index:1002;"

        clipped-left
        clipped-right
    >
      <v-app-bar-title class="mr-5">
      </v-app-bar-title>
      <v-toolbar-items class="hidden-sm-and-down">
        <v-btn text to="/">Map</v-btn>
        <v-btn text to="/about">About</v-btn>
        <v-icon
            x-large
            v-if="loading">
          fas fa-spinner fa-spin
        </v-icon>
      </v-toolbar-items>
    </v-app-bar>
    <v-snackbar
        v-model="alert"
        :bottom="true"
        color="red"
        :multi-line="true"
        :top="true"
        :vertical="true"
        timeout="5000"
    >{{ $store.state.error.text }}
      <template v-slot:action="{ attrs }">
        <v-btn
            color="white"
            text
            v-bind="attrs"
            @click="toggleError"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-main>
      <keep-alive include="Home">
        <router-view/>
      </keep-alive>
    </v-main>
  </v-app>
</template>

<script>
import {mapActions, mapState} from "vuex";

export default {
  nams: 'App',
  data() {
    return {
      spinner: false,
    }
  },
  computed: {
    alert: {
      get() {
        return this.$store.state.error.show
      },
      set(v) {
        if (!v) {
          this.toggleError();
        }
      }
    },
    ...mapState(
        {
          'loading': state => state.loading,
        }
    )
  },
  methods: {
    ...mapActions(['showError', 'toggleError'])
  },
  actions: {},
  beforeCreate() {
    this.$store.commit('initialiseStore');
  }
}
</script>
<style lang="scss">

</style>
