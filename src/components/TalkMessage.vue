<template>
    <div class="TalkMessage-Component"
        :class="className">
        <div v-if="isFromSystem"
            class="message-cell system-message alert alert-info">
            <div class="row no-gutters">
                <div class="col-auto">
                    <i class="material-icons system-message__icon">announcement</i>
                </div>
                <div class="col">
                    <div class="system-message__content">
                        {{ message.content }}
                    </div>
                </div>
            </div>
            <small class="system-message__time">{{ message.time | dt('HH:mm') }}</small>

        </div>
        <div class="message-cell"
            v-else>
            <div class="message-cell__wrapper">
                <div class="message-cell__profile"
                    v-if="isFromService">
                    <Profile :type="message.fromType"
                        :url="message.user.imageUrl"
                        size="small" />
                    <label class="message-cell__profile__name">{{ message.speakerName }}</label>
                </div>
                <a class="message-cell__content_image"
                    target="_blank"
                    :href="message.content"
                    v-if="message.type ==='image'">
                    <img :src="message.content | thum"
                        @load="toScrollBottom(true)" />
                </a>
                <div class="message-cell__content"
                    v-else
                    v-html="toHtml(message.content)"></div>
                <small class="message-cell__time">{{ message.time | dt('HH:mm') }}</small>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import Profile from '@/components/Profile.vue';
@Component({
    filters: {
        thum(url: string) {
            const arr = url.split('.');
            const ext = arr.pop();
            return `${arr.join('.')}.min.${ext}`;
        },
    },
    components: {
        Profile,
    },
})
export default class TalkMessage extends Vue {
    @Prop() public message!: IES.Message;

    get className() {
        const className: string[] = [];
        className.push(`from-${this.message.fromType}`);
        return className;
    }

    get isSelf() {
        return this.message.fromType === 'customer';
    }

    get isFromSystem() {
        return this.message.fromType === 'system';
    }

    get isFromService() {
        return this.message.fromType === 'service';
    }

    public toHtml(content: string) {
        return content.replace(/(https?\:\/\/[\w\.\p\-\/\?=&:#%]+)/g, '<a target="_blank" href="$1">$1</a>');
    }
}
</script>
<style lang="scss" scoped>
.TalkMessage-Component {
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
                padding: 5px 5px;

                .message-cell__profile__name {
                    position: absolute;
                    font-size: 0.8rem;
                    left: 0;
                    top: 38px;
                    width: 100%;
                    text-align: center;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
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
                text-align: center;
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
    }
    &.from-customer .message-cell {
        justify-content: flex-end;
    }
}

.system-message {
    .system-message__icon {
        padding-right: 20px;
        font-size: 20px;
    }
    .system-message__time {
        position: absolute;
        bottom: 0;
        right: 4px;
        font-family: monospace;
    }
}
</style>
