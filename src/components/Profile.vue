<template>
    <div class="Profile-Component"
        :class="className">
        <div class="profile">
            <img :src="url"
                v-if="url">
            <object class="svg-icon"
                v-else
                :data="serviceIcon" />
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { inArray, inEnum } from '../support';
const serviceIcon = require('@/assets/icons/customer-service-svgrepo-com.svg');

export enum PropSize {
    Mini = 'mini',
    Small = 'small',
    Medium = 'medium',
    Large = 'large',
}
export enum PropType {
    Service = 'service',
    Customer = 'customer',
}

@Component
export default class Profile extends Vue {
    @Prop(String) public url!: string | undefined | null;

    @Prop({ type: String, validator: (value) => inEnum(PropType, value), required: true }) public type!: PropType;

    @Prop({ type: String, validator: (value) => !value || inEnum(PropSize, value), default: null })
    public size!: PropSize | null;

    @Prop({ type: Boolean, default: null })
    public online!: boolean | null;

    get serviceIcon() {
        return serviceIcon;
    }

    get className() {
        const { online, size } = this;
        const className = [];
        if (size) {
            className.push(`size-${size}`);
        }
        if (online !== null) {
            className.push(`status status-${online ? 'online' : 'offline'}`);
        }
        return className;
    }
}
</script>
<style lang="scss" scoped>
@import '@/assets/scss/common.scss';
.Profile-Component {
    position: relative;
    display: inline-block;
    vertical-align: middle;

    &:after {
        position: absolute;
        content: ' ';
        width: 15px;
        height: 15px;
        right: 2px;
        bottom: 5px;
        border-radius: 50%;
        background: color(success);
        display: none;
        border: 1px solid color(light-success);
    }
    &.status-offline:after {
        background: #eee;
    }
    &.status:after {
        display: block;
    }
}
.profile {
    position: relative;
    border: 1px solid #eee;
    border-radius: 50%;
    overflow: hidden;
    background: #fff;
    width: 64px;
    height: 64px;
    .svg-icon {
        margin-top: 10%;
        width: 100%;
        height: 100%;
    }
    img {
        width: 100%;
    }
}
.Profile-Component {
    &.size-large {
        .profile {
            width: 64px;
            height: 64px;
        }
    }
    &.size-medium {
        &:after {
            width: 12px;
            height: 12px;
            bottom: 2px;
            right: 0px;
        }
        .profile {
            width: 48px;
            height: 48px;
        }
    }
    &.size-small {
        &:after {
            width: 9px;
            height: 9px;
            bottom: 2px;
            right: 0px;
        }

        .profile {
            width: 32px;
            height: 32px;
        }
    }
    &.size-mini {
        .profile {
            width: 24px;
            height: 24px;
        }
    }
}
</style>
