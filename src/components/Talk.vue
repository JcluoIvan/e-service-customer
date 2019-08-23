<template>
    <div class="Talk-Component">
        <div class="wrapper d-flex flex-column">

            <!-- <div class="wrapper-title row no-gutters">
                <div class="col">
                    <Profile type="service"
                        :url="talk.executive.url"
                        size="small" />
                </div>
            </div> -->
            <!-- <div class="wrapper-content flex-fill"> -->
            <DropFileUpload class="wrapper-content flex-fill"
                @drop-files="onDropFiles">
                <div class="alert alert-warning"
                    v-show="isWaiting"
                    role="alert">
                    請稍後，我們將為您服務！
                </div>
                <div class="alert alert-danger"
                    v-show="isDisconnected"
                    role="alert">
                    您已離線。
                </div>
                <div class="message-list"
                    ref="messageList">
                    <TalkMessage v-for="msg in messages"
                        :key="`${msg.id}-${msg.sid}`"
                        :message="msg"
                        @img-load="toScrollBottom(true)" />
                </div>
            </DropFileUpload>
            <div class="wrapper-footer"
                v-if="isDisconnected">
                <button class="btn btn-danger btn-block reconnect-btn"
                    @click="reconnect"
                    v-if="isDisconnected">
                    重新連線
                </button>
            </div>
            <div class="wrapper-footer"
                v-else>
                <div class="options">
                    <button class="options-item emojis-btn">🙂</button>
                    <Emojis class="emojis-panel"
                        @select="onSelectEmoji" />
                    <button class="options-item"
                        @click="$refs.inputFile.click()">
                        <i class=" material-icons">image</i>
                    </button>
                    <input type="file"
                        ref="inputFile"
                        v-show="false"
                        accept=".jpg,.jpeg,.png"
                        @change="onUploadFile" />
                </div>
                <textarea class="form-control"
                    ref="textarea"
                    v-model="input.message"
                    @keydown.enter.exact.prevent="sendMessage()"></textarea>
            </div>
        </div>

        <SoundEffect ref="effectNotification01"
            :src="effects.notification01"
            :loop="false" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import Emojis from '@/components/Emojis.vue';
import Profile from '@/components/Profile.vue';
import DropFileUpload from '@/components/DropFileUpload.vue';
import { EmojiItem } from '@/support/emojis';
import SoundEffect from '@/components/SoundEffect.vue';
import { actions } from '../stores/actions';
import store from '../store';
import TalkMessage from './TalkMessage.vue';
const effects = {
    notification01: require('@/assets/sound-effect/Notification-01.wav'),
};

@Component({
    components: {
        SoundEffect,
        DropFileUpload,
        Profile,
        Emojis,
        TalkMessage,
    },
})
export default class Talk extends Vue {
    public $refs!: {
        messageList: HTMLDivElement;
        textarea: HTMLTextAreaElement;
        dropPanel: HTMLDivElement;
        effectNotification01: SoundEffect;
    };

    public input = {
        message: '',
    };
    get talk() {
        return store.state.talk;
    }

    get effects() {
        return effects;
    }

    get messages() {
        const talk = this.talk;
        return talk.messages
            .map((m) => {
                const isSelf = m.user.id === 0;
                return {
                    ...m,
                    className: {
                        'self-message': isSelf,
                    },
                    isSelf,
                    idSort: m.id ? 1 : 0,
                    speakerName: m.user.id ? m.user.name : '',
                    key: (m.id ? m.id : `${m.id}-${m.sid}`).toString(),
                };
            })
            .sort((a, b) => b.idSort - a.idSort || a.time - b.time);
    }

    get isWaiting() {
        return this.talk.startAt === 0;
    }

    get isDisconnected() {
        return store.state.status === 'disconnected';
    }

    get lastNotSelfMessageId() {
        return this.talk.messages.reduce((mx, m) => (m.user.id > 0 ? Math.max(m.id, mx) : mx), 0);
    }

    @Watch('messages', { immediate: true }) public watchMessages() {
        this.toScrollBottom(true);
    }

