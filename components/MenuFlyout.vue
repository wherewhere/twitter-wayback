<template>
    <div class="menu-flyout" :style="style" ref="flyout">
        <MenuFlyoutPresenter class="menu" :class="{ open }" ref="presenter">
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

const open = shallowRef(false);
const style = shallowRef<StyleValue>({});
async function contextmenu(event: MouseEvent) {
    if (checker(event.target)) {
        event.preventDefault();
        style.value = {
            display: "block",
            left: event.clientX,
            top: event.clientY
        };
        open.value = true;
    }
}

function hide() {
    style.value = {};
    open.value = false;
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
@use "../styles/colors.scss";

.menu-flyout {
    display: none;
    position: fixed;
    user-select: none;
    anchor-name: --menu-flyout;

    .menu {
        opacity: 0;
        display: none;
        transition: opacity colors.$control-faster-animation-duration linear,
            display colors.$control-faster-animation-duration allow-discrete;
        position-anchor: --menu-flyout;
        position-area: span-block-end inline-end;
        position-try-order: most-block-size;
        position-try-fallbacks: span-block-start inline-end,
            span-block-end inline-start,
            span-block-start inline-start;

        &.open {
            opacity: 1;
            display: flex;

            @starting-style {
                opacity: 0;
            }
        }
    }
}
</style>