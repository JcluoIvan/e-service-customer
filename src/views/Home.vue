<template>
    <div class="Home-Component">
        <Talk :talk="talk" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import store from '../store';
import Talk from '../components/Talk.vue';

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
        Talk,
    },
})
export default class Home extends Vue {
    get talk() {
        console.info(store.state.talk);
        return store.state.talk;
    }
}
</script>
<style lang="scss" scoped>
.Home-Component {
    position: relative;
    height: 100%;
    width: 100%;
}
</style>
