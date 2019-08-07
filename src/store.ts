import Vue from 'vue';
import Vuex from 'vuex';
import moment from 'moment';

Vue.use(Vuex);

const mutations: IStore.Mutations<IStore.State> = {
    disconnected(state) {
        state.status = 'disconnected';
    },
    connecting(state) {
        state.status = 'connecting';
    },
    connected(state) {
        state.status = 'connected';
    },
    'customer-key'(state, key) {
        state.customer.key = key;
        localStorage.setItem('c-key', key);
    },
    'talks/talk'(state, data) {
        Object.assign(state.talk, data);
    },
    'talks/start'(state, data) {
        Object.assign(state.talk, data);
    },
    'talks/waiting'(state) {
        state.talk.executive.id = 0;
        state.talk.executive.imageUrl = '';
        state.talk.executive.name = '';
        state.talk.messages = [];
        state.talk.startAt = 0;
    },
    'talks/message'(state, message) {
        const exists = (message.id && state.talk.messages.find((m) => m.id === message.id)) || null;

        if (exists) {
            Object.assign(exists, message);
        } else {
            state.talk.messages.push(message);
            if (message.time) {
                state.talk.messages.sort((a, b) => a.time - b.time);
            }
        }
    },
    'talks/send'(state, data) {
        console.warn(data);
        state.talk.messages.push({
            ...data,
            id: 0,
            user: { id: 0, name: '', imageUrl: '' },
            fromType: 'customer',
            time: 0,
        });
        console.info(state.talk.messages);
    },
    'talks/send-success'(state, data) {
        const msg = state.talk.messages.find((t) => t.sid === data.sid);
        if (!msg) {
            return;
        }

        msg.id = data.id;
        msg.content = data.content;
        msg.time = moment(data.time).valueOf();
    },
};

const store = new Vuex.Store<IStore.State>({
    state: {
        status: 'connecting',
        customer: {
            key: localStorage.getItem('c-key') || '',
            name: '',
        },
        talk: {
            messages: [],
            executive: { id: 0, name: '', imageUrl: '' },
            startAt: 0,
            createdAt: 0,
        },
    },
    mutations: mutations as any,
});

export default store;
