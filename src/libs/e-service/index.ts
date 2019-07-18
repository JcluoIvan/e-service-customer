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
    (event: 'message', listener: ListenerHandle<Message>): T;
}

export interface Message {
    id: number;
    content: string;
    type: 'text' | 'image';
    time: string;
}

export default class EService extends EventEmitter {
    public on!: ListenerEvents<this>;
    private socket: SocketIOClient.Socket | null = null;
    private token: string = 'dev-token';

    constructor(private host: string) {

        super();
    }

    private get client() {
        if (!this.socket || !this.socket.connected) {
            throw new Error('no connect');
        }

        return this.socket;
    }

    public connect(id: string, name: string) {
        const token = this.token;
        this.socket = sio(this.host, { query: { id, name, token } });

        this.socket.on('center/send', (data) => {
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
        return new Promise<{ id: number; time: number }>((resolve, reject) => {
            const data: IES.EmitterData.CenterSend.Request = {
                content,
                type,
            };
            this.client.emit('center/send', data, (res) => {
                if (res.code !== 0) {
                    reject(new Error(res.message));
                    return;
                }
                resolve({
                    id: res.data.id,
                    time: moment(res.data.time).valueOf(),
                });
            });
        });
    }
}
