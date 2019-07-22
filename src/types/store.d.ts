declare namespace IStore {
    interface UserInfo {
        id: number;
        name: string;
        imageUrl: string;
    }

    namespace TaskCenter {
        interface Message {
            id: number;
            /** 更新訊息使用 */
            key: number;
            user: UserInfo;
            content: string;
            type: 'text' | 'image';
            time: number;
        }

        interface Task {
            executive: UserInfo;
            watchers: UserInfo[];
            messages: Message[];
            startAt: number;
            closedAt: number;
            createdAt: number;
        }

        interface Send {
            key: number;
            content: string;
            type: 'text' | 'image';
        }
        interface SendSuccess {
            id: number;
            content: string;
            key: number;
            time: number;
        }
        interface SendFail {
            key: number;
            message: string;
        }
    }

    interface State {
        status: 'disconnected' | 'connecting' | 'waiting' | 'start';
        customer: {
            id: string;
            name: string;
        };
        token: string;
        task: TaskCenter.Task;
    }
    interface Actions {
        (name: 'disconnected' | 'connecting' | 'waiting'): void;
        (name: 'token', token: string): void;
        (name: 'center/start', data: TaskCenter.Task): void;
        (name: 'center/message', message: TaskCenter.Message): void;
        (name: 'center/send', data: TaskCenter.Send): void;
        (name: 'center/send-success', data: TaskCenter.SendSuccess): void;
        (name: 'center/send-fail', data: TaskCenter.SendFail): void;
    }

    interface Mutations<S> {
        disconnected?: (state: S) => void;
        connecting?: (state: S) => void;
        waiting?: (state: S) => void;
        token?: (state: S, token: string) => void;
        'center/start'?: (state: S, data: TaskCenter.Task) => void;
        'center/message'?: (state: S, message: TaskCenter.Message) => void;
        'center/send'?: (state: S, data: TaskCenter.Send) => void;
        'center/send-success'?: (state: S, data: TaskCenter.SendSuccess) => void;
        'center/send-fail'?: (state: S, data: TaskCenter.SendFail) => void;
    }
}
