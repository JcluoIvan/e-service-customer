<template>
    <div class="home">
        <div class="status-panel">{{ status }}</div>
        <div class="message-wrapper">
            <div class="message-wrapper__content">
                <dir v-for="msg in messages" :key="`${msg.id}-${msg.key}`">{{ msg.content }}</dir>
            </div>
            <form
                class="message-wrapper__footer form-group row no-gutters message-wrapper__footer"
                @submit.prevent="send"
            >
                <div class="col">
                    <textarea class="form-control input-content" v-model="input.message"></textarea>
                </div>
                <div class="col-auto">
                    <button class="btn btn-primary btn-block send-message">Send</button>
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
        return store.state.task.messages.sort((a, b) => a.time - b.time);
    }
    public mounted() {
        actions.connect('', '王先生');
    }
    public send() {
        actions.sendMessage(this.input.message);
        this.input.message = '';
    }
    public upload() {
        actions.uploadImage('', 'image/jpeg');
    }
}
</script>
<style lang="scss" scoped>
.home {
    position: relative;
    padding: 5px;
    height: 100%;
    display: flex;
    flex-direction: column;

    .status-panel {
        height: 40px;
        flex: none;
    }
    .message-wrapper {
        position: relative;
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;

        .message-wrapper__content {
            flex: 1;
        }
        .message-wrapper__footer {
            flex: none;
            height: 80px;
            textarea.input-content {
                height: 100%;
                resize: none;
                border-radius: 0.25rem 0 0 0.25rem;
            }
            button.send-message {
                height: 100%;
                padding: 0 20px;
                border-radius: 0 0.25rem 0.25rem 0;
            }
        }
    }
}
</style>
