<template>
    <div id="app">
        <router-view />
        <ConnectionDialog ref="dialog" />
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ConnectionDialog from './components/ConnectionDialog.vue';
@Component({
    components: {
        ConnectionDialog,
    },
})
export default class App extends Vue {
    public $refs!: {
        dialog: ConnectionDialog;
    };

}
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
