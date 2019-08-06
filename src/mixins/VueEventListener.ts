import { Vue, Component } from 'vue-property-decorator';
import { invalid } from 'moment';

type OffFunction = () => void;

@Component
export default class VueEventListener extends Vue {
    private OffEventListeners: OffFunction[] = [];
    public addListener<K extends keyof HTMLMediaElementEventMap, T>(
        el: T,
        event: K,
        cb: (this: HTMLAudioElement, ev: HTMLMediaElementEventMap[K]) => any,
    ) {
        const off = () => {
            console.warn('off');
            (el as any).removeEventListener(event, cb);
        };
        (el as any).addEventListener(event, cb);
        this.OffEventListeners.push(off);
        return off;
    }
}