    @Watch('lastNotSelfMessageId') public watchLastOtherMessageId() {
        this.$refs.effectNotification01.play();
    }

    public mounted() {
        this.reconnect();
    }
    public beforeDestroy() {
        actions.disconnect();
    }

    public reconnect() {
        actions.disconnect();
        actions.connect('', 'guest');
    }

    public insertText(text: string) {
        const message = this.input.message;
        const start = this.$refs.textarea.selectionStart;
        const end = this.$refs.textarea.selectionEnd;
        if (start === end) {
            this.input.message = `${message.substr(0, start)}${text}${message.substr(end)}`;
        }
        setTimeout(() => {
            const idx = start + text.length;
            this.$refs.textarea.focus();
            this.$refs.textarea.setSelectionRange(idx, idx);
        }, 0);
    }

    public sendMessage() {
        if (this.input.message) {
            actions.sendMessage(this.input.message);
            this.input.message = '';
        }
    }

    public onSelectEmoji(item: EmojiItem) {
        this.insertText(item.emoji);
    }

    public onDropFiles(event: DragEvent) {
        const [file] = (event.dataTransfer && event.dataTransfer.files) || [null];
        if (!file) {
            return;
        }
        this.uploadImage(file);
    }
    public onUploadFile(event: any) {
        const [file = null] = event.target.files || [];
        if (!file) {
            return;
        }
        this.uploadImage(file);
    }
    public uploadImage(file: File) {
        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
            console.error(`error type > ${file.type}`);
            return;
        }
        const fileType = file.type;
        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
            if (reader.result) {
                actions.sendImage(reader.result.toString(), fileType);
            } else {
                console.error(`empty data`, reader.result);
            }
        });
        reader.readAsDataURL(file);
    }

    public toScrollBottom(nextTick = false) {
        if (nextTick) {
            this.$nextTick(() => {
                this.$refs.messageList.scrollTop = this.$refs.messageList.scrollHeight;
            });
        } else {
            this.$refs.messageList.scrollTop = this.$refs.messageList.scrollHeight;
        }
    }
}
</script>
<style lang="scss" scoped>
@import '@/assets/scss/common.scss';
.Talk-Component {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 5px;
}
.wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border: 1px solid #ccc;
    background: #fff;
}

.wrapper-title {
    padding: 10px;
    box-sizing: border-box;
    box-shadow: 0px 3px 3px 1px #ccc;
    z-index: 1;
}
.wrapper-content {
    position: relative;
    background: #eee;

    .alert {
        position: absolute;
        top: 1px;
        left: 0;
        z-index: 10;
        width: 100%;
    }

    .message-list {
        position: absolute;
        width: 100%;
        max-height: 100%;
        bottom: 0;
        overflow-y: auto;
        overflow-x: hidden;
    }

}
.wrapper-footer {
    border-top: 1px solid #ccc;
    textarea {
        height: 80px;
        resize: none;
    }

    .reconnect-btn {
        height: 60px;
    }
}
.options {
    position: relative;
    width: 100%;
    padding: 5px;

    .options-item {
        display: inline-block;
        background: #fff;
        border: 1px solid #ccc;
        text-align: center;
        line-height: 2rem;
        font-size: 1rem;
        padding: 0;
        border-radius: 3px;
        height: 2rem;
        width: 2rem;
        cursor: pointer;
        margin: 0;
        margin-right: 0.25rem;
        line-height: 1;
        vertical-align: top;
    }

    .emojis-panel {
        position: absolute;
        top: 0;
        left: 0;
        max-width: 90%;
        transform: translateY(-100%);
        display: none;
        &:hover {
            display: block;
        }
    }
    .emojis-btn:focus ~ .emojis-panel {
        display: block;
    }

    .articles-panel {
        position: absolute;
        top: 0;
        left: 0;
        max-width: 90%;
        transform: translateY(-100%);
        border: 1px solid #ccc;
        display: none;
        &:hover {
            display: block;
        }
    }
    .articles-btn:focus ~ .articles-panel {
        display: block;
    }
}
</style>
