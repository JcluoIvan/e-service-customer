<template>
    <div class="DropFileUpload-Component"
        :class="{drag}"
        @dragenter.prevent.stop="onDragEnter">
        <slot></slot>
        <div class="drag-upload-panel"
            ref="dropPanel"
            @dragleave.prevent.stop="onDragLeave"
            @dragover.prevent.stop
            @drop.prevent.stop="onDropFile"
            dropzone="copy">
            <slot name="background">
                <i class="upload-image-icon material-icons">photo</i>
            </slot>
        </div>

    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
@Component
export default class DropFileUpload extends Vue {
    @Prop(Array) public exts!: string[];
    public drag = false;

    public onDragEnter(event: DragEvent) {
        if (event.dataTransfer && event.dataTransfer.types && event.dataTransfer.types[0] === 'Files') {
            this.drag = true;
        }
    }

    public onDragLeave(event: DragEvent) {
        this.drag = false;
    }

    public onDropFile(event: DragEvent) {
        this.$emit('drop-files', event);
        this.drag = false;
    }
}
</script>
<style lang="scss">
.DropFileUpload-Component {
    position: relative;
    .drag-upload-panel {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        border: 10px dashed #333;
        background: #aaa;
        text-align: center;
        opacity: 0.75;
        display: none;
        i.upload-image-icon {
            position: relative;
            top: 20%;
            width: 100%;
            text-align: center;
            font-size: 256px;
            pointer-events: none;
        }
    }

    &.drag .drag-upload-panel {
        display: block;
    }
}
</style>
