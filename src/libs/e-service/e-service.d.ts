declare namespace IES {
    type ListenerHandle<D = any> = (data: D) => void;
    type ResponseData<T = any> = {
        code: number;
        message: string;
        invalids: any;
        data: T;
    };
    type EmitterHandle<D, R> = (data: D, response: ResponseData<D>) => void;
    namespace EmitterData {
        namespace CenterSend {
            interface Request {
                content: string;
                type: 'text/plain' | 'image/jpeg' | 'image/png';
            }
            interface Response {
                id: number;
                time: string;
            }
        }
    }
    namespace ListenerData {
        interface Message {
            id: number;
            taskId: number;
            content: string;
            type: 'text' | 'image';
            time: string;
        }
        interface CenterJoin {
            taskId: number;
            user: {
                id: number;
                name: string;
            };
        }
        interface CenterLeave {
            taskId: number;
            userId: number;
        }
    }
}

declare namespace SocketIOClient {
    interface Socket {
        on(event: string | symbol, ...args: any[]): this;
        on(event: 'disconnect'): boolean;
        /** 收到訊息 */
        on(event: 'center/send', listener: IES.ListenerHandle<IES.ListenerData.Message>): this;
        /** 主管加入 */
        on(event: 'center/join', listener: IES.ListenerHandle<IES.ListenerData.CenterJoin>): this;
        /** 主管離開 */
        on(event: 'center/leave', listener: IES.ListenerHandle<IES.ListenerData.CenterLeave>): this;
        /** 加入房間, 專員開始服務 */
        on(event: 'center/start', listener: IES.ListenerHandle): this;

        emit(type: string | number, ...args: any[]): boolean;
        /** 傳送訊息 */
        emit(
            event: 'center/send',
            data: IES.EmitterData.CenterSend.Request,
            response: (res: IES.ResponseData<IES.EmitterData.CenterSend.Response>) => void,
        ): boolean;
    }
}
