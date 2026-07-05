<template>
    <div class="menu-flyout" :style="style" ref="flyout">
        <MenuFlyoutPresenter class="menu" ref="presenter">
            <slot></slot>
        </MenuFlyoutPresenter>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, shallowRef, useTemplateRef, watch, type StyleValue } from "vue";
import { anchorPositioningAsync, isAnchorNameSupported } from "../helpers/polyfills";
import MenuFlyoutPresenter from "./MenuFlyoutPresenter.vue";

const { host } = defineProps<{ host: HTMLElement }>();
watch(
    () => host,
    (newHost, oldHost) => {
        if (newHost !== oldHost) {
            oldHost?.removeEventListener("contextmenu", contextmenu);
            newHost?.addEventListener("contextmenu", contextmenu);
        }
    });

const style = shallowRef<StyleValue>({});
async function contextmenu(event: MouseEvent) {
    const target = event.target;
    if (target instanceof HTMLDivElement && !getSelection()?.toString()) {
        event.preventDefault();
        style.value = {
            display: "block",
            left: event.clientX,
            top: event.clientY
        };
    }
}

function hide() {
    style.value = {};
}

const flyout = useTemplateRef("flyout");
const presenter = useTemplateRef("presenter");

onMounted(() => {
    host?.addEventListener("contextmenu", contextmenu);
    document.addEventListener("click", hide);
    if (!isAnchorNameSupported) {
        anchorPositioningAsync({
            elements: [flyout.value!, presenter.value!.$el]
        });
    }
});
onUnmounted(() => {
    host?.removeEventListener("contextmenu", contextmenu);
    document.removeEventListener("click", hide);
});
</script>

<style lang="scss" scoped>
.menu-flyout {
    display: none;
    position: fixed;
    anchor-name: --menu-flyout;

    .menu {
        position-anchor: --menu-flyout;
        position-area: span-block-end inline-end;
        position-try-order: most-block-size;
        position-try-fallbacks: span-block-start inline-end, span-block-end inline-start, span-block-start inline-start;
    }
}
</style>