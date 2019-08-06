<template>
    <div id="app">
        <Talk />
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { actions } from '@/stores/actions';
import Talk from './components/Talk.vue';
@Component({
    components: {
        Talk,
    },
})
export default class App extends Vue {}
</script>

<style lang="scss">
html,
body,
#app {
    position: relative;
    width: 100%;
    height: 100%;
}
</style>
