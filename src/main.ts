import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/assets/material-icons/icon.scss';
import './filter';
Vue.config.productionTip = false;

Vue.config.devtools = true;

new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount('#app');
