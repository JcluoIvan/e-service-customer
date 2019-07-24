<template>
    <div class="home-component">
        <div class="chat-wrapper">
            <div class="chat-wrapper__title">{{ executive.name }}</div>
            <div class="chat-wrapper__messages">
                <div class="message-content"
                    ref="messageContent">
                    <div class="message-cell"
                        v-for="msg in messages"
                        :key="msg.key"
                        :class="msg.className">
                        <div class="message-cell__wrapper">
                            <div v-if="!msg.isSelf"
                                class="message-cell__image">
                                <div class="image-wrapper">
                                    <img class="image-wrapper__image"
                                        v-if="msg.user.imageUrl"
                                        :src="msg.user.imageUrl"
                                        alt />
                                    <object class="image-wrapper__image default-icon"
                                        v-else-if="msg.user.id"
                                        :data="icons.service"></object>
                                    <object class="image-wrapper__image default-icon"
                                        v-else
                                        :data="icons.customer"></object>
                                </div>
                                <label class="image-wrapper__name">{{ msg.speakerName }}</label>
                            </div>
                            <div class="message-cell__content">{{ msg.content }}</div>
                            <small class="message-cell__time">{{ msg.time | dt('HH:mm') }}</small>
                        </div>
                    </div>
                </div>
            </div>
            <form @submit.prevent
                class="form-group mb-0 chat-wrapper__footer">
                <div class="input-panel row no-gutters">
                    <div class="col input-panel__textarea-wrapper">
                        <textarea class="form-control"
                            ref="textarea"
                            v-model="input.message"
                            @keydown.enter.exact.prevent="sendMessage"></textarea>
                    </div>
                    <div class="col-auto">
                        <button class="btn btn-primary"
                            @click.prevent="sendMessage">Send</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import store, { actions } from '../store';
@Component
export default class Home extends Vue {
    public input = {
        message: '',
    };
    get status() {
        return store.state.status;
    }
    get messages() {
        return store.state.task.messages
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

    get executive() {
        return store.state.task.executive;
    }
    public mounted() {
        // actions.connect('', '王先生');
    }
    public sendMessage() {
        actions.sendMessage(this.input.message);
        this.input.message = '';
    }
    public upload() {
        actions.uploadImage('', 'image/jpeg');
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

        .chat-wrapper__title {
            position: relative;
            flex: none;
            background: #20c4cb;
            color: #fff;
            padding: 10px 20px;
            border-radius: 0.25rem 0.25rem 0 0;
            box-shadow: 3px 3px 3px 1px #999;
            z-index: 1;
            min-height: 30px;

            .online-status {
                padding: 1px;
                border-radius: 2rem;
                background: #fff;
                &.online {
                    color: #28a745;
                }
                &.offline {
                    // color: #6c757d;
                    color: #bbb;
                    background: #eee;
                }
            }

            .leave-task-button {
                float: right;
            }
        }
        .chat-wrapper__messages {
            position: relative;
            flex: 1;
            display: inline-block;
            background: #eee;
            overflow: hidden;
            border-left: 1px solid $borderColor;
            border-right: 1px solid $borderColor;
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

                    .message-cell__image {
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
                        .image-wrapper__image {
                            position: relative;
                            width: 100%;
                        }
                        .image-wrapper__name {
                            position: absolute;
                            font-size: 0.8rem;
                            text-align: center;
                            left: 0;
                            width: 100%;
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
                        word-wrap: break-word;
                        font-size: 1rem;
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
            // box-shadow: 3px 3px 3px 1px #555;
        }
        .chat-wrapper__footer {
            position: relative;
            flex: none;
            box-sizing: border-box;
            border-left: 1px solid $borderColor;
            border-right: 1px solid $borderColor;
            border-bottom: 1px solid $borderColor;
            border-radius: 0 0 0.25rem 0.25rem;
            padding: 10px;
            .input-panel {
                position: relative;
                width: 100%;
                height: 100%;
                .input-panel__textarea-wrapper {
                    position: relative;
                    .datalist-panel {
                        position: absolute;
                        box-shadow: 3px 3px 3px 1px #ccc;
                        bottom: 100%;
                        margin-bottom: 5px;
                        transform: scaleY(0);
                        transform-origin: 0 100%;
                        transition: 150ms;
                        min-width: 120px;
                        &.active {
                            transform: scale(1);
                        }
                    }
                }

                textarea {
                    resize: none;
                    border-radius: 0.25rem 0 0 0.25rem;
                }
                button {
                    border-radius: 0 0.25rem 0.25rem 0;
                    height: 100%;
                }
            }
        }
    }
}
</style>
