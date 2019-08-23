import sio from 'socket.io-client';
import store from '@/store';
import moment from 'moment';

const commit: IStore.Actions = (name: string, data?: any) => store.commit(name, data);
let socket: SocketIOClient.Socket | null = null;
const reconnect = (url: string, query: { key: string; name: string }) => {
    query.key = query.key || store.state.customer.key || '';
    socket = sio(url, { query });

    socket.on('customer-key', ({ key }) => commit('customer-key', key));

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
        /* 訪客的訊息不處理 */
        if (msg.fromType === 'customer') {
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
    connect(key: string, name: string) {
        reconnect('/es', { key, name });
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
        commit('talks/send', send);
        client().emit('talks/send', data, (res) => {
            const doneRes: IStore.Talks.SendSuccess = {
                sid,
                id: res.data.id,
                content: res.data.content,
                time: res.data.time,
            };
            commit('talks/send-success', doneRes);
        });
    },
    sendImage(base64: string, ext: 'image/jpeg' | 'image/png') {
        const sid = ++CacheSendID;
        const send: IStore.Talks.Send = {
            sid,
            content: '',
            type: 'image',
        };
        const data: ISK.EmitterData.Center.Send.Request = {
            content: base64,
            type: ext,
        };
        commit('talks/send', send);
        client().emit('talks/send', data, (res) => {
            const doneRes: IStore.Talks.SendSuccess = {
                sid,
                id: res.data.id,
                content: res.data.content,
                time: res.data.time,
            };
            commit('talks/send-success', doneRes);
        });
    },
};
