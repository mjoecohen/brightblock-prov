// store.js
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const provstore = new Vuex.Store({
  modules: {
  },
  state: {
    constants: {
      blockchainUrl: (location.origin.indexOf("localhost") > -1) ? "http://localhost:8191" : "https://api.brightblock.org",
    },
    serverTime: {}
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  }
});
export default provstore;
