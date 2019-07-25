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
    'center/task'(state, data) {
        Object.assign(state.task, data);
    },
    'center/start'(state, data) {
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

    socket.on('center/task', (res) => commit('center/task', res));

    socket.on('center/start', (data) => {
        console.info('start', data);
        commit('center/start', {
            ...data,
            executive: data.executive,
            messages: data.messages.map((m) => ({ ...m, sid: 0 })),
        });
    });

    socket.on('center/message', (msg) => {
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
        reconnect('http://127.0.0.1:3000/es', { id, name });
    },
    sendMessage(content: string) {
        const sid = ++CacheSendID;
        const send: IStore.TaskCenter.Send = {
            sid,
            content,
            type: 'text',
        };
        const data: ISK.EmitterData.Center.Send.Request = {
            content,
            type: 'text/plain',
        };
        client().emit('center/send', data, (res) => {
            const doneRes: IStore.TaskCenter.SendSuccess = {
                sid,
                id: res.data.id,
                content: res.data.content,
                time: res.data.time,
            };
            commit('center/send-success', doneRes);
        });
        commit('center/send', send);
    },
    uploadImage(base64: string, ext: 'image/jpeg' | 'image/png') {
        const sid = ++CacheSendID;
        const send: IStore.TaskCenter.Send = {
            sid,
            content: base64,
            type: 'image',
        };
        const data: ISK.EmitterData.Center.Send.Request = {
            content: base64,
            type: ext,
        };
        client().emit('center/send', data, (res) => {
            const doneRes: IStore.TaskCenter.SendSuccess = {
                sid,
                id: res.data.id,
                content: res.data.content,
                time: res.data.time,
            };
            commit('center/send-success', doneRes);
        });
        commit('center/send', send);
        // eservice.send(base64, ext).then((res) => {
        //     commit('center/send-success', {
        //         ...res,
        //         sid,
        //         time: moment(res.time).valueOf(),
        //     });
        // });
    },
};

export default store;
