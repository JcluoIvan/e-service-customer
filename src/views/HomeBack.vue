<template>
    <div class="home-component">
        <div class="chat-wrapper">
            <div class="chat-wrapper__title">
                <div class="executive-panel"
                    v-if="executive.id > 0">
                    <div class="executive-panel__image">
                        <img :src="executive.imageUrl"
                            alt=""
                            v-if="executive.imageUrl">
                        <object :data="icons.service"
                            v-else></object>
                    </div>
                    <label class='executive-panel__name'>
                        {{ executive.name }}
                    </label>
                </div>
            </div>
            <div class="chat-wrapper__messages"
                :class="{drag: drag}"
                @dragenter.prevent.stop="onDragEnter">
                <div class="message-content"
                    ref="messageContent">
                    <div class="message-cell"
                        v-for="msg in messages"
                        :key="msg.key"
                        :class="msg.className">
                        <div class="message-cell__wrapper">
                            <div v-if="!msg.isSelf"
                                class="message-cell__profile">
                                <div class="image-wrapper">
                                    <img class="image-wrapper__profile"
                                        v-if="msg.user.imageUrl"
                                        :src="msg.user.imageUrl"
                                        alt="">
                                    <object class="image-wrapper__profile default-icon"
                                        v-else-if="msg.user.id"
                                        :data="icons.service"></object>
                                    <object class="image-wrapper__profile default-icon"
                                        v-else
                                        :data="icons.customer"></object>
                                </div>
                                <label class="image-wrapper__name">{{ msg.speakerName }}</label>
                            </div>
                            <a class="message-cell__content_image"
                                target="_blank"
                                :href="msg.content"
                                v-if="msg.type ==='image'">
                                <img :src="msg.content | thum"
                                    @load="toScrollBottom(true)" />
                            </a>
                            <div class="message-cell__content"
                                v-else
                                v-html="toHtml(msg.content)"></div>
                            <small class="message-cell__time">{{ msg.time | dt('HH:mm') }}</small>
                        </div>
                    </div>
                </div>
                <div class="drag-upload-panel"
                    ref="dropPanel"
                    @dragleave.prevent.stop="onDragLeave"
                    @dragover.prevent.stop
                    @drop.prevent.stop="onDropFile"
                    dropzone="copy">
                    <i class="upload-image-icon material-icons">photo</i>
                </div>
            </div>
            <form @submit.prevent
                class="form-group mb-0 chat-wrapper__footer">
                <div class="options-panel row no-gutters">
                    <div class="col">
                        <button class="options-item emoji-icons">
                            🙂
                            <div class="emoji-list-panel">
                                <EmojiList @select="onSelectEmoji" />
                            </div>
                        </button>
                        <button class="options-item"
                            @click="$refs.inputFile.click()">
                            <i class=" material-icons">image</i>
                        </button>
                        <input type="file"
                            ref="inputFile"
                            accept=".jpg,.jpeg,.png"
                            class="upload-image-input"
                            @change="onUploadFile" />
                    </div>
                </div>
                <div class="input-panel row no-gutters">
                    <div class="col input-panel__textarea-wrapper">
                        <textarea class="form-control"
                            ref="textarea"
                            v-model="input.message"
                            :disabled="disabledTextarea"
                            @keydown.enter.exact.prevent.stop="sendMessage"></textarea>
                    </div>
                    <div class="col-auto">
                        <button class="btn btn-primary send-button"
                            :disabled="disabledSubmit"
                            @click.prevent="sendMessage">Send</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import store, { actions } from '../store';
import emojis, { EmojiItem } from '@/support/emojis';
import EmojiList from '../components/EmojiList.vue';

const serviceIcon = require('@/assets/icons/customer-service-svgrepo-com.svg');
@Component({
    filters: {
        thum(url: string) {
            const arr = url.split('.');
            const ext = arr.pop();
            return `${arr.join('.')}.min.${ext}`;
        },
    },
    components: {
        EmojiList,
    },
})
export default class Home extends Vue {
    public $refs!: {
        messageContent: HTMLDivElement;
        textarea: HTMLTextAreaElement;
    };

    public input = {
        message: '',
    };

