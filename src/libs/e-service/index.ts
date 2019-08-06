import sio from 'socket.io-client';
import { EventEmitter } from 'events';
import moment from 'moment';
import store from '@/store';

type ListenerHandle<D = any> = (data: D) => void;
interface EmitterEvents<T> {
    emit(event: string | number, ...args: any[]): boolean;
}

interface ListenerEvents<T> {
    (event: string | number, listener: (...args: any[]) => void): T;
    (event: 'connected' | 'disconnected', listener: ListenerHandle): T;
    (event: 'message', listener: ListenerHandle<ISK.ListenerData.Message>): T;
    (event: 'token', listener: ListenerHandle<string>): T;
    (event: 'start', listener: ListenerHandle<ISK.ListenerData.Talks.Start>): T;
}

export default class EService extends EventEmitter {
    public on!: ListenerEvents<this>;
    private socket: SocketIOClient.Socket | null = null;

    constructor(private host: string) {
        super();
    }

    private get client() {
        if (!this.socket || !this.socket.connected) {
            throw new Error('no connect');
        }

        return this.socket;
    }

    public connect(query: { id: string; name: string; token: string }) {
        this.socket = sio(this.host, { query });

        this.socket.on('token', ({ token }) => {
            this.emit('token', token);
        });

        this.socket.on('talks/start', (res) => {
            this.emit('start', res);
        });

        this.socket.on('talks/message', (data) => {
            this.emit('message', data);
        });

        this.socket.on('connect', () => {
            this.emit('connected');
        });

        this.socket.on('disconnect', () => {
            this.emit('disconnected');
        });
    }

    public send(content: string, type: 'text/plain' | 'image/jpeg' | 'image/png') {
        return new Promise<{ id: number; time: number; content: string }>((resolve, reject) => {
            const data: ISK.EmitterData.Center.Send.Request = {
                content,
                type,
            };
            this.client.emit('talks/send', data, (res) => {
                if (res.code !== 0) {
                    reject(new Error(res.message));
                    return;
                }
                resolve({
                    id: res.data.id,
                    content: res.data.content,
                    time: moment(res.data.time).valueOf(),
                });
            });
        });
    }
}
