<template>
    <div>
        <audio ref="audio"
            :loop="loop"
            @loadeddata="onLoaded"
            :src="src" />
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Mixins } from 'vue-property-decorator';
import VueEventListener from '../mixins/VueEventListener';

@Component
export default class SoundEffect extends Mixins(VueEventListener) {
    public $refs!: {
        audio: HTMLAudioElement;
    };

    @Prop(String) public src!: string;

    @Prop({ type: Boolean, default: true }) public loop!: boolean;

    private loaded = false;

    private paused = true;

    private playQueue = false;

    get isPaused() {
        return this.paused;
    }

    public mounted() {
        const audio = this.$refs.audio;
        this.addListener(audio, 'pause', (event) => (this.paused = true));
        this.addListener(audio, 'playing', (event) => (this.paused = false));
    }

    public play(reset = true) {
        if (!this.loaded) {
            this.playQueue = true;
            return;
        }

        if (reset) {
            this.$refs.audio.currentTime = 0;
        }

        if (this.$refs.audio.paused) {
            this.$refs.audio.play();
        }
    }

    public pause() {
        if (!this.loaded) {
            this.playQueue = false;
            return;
        }

        this.$refs.audio.pause();
    }
    public stop() {
        this.$refs.audio.pause();
        this.$refs.audio.currentTime = 0;
    }
    private onLoaded() {
        this.loaded = true;
        if (this.playQueue) {
            this.play();
        }
        this.$emit('load');
    }
}
</script>