    public drag = false;

    get icons() {
        return {
            service: serviceIcon,
        };
    }
    get status() {
        return store.state.status;
    }
    get messages() {
        return store.state.talk.messages
            .map((m) => {
                const isSelf = m.user.id === 0;
                return {
                    ...m,
                    className: {
                        'self-message': isSelf,
                    },
                    isSelf,
                    idSort: m.id ? 1 : 0,
                    speakerName: m.user.name,
                    key: (m.id ? m.id : `${m.id}-${m.sid}`).toString(),
                };
            })
            .sort((a, b) => b.idSort - a.idSort || a.time - b.time);
    }

    get isStart() {
        return store.state.talk.executive.id > 0;
    }

    get disabledTextarea() {
        return !this.isStart;
    }

    get disabledSubmit() {
        const { message } = this.input;
        return !this.isStart || !message;
    }
    get executive() {
        return store.state.talk.executive;
    }
    public mounted() {
        // actions.connect('', '王先生');
    }

    @Watch('messages', { immediate: true }) public watchMessages() {
        this.$nextTick(() => {
            this.$refs.messageContent.scrollTop = this.$refs.messageContent.scrollHeight;
        });
    }

    public toHtml(content: string) {
        return content.replace(/(https?\:\/\/[\w\.\p\-\/\?=&:#%]+)/g, '<a target="_blank" href="$1">$1</a>');
    }

    public sendMessage() {
        if (this.input.message) {
            actions.sendMessage(this.input.message);
            this.input.message = '';
        }
    }

    public onSelectEmoji(item: EmojiItem) {
        const textarea = this.$refs.textarea;
        const message = this.input.message;
        const end = textarea.selectionEnd;
        const start = textarea.selectionStart;
        this.input.message = `${message.substr(0, start)}${item.emoji}${message.substr(end)}`;
        textarea.setSelectionRange(textarea.selectionEnd, textarea.selectionEnd);
        setTimeout(() => {
            textarea.focus();
        }, 0);
    }

    public toScrollBottom(nextTick = false) {
        if (nextTick) {
            this.$nextTick(() => {
                this.$refs.messageContent.scrollTop = this.$refs.messageContent.scrollHeight;
            });
        } else {
            this.$refs.messageContent.scrollTop = this.$refs.messageContent.scrollHeight;
        }
    }

    public onDragEnter(event: DragEvent) {
        if (event.dataTransfer && event.dataTransfer.types && event.dataTransfer.types[0] === 'Files') {
            this.drag = true;
        }
    }
    public onDragLeave(event: DragEvent) {
        this.drag = false;
    }
    public onDropFile(event: DragEvent) {
        const [file] = (event.dataTransfer && event.dataTransfer.files) || [null];
        this.drag = false;

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
        reader.onloadend = () => {
            if (reader.result) {
                actions.sendImage(reader.result.toString(), fileType);
            } else {
                console.error(`empty data`, reader.result);
            }
        };
        reader.readAsDataURL(file);
    }
}
</script>
<style lang="scss" scoped>
$borderColor: #999;
.home-component {
    position: relative;
    padding: 1rem;
    height: 100%;
    .chat-wrapper {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        border-radius: 0.25rem;
        box-shadow: 0.25rem 0.25rem 0.5rem 0 #ccc;
        border: 1px solid #bbb;

        .chat-wrapper__title {
            position: relative;
            flex: none;
            background: #20c4cb;
            color: #fff;
            border-radius: 0.25rem 0.25rem 0 0;
            box-shadow: 3px 3px 3px 1px #999;
            z-index: 1;
            min-height: 30px;

            .executive-panel {
                padding: 5px 20px;
                .executive-panel__image {
                    position: relative;
                    display: inline-block;
                    vertical-align: middle;
                    width: 30px;
                    height: 30px;
                    overflow: hidden;
                    border-radius: 50%;
                    border: 1px solid #fff;
                    image,
                    object {
                        position: relative;
                        width: 100%;
                        height: 100%;
                    }
                }
                .executive-panel__name {
                    display: inline-block;
                    vertical-align: middle;
                    margin: 0 0 0 20px;
                }
            }
        }
        .chat-wrapper__messages {
            position: relative;
            flex: 1;
            display: inline-block;
            background: #eee;
            overflow: hidden;
            box-sizing: border-box;
            vertical-align: bottom;

            .message-content {
                position: absolute;
                width: 100%;
                max-height: 100%;
                bottom: 0;
                overflow-y: auto;
                overflow-x: hidden;
            }

            .message-cell {
                position: relative;
                display: flex;
                justify-content: flex-start;
                width: 100%;
                .message-cell__wrapper {
                    position: relative;
                    margin: 0.5rem;
                    max-width: 80%;
                    min-width: 40%;
                    padding-bottom: 18px;
                    display: flex;

                    .message-cell__profile {
                        position: relative;
                        flex: none;
                        padding: 0 5px;

                        .image-wrapper {
                            position: relative;
                            border: 1px solid #ccc;
                            border-radius: 50%;
                            overflow: hidden;
                            width: 40px;
                            height: 40px;
                        }
                        .image-wrapper__profile {
                            position: relative;
                            width: 100%;
                        }
                        .image-wrapper__name {
                            position: absolute;
                            font-size: 0.8rem;
                            left: 0;
                            min-width: 100%;
                            text-align: center;
                            white-space: nowrap;
                        }
                    }
                    .message-cell__content {
                        box-sizing: border-box;
                        flex: 1;
                        border: 1px solid #ccc;
                        border-radius: 5px;
                        background: #fff;
                        padding: 0.5rem;
                        unicode-bidi: embed;
                        font-family: 'Microsoft JhengHei';
                        white-space: pre-wrap;
                        word-break: break-all;
                        font-size: 1rem;
                    }
                    .message-cell__content_image {
                        position: relative;
                        box-sizing: border-box;
                        flex: 1;
                        border: 1px solid #ccc;
                        border-radius: 5px;
                        background: #fff;
                        padding: 0.25rem;
                        & img {
                            width: 100%;
                        }
                    }
                    .message-cell__time {
                        position: absolute;
                        bottom: 0;
                        right: 4px;
                        font-family: monospace;
                    }
                }

                &.self-message {
                    justify-content: flex-end;
                }
            }
            .drag-upload-panel {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                border: 10px dashed #333;
                background: #aaa;
                text-align: center;
                opacity: 0.75;
                display: none;
                i.upload-image-icon {
                    position: relative;
                    top: 20%;
                    width: 100%;
                    text-align: center;
                    font-size: 256px;
                    pointer-events: none;
                }
            }

            &.drag .drag-upload-panel {
                display: block;
            }
        }
        .chat-wrapper__footer {
            position: relative;
            flex: none;
            box-sizing: border-box;
            box-shadow: -3px 0px 3px 1px #ccc;
            padding: 0 10px 10px 10px;

            .options-panel {
                padding-right: 60px;
                .options-item {
                    display: inline-block;
                    background: #fff;
                    border: 1px solid #ccc;
                    text-align: center;
                    line-height: 2rem;
                    font-size: 1.2rem;
                    padding: 0;
                    border-radius: 3px;
                    height: 2rem;
                    width: 2rem;
                    cursor: pointer;
                    margin: 0;
                    margin-right: 0.25rem;
                    line-height: 1;

                    &.emoji-icons {
                        font-size: 0.9rem;
                        .emoji-list-panel {
                            cursor: default;
                            text-align: left;
                            position: absolute;
                            z-index: 10;
                            bottom: 2rem;
                            display: none;
                            &:hover {
                                display: block;
                            }
                        }

                        &:focus {
                            .emoji-list-panel {
                                display: block;
                            }
                        }
                    }

                    &:hover {
                        background: #ddd;
                    }
                }

                .upload-image-input {
                    display: none;
                }
            }
            .input-panel {
                position: relative;
                width: 100%;
                .input-panel__textarea-wrapper {
                    position: relative;
                }

                textarea {
                    resize: none;
                    border-radius: 5px 0 0 5px;
                }
                button.send-button {
                    height: 100%;
                    border-radius: 0 5px 5px 0;
                    width: 60px;
                }
            }
        }
    }
}
</style>
