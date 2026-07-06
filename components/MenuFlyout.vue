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

const { host, checker } = defineProps<{ host: HTMLElement, checker: (target: EventTarget | null) => boolean }>();
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
    if (checker(event.target)) {
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

onMounted(() => {
    host?.addEventListener("contextmenu", contextmenu);
    document.addEventListener("click", hide);
});
onUnmounted(() => {
    host?.removeEventListener("contextmenu", contextmenu);
    document.removeEventListener("click", hide);
});

if (!isAnchorNameSupported) {
    const flyout = useTemplateRef("flyout");
    const presenter = useTemplateRef("presenter");
    onMounted(() => anchorPositioningAsync({
        elements: [flyout.value!, presenter.value!.$el]
    }));
}
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