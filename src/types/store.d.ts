declare namespace IStore {
    interface State {
        status: 'disconnected' | 'connecting' | 'connected';
        customer: {
            id: string;
            name: string;
        };
        token: string;
        task: TaskCenter.Task;
    }

    interface UserInfo {
        id: number;
        name: string;
        imageUrl: string;
    }

    namespace TaskCenter {
        interface Message {
            id: number;
            /** 更新訊息使用 */
            sid?: number;
            user: UserInfo;
            content: string;
            type: 'text' | 'image';
            time: number;
        }

        interface Task {
            executive: UserInfo;
            messages: Message[];
            startAt: number;
            createdAt: number;
        }

        interface Send {
            sid: number;
            content: string;
            type: 'text' | 'image';
        }
        interface SendSuccess {
            id: number;
            content: string;
            sid: number;
            time: number;
        }
        interface SendFail {
            sid: number;
            message: string;
        }
    }

    interface Actions {
        (name: 'disconnected' | 'connecting' | 'connected' | 'waiting'): void;
        (name: 'token', token: string): void;
        (name: 'center/task', data: TaskCenter.Task): void;
        (name: 'center/start', data: TaskCenter.Task): void;
        (name: 'center/waiting'): void;
        (name: 'center/message', message: TaskCenter.Message): void;
        (name: 'center/send', data: TaskCenter.Send): void;
        (name: 'center/send-success', data: TaskCenter.SendSuccess): void;
        (name: 'center/send-fail', data: TaskCenter.SendFail): void;
    }

    interface Mutations<S> {
        disconnected?: (state: S) => void;
        connecting?: (state: S) => void;
        connected?: (state: S) => void;
        token?: (state: S, token: string) => void;
        'center/waiting'?: (state: S) => void;
        'center/task'?: (state: S, data: TaskCenter.Task) => void;
        'center/start'?: (state: S, data: TaskCenter.Task) => void;
        'center/message'?: (state: S, message: TaskCenter.Message) => void;
        'center/send'?: (state: S, data: TaskCenter.Send) => void;
        'center/send-success'?: (state: S, data: TaskCenter.SendSuccess) => void;
        'center/send-fail'?: (state: S, data: TaskCenter.SendFail) => void;
    }
}
