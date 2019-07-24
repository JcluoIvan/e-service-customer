<template>

    <!-- Modal -->
    <div class="modal fade"
        ref="dialog"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div class="modal-dialog"
            role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"
                        id="exampleModalLabel">
                        ES 客服系統
                    </h5>
                </div>
                <div class="modal-body">
                    <div v-if="isWaiting">
                        客服目前忙碌中... 請您耐心等待, 我們將立即為您服務。
                    </div>
                    <form @submit.prevent="connect"
                        v-else>
                        <h6>請問我們該怎麼稱呼您？</h6>
                        <div class="form-group row align-items-center">
                            <div class="col">
                                <input type="text"
                                    ref="name"
                                    class="form-control"
                                    v-model="input.name">
                            </div>
                            <div class="col-auto">
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input"
                                        type="radio"
                                        name="inlineRadioOptions"
                                        v-model="input.gender"
                                        id="gender-male"
                                        value="先生">
                                    <label class="form-check-label"
                                        for="gender-male">先生</label>
                                </div>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input"
                                        type="radio"
                                        name="inlineRadioOptions"
                                        id="gender-female"
                                        v-model="input.gender"
                                        value="小姐">
                                    <label class="form-check-label"
                                        for="gender-female">小姐</label>
                                </div>
                            </div>
                        </div>
                        <div class="form-group row">
                            <div class="col"></div>
                            <div class="col-auto">
                                <button class="btn btn-primary">確定</button>
                            </div>
                        </div>
                    </form>
                </div>
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
        dialog: HTMLDivElement;
        name: HTMLInputElement;
    };
    public input = {
        name: 'Guest',
        gender: '先生',
    };

    public $dialog!: JQuery<HTMLDivElement>;

    get id() {
        return (this.$route.query.id || '').toString();
    }

    get isWaiting() {
        return store.state.status === 'waiting';
    }

    get isStart() {
        return store.state.status === 'start';
    }

    @Watch('isStart', { immediate: true }) public watchIsStart(start: boolean) {
        if (start) {
            this.close();
        }
    }

    public mounted() {
        this.$dialog = $(this.$refs.dialog);
        this.$dialog.on('shown.bs.modal', () => {
            this.$refs.name.select();
        });
    }
    public open() {
        this.$dialog.modal({
            backdrop: 'static',
        });
    }

    public close() {
        this.$dialog.modal('hide');
    }

    public connect() {
        const name = `${this.input.name}. ${this.input.gender}`;
        console.info('connect');
        actions.connect(this.id, name);

        // connect
    }
}
</script>
