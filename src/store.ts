import Vue from 'vue';
import Vuex from 'vuex';
import EService from '@/libs/e-service';
import moment from 'moment';

Vue.use(Vuex);

export namespace IStore {
    export interface Message {
        id: number;

        /* 為了更新訊息的 key */
        key: string;
        content: string;
        type: 'text' | 'image';
        time: number;
    }

    export interface User {
        id: number;
        name: string;
    }

    export interface Task {
        executive: User;
        messages: Message[];
        watcher: User[];
        startAt: number;
    }

    export interface State {
        status: 'disconnected' | 'connecting' | 'waiting' | 'start';
        task: Task;
    }
}

const store = new Vuex.Store<IStore.State>({
    state: {
        status: 'connecting',
        task: {
            messages: [],
            executive: { id: 0, name: '' },
            watcher: [],
            startAt: 0,
        },
    },
    mutations: {
        // connected(state) {
        //     state.status = 'connected';
        // },
        disconnected(state) {
            state.status = 'disconnected';
        },
        connecting(state) {
            state.status = 'connecting';
        },
        waiting(state) {
            state.status = 'waiting';
        },
        start(state) {
            state.status = 'start';
        },
        message(state, message: IStore.Message) {
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
        updateMessage(state, message) {
            const exists = state.task.messages.find((m) => m.key === message.key);
            if (exists) {
                Object.assign(exists, message);
            } else {
                state.task.messages.push(message);
            }
        },
    },
});

const eservice = new EService('http://127.0.0.1:3000/es');

eservice.on('connected', () => store.commit('waiting'));

eservice.on('disconnected', () => store.commit('disconnected'));

eservice.on('message', (msg) => {
    store.commit('message', {
        ...msg,
        time: moment(msg.time).valueOf(),
    });
});

export const actions = {
    connect(id: string, name: string) {
        eservice.connect(id, name);
    },
    sendMessage(content: string) {
        const msg: IStore.Message = {
            id: 0,
            key: [new Date().getTime(), Math.random()].join('-'),
            content,
            time: 0,
            type: 'text',
        };

        store.commit('message', msg);
        eservice.send(content, 'text/plain').then((res) => {
            store.commit('updateMessage', { ...msg, ...res });
        });
    },
    uploadImage(base64: string, ext: 'image/jpeg' | 'image/png') {
        const msg: IStore.Message = {
            id: 0,
            key: [new Date().getTime(), Math.random()].join('-'),
            content: base64,
            time: 0,
            type: 'image',
        };

        store.commit('message', msg);
        eservice.send(base64, ext).then((res) => {
            store.commit('updateMessage', { ...msg, ...res });
        });
    },
};

export default store;
