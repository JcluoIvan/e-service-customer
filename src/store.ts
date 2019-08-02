import Vue from 'vue';
import Vuex from 'vuex';
import moment from 'moment';
import sio from 'socket.io-client';

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
    token(state, token) {
        state.token = token;
        localStorage.setItem('ctoken', token);
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
            id: '',
            name: '',
        },
        token: localStorage.getItem('ctoken') || '',
        talk: {
            messages: [],
            executive: { id: 0, name: '', imageUrl: '' },
            startAt: 0,
            createdAt: 0,
        },
    },
    mutations: mutations as any,
});

const commit: IStore.Actions = (name: string, data?: any) => store.commit(name, data);
let socket: SocketIOClient.Socket | null = null;
const reconnect = (url: string, query: { id: string; name: string; token?: string }) => {
    query.token = query.token || localStorage.getItem('ctoken') || '';
    socket = sio(url, { query });

    socket.on('token', ({ token }) => commit('token', token));

    socket.on('connect', () => commit('connected'));

    socket.on('disconnect', () => commit('disconnected'));

    socket.on('talks/talk', (res) => commit('talks/talk', res));

    socket.on('talks/waiting', () => commit('talks/waiting'));

    socket.on('talks/start', (data) => {
        console.info('start', data);
        commit('talks/start', {
            ...data,
            executive: data.executive,
            messages: data.messages.map((m) => ({ ...m, sid: 0 })),
        });
    });

    socket.on('talks/message', (msg) => {
        if (!msg.user.id) {
            return;
        }
        commit('talks/message', {
            ...msg,
            sid: 0,
            time: moment(msg.time).valueOf(),
        });
    });
};

const client = () => {
    if (!socket || socket.disconnected) {
        throw new Error('socket disconnected');
    }
    return socket;
};

let CacheSendID = 0;
export const actions = {
    connect(id: string, name: string) {
        reconnect('/es', { id, name });
    },
    sendMessage(content: string) {
        const sid = ++CacheSendID;
        const send: IStore.Talks.Send = {
            sid,
            content,
            type: 'text',
        };
        const data: ISK.EmitterData.Center.Send.Request = {
            content,
            type: 'text/plain',
        };
        client().emit('talks/send', data, (res) => {
            const doneRes: IStore.Talks.SendSuccess = {
                sid,
                id: res.data.id,
                content: res.data.content,
                time: res.data.time,
            };
            commit('talks/send-success', doneRes);
        });
        commit('talks/send', send);
    },
    sendImage(base64: string, ext: 'image/jpeg' | 'image/png') {
        const sid = ++CacheSendID;
        const send: IStore.Talks.Send = {
            sid,
            content: base64,
            type: 'image',
        };
        const data: ISK.EmitterData.Center.Send.Request = {
            content: base64,
            type: ext,
        };
        client().emit('talks/send', data, (res) => {
            const doneRes: IStore.Talks.SendSuccess = {
                sid,
                id: res.data.id,
                content: res.data.content,
                time: res.data.time,
            };
            commit('talks/send-success', doneRes);
        });
        commit('talks/send', send);
    },
};

export default store;
