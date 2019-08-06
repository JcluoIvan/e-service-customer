import sio from 'socket.io-client';
import store from '@/store';
import moment from 'moment';

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
    disconnect() {
        if (socket) {
            socket.disconnect();
        }
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
