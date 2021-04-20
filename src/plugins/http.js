import axios from 'axios';
import Vue from 'vue';
import {cacheAdapterEnhancer} from 'axios-extensions';
import {Cache} from 'axios-extensions';

function createInstance(baseURL) {
    let headers = {
        'Content-Type': 'application/json',
    };

    return axios.create({
        baseURL,
        headers
    });
}

function createInstanceWithCache(baseURL) {
    let headers = {
        'Content-Type': 'application/json',
    }
    return axios.create({
        baseURL,
        headers,
        adapter: cacheAdapterEnhancer(axios.defaults.adapter, {
            enabledByDefault: true,
            cacheFlag: 'useCache',
            defaultCache: httpCache,
        }),
    });
}

const flaskInstance = createInstance('http://localhost:5000');
const vueInstance = createInstance('./');
const deployedInstanceCache = createInstanceWithCache('https://cmeportal.eprojecttrackers.com');

const httpCache = new Cache({maxAge: 24 * 3600 * 1000});


export default {
    install() {
        Vue.prototype.$flask = process.env.NODE_ENV === 'development'? flaskInstance: deployedInstanceCache;
        Vue.prototype.$public = vueInstance;
    }
};