<template>
    <div class="home">
        <div class="status-panel">{{ status }}</div>
        <div class="message-wrapper"></div>
        <div class="message-list"></div>
        <form class="send-form form-group row no-gutters" @submit.prevent="send">
            <div class="col">
                <textarea class="form-control" v-model="content"></textarea>
            </div>
            <div class="col-auto">
                <button class="btn btn-primary btn-block">Send</button>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import store, { actions } from '../store';

export default Vue.extend({
    data: () => ({
        content: '',
    }),
    computed: {
        status() {
            return store.state.status;
        },
    },
    mounted() {
        actions.connect('', '王先生');
    },
    methods: {
        send() {
            actions.sendMessage('hello');
        },
        upload() {
            actions.uploadImage('', 'image/jpeg');
        },
    },
});
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
    .message-list {
        flex: 1;
    }
    .send-form {
        flex: none;
        height: 80px;
        textarea {
            height: 100%;
        }
        button {
            height: 100%;
            padding: 0 20px;
        }
    }
}
</style>
