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
    token(state, token) {
        state.token = token;
        localStorage.setItem('ctoken', token);
    },
    'center/start'(state, data: IES.Center.Task) {
        state.status = 'start';
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
        const msg = state.task.messages.find((t) => t.sid === data.sid);
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
        ...data,
        executive: data.executive,
        messages: data.messages.map((m) => ({ ...m, sid: 0 })),
    });
});

eservice.on('message', (msg) => {
    console.info(msg);
    if (!msg.user.id) {
        return;
    }
    commit('center/message', {
        ...msg,
        sid: 0,
        time: moment(msg.time).valueOf(),
    });
});

let CacheSendID = 0;
export const actions = {
    connect(id: string, name: string) {
        eservice.connect({ id, name, token: store.state.token });
    },
    sendMessage(content: string) {
        const sid = ++CacheSendID;
        const send: IStore.TaskCenter.Send = {
            sid,
            content,
            type: 'text',
        };
        commit('center/send', send);

        eservice.send(content, 'text/plain').then((res) => {
            commit('center/send-success', {
                ...res,
                sid,
                time: moment(res.time).valueOf(),
            });
        });
    },
    uploadImage(base64: string, ext: 'image/jpeg' | 'image/png') {
        const sid = ++CacheSendID;
        const send: IStore.TaskCenter.Send = {
            sid,
            content: base64,
            type: 'image',
        };
        commit('center/send', send);
        eservice.send(base64, ext).then((res) => {
            commit('center/send-success', {
                ...res,
                sid,
                time: moment(res.time).valueOf(),
            });
        });
    },
};

export default store;
