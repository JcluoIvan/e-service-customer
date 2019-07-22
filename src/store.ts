import Vue from 'vue';
import Vuex from 'vuex';
import EService from '@/libs/e-service';
import moment from 'moment';

Vue.use(Vuex);

const mutations: IStore.Mutations<IStore.State> = {
    disconnected(state) {
        state.status = 'disconnected';
    },
    connecting(state) {
        state.status = 'connecting';
    },
    waiting(state) {
        state.status = 'waiting';
    },
    token(state, token: string) {
        state.token = token;
        localStorage.setItem('ctoken', token);
    },
    'center/start'(state, data: IES.Center.Task) {
        state.status = 'start';
        console.info(data);
        Object.assign(state.task, data);
    },
    'center/message'(state, message) {
        const exists = (message.id && state.task.messages.find((m) => m.id === message.id)) || null;

        if (exists) {
            Object.assign(exists, message);
        } else {
            state.task.messages.push(message);
            if (message.time) {
                state.task.messages.sort((a, b) => a.time - b.time);
            }
        }
    },
    'center/send'(state, data) {
        console.warn(data);
        state.task.messages.push({
            ...data,
            id: 0,
            user: { id: 0, name: '', imageUrl: '' },
            time: 0,
        });
        console.info(state.task.messages);
    },
    'center/send-success'(state, data) {
        console.error(data);
        const msg = state.task.messages.find((t) => t.key === data.key);
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
            id: '',
            name: '',
        },
        token: localStorage.getItem('ctoken') || '',
        task: {
            messages: [],
            executive: { id: 0, name: '', imageUrl: '' },
            watchers: [],
            startAt: 0,
            closedAt: 0,
            createdAt: 0,
        },
    },
    mutations: mutations as any,
});

const commit: IStore.Actions = (name: string, data?: any) => store.commit(name, data);

const eservice = new EService('http://127.0.0.1:3000/es');

eservice.on('token', (token) => commit('token', token));

eservice.on('connected', () => commit('waiting'));

eservice.on('disconnected', () => commit('disconnected'));

eservice.on('start', (data) => {
    console.info('start', data);
    commit('center/start', {
        executive: data.executive,
        watchers: data.watchers,
        messages: data.messages.map((m) => ({ ...m, key: 0 })),
        startAt: data.startAt ? moment(data.startAt).valueOf() : 0,
        closedAt: data.closedAt ? moment(data.closedAt).valueOf() : 0,
        createdAt: moment(data.createdAt).valueOf(),
    });
});

eservice.on('message', (msg) => {
    console.info(msg);
    if (!msg.user.id) {
        return;
    }
    commit('center/message', {
        ...msg,
        key: 0,
        time: moment(msg.time).valueOf(),
    });
});

let CacheSendID = 0;
export const actions = {
    connect(id: string, name: string) {
        eservice.connect({ id, name, token: store.state.token });
    },
    sendMessage(content: string) {
        const key = ++CacheSendID;
        const send: IStore.TaskCenter.Send = {
            key,
            content,
            type: 'text',
        };
        commit('center/send', send);

        eservice.send(content, 'text/plain').then((res) => {
            commit('center/send-success', {
                ...res,
                key,
                time: moment(res.time).valueOf(),
            });
        });
    },
    uploadImage(base64: string, ext: 'image/jpeg' | 'image/png') {
        const key = ++CacheSendID;
        const send: IStore.TaskCenter.Send = {
            key,
            content: base64,
            type: 'image',
        };
        commit('center/send', send);
        eservice.send(base64, ext).then((res) => {
            commit('center/send-success', {
                ...res,
                key,
                time: moment(res.time).valueOf(),
            });
        });
    },
};

export default store;
