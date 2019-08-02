declare namespace IStore {
    interface State {
        status: 'disconnected' | 'connecting' | 'connected';
        customer: {
            id: string;
            name: string;
        };
        token: string;
        talk: Talks.Talk;
    }

    interface UserInfo {
        id: number;
        name: string;
        imageUrl: string;
    }

    namespace Talks {
        interface Message {
            id: number;
            /** 更新訊息使用 */
            sid?: number;
            user: UserInfo;
            content: string;
            type: 'text' | 'image';
            time: number;
        }

        interface Talk {
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
        (name: 'talks/talk', data: Talks.Talk): void;
        (name: 'talks/start', data: Talks.Talk): void;
        (name: 'talks/waiting'): void;
        (name: 'talks/message', message: Talks.Message): void;
        (name: 'talks/send', data: Talks.Send): void;
        (name: 'talks/send-success', data: Talks.SendSuccess): void;
        (name: 'talks/send-fail', data: Talks.SendFail): void;
    }

    interface Mutations<S> {
        disconnected?: (state: S) => void;
        connecting?: (state: S) => void;
        connected?: (state: S) => void;
        token?: (state: S, token: string) => void;
        'talks/waiting'?: (state: S) => void;
        'talks/talk'?: (state: S, data: Talks.Talk) => void;
        'talks/start'?: (state: S, data: Talks.Talk) => void;
        'talks/message'?: (state: S, message: Talks.Message) => void;
        'talks/send'?: (state: S, data: Talks.Send) => void;
        'talks/send-success'?: (state: S, data: Talks.SendSuccess) => void;
        'talks/send-fail'?: (state: S, data: Talks.SendFail) => void;
    }
}
