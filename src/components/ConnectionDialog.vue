<template>

    <div class="connection-dialog-component"
        :class="{visible}">

        <div class="dialog-content">
            <h5>
                ES 客服系統
            </h5>
            <hr>
            <div v-if="isWaiting">
                客服目前忙碌中... 請您耐心等待, 我們將立即為您服務。
            </div>

        </div>

    </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import $ from 'jquery';
import store, { actions } from '../store';
@Component
export default class ConnectionDialog extends Vue {
    public $refs!: {
        name: HTMLInputElement;
    };
    public input = {
        name: 'Guest',
        gender: '',
    };

    get isWaiting() {
        return store.state.task.executive.id === 0;
    }

    get visible() {
        return store.state.status !== 'connected' || this.isWaiting;
    }

    get id() {
        return (this.$route.query.id || '').toString();
    }
    public mounted() {
        this.connect();
    }
    public connect() {
        const name = `${this.input.name}. ${this.input.gender}`;
        console.info('connect');
        actions.connect(this.id, name);

        // connect
    }
}
</script>

<style lang="scss" scoped>
.connection-dialog-component {
    z-index: 100;
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background: rgba(0, 0, 0, 0.5);
    display: none;

    .dialog-content {
        position: relative;
        background: #fff;
        width: 80%;
        padding: 40px;
        margin: auto;
        top: 40%;
        transform: translateY(-100%);
        transition: 150ms;
    }

    &.visible {
        display: block;
        .dialog-content {
            transform: translateY(-50%);
        }
    }
}
</style>
