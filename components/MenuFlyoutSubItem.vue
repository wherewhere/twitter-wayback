<template>
    <div class="menu-flyout-sub-item" ref="flyout">
        <div class="root" @click="click">
            <component v-if="icon" class="icon-root" :is="icon" />
            <span class="text-block">{{ text }}</span>
            <ChevronRight12Regular class="sub-item-chevron" />
        </div>
        <MenuFlyoutPresenter class="sub-menu" :style="style" ref="presenter">
            <slot></slot>
        </MenuFlyoutPresenter>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, shallowRef, useSlots, useTemplateRef, type Component, type CSSProperties } from "vue";
import { anchorPositioningAsync, isAnchorNameSupported } from "../helpers/polyfills";
import { isSlot } from "../directives/checkSolt";
import ChevronRight12Regular from "@fluentui/svg-icons/icons/chevron_right_12_regular.svg?component";
import MenuFlyoutPresenter from "./MenuFlyoutPresenter.vue";

defineProps<{
    icon?: Component,
    text?: string
}>();

const slots = useSlots();
const style = shallowRef<CSSProperties>({ display: "none" });

function click(event: PointerEvent) {
    event.stopPropagation();
    style.value.display === "none" ? pointerenter(event) : pointerleave(event);
}

function pointerenter(event: PointerEvent) {
    event.preventDefault();
    if (isSlot(slots.default)) {
        style.value = {
            display: "flex"
        };
    }
}

function hide() {
    style.value = {
        display: "none"
    };
}

function pointerleave(event: PointerEvent) {
    event.preventDefault();
    hide();
}

const flyout = useTemplateRef("flyout");
const presenter = useTemplateRef("presenter");

onMounted(() => {
    document.addEventListener("click", hide);
    if (!isAnchorNameSupported) {
        anchorPositioningAsync({
            elements: [flyout.value!, presenter.value!.$el]
        });
    }
});
onUnmounted(() => document.removeEventListener("click", hide));
</script>

<style lang="scss" scoped>
@use "../styles/colors.scss";

$menu-flyout-sub-item-background: colors.$subtle-fill-color-transparent;
$menu-flyout-sub-item-background-pointer-over: colors.$subtle-fill-color-secondary;
$menu-flyout-sub-item-background-pressed: colors.$subtle-fill-color-tertiary;
$menu-flyout-sub-item-background-sub-menu-opened: colors.$subtle-fill-color-secondary;
$menu-flyout-sub-item-background-disabled: colors.$subtle-fill-color-transparent;
$menu-flyout-sub-item-background-brush: colors.$subtle-fill-color-transparent;

$menu-flyout-sub-item-foreground: colors.$text-fill-color-primary;
$menu-flyout-sub-item-foreground-pointer-over: colors.$text-fill-color-primary;
$menu-flyout-sub-item-foreground-pressed: colors.$text-fill-color-primary;
$menu-flyout-sub-item-foreground-sub-menu-opened: colors.$text-fill-color-primary;
$menu-flyout-sub-item-foreground-disabled: colors.$text-fill-color-disabled;

$menu-flyout-sub-item-chevron: colors.$text-fill-color-secondary;
$menu-flyout-sub-item-chevron-pointer-over: colors.$text-fill-color-secondary;
$menu-flyout-sub-item-chevron-pressed: colors.$text-fill-color-tertiary;
$menu-flyout-sub-item-chevron-sub-menu-opened: colors.$text-fill-color-secondary;
$menu-flyout-sub-item-chevron-disabled: colors.$text-fill-color-disabled;

$menu-flyout-item-chevron-margin: 0 0 -1px 24px;
$menu-flyout-item-margin: 2px 4px;
$menu-flyout-item-theme-padding: 8px 11px;

.menu-flyout-sub-item {
    anchor-name: --menu-flyout-sub-item;

    .root {
        display: flex;
        align-items: center;
        background-color: $menu-flyout-sub-item-background;
        color: $menu-flyout-sub-item-foreground;
        fill: currentColor;
        font-size: colors.$content-control-font-size;
        border-radius: colors.$control-corner-radius;
        padding: $menu-flyout-item-theme-padding;
        margin: $menu-flyout-item-margin;
        white-space: nowrap;
        cursor: pointer;

        &:not(:disabled):hover {
            background-color: $menu-flyout-sub-item-background-pointer-over;
            color: $menu-flyout-sub-item-foreground-pointer-over;
        }

        &:not(:disabled):active {
            background-color: $menu-flyout-sub-item-background-pressed;
            color: $menu-flyout-sub-item-foreground-pressed;
        }

        &:disabled {
            background-color: $menu-flyout-sub-item-background-disabled;
            color: $menu-flyout-sub-item-foreground-disabled;
        }

        .icon-root {
            margin-right: 12px;
            margin-top: -1px;
            width: 16px;
            height: 16px;

            svg {
                fill: currentColor;
            }
        }

        .text-block {
            flex: 1;
        }

        .sub-item-chevron {
            color: $menu-flyout-sub-item-chevron;
            margin: $menu-flyout-item-chevron-margin;
        }
    }

    .sub-menu {
        position-anchor: --menu-flyout-sub-item;
        position-area: span-block-end inline-end;
        position-try-order: most-block-size;
        position-try-fallbacks: span-block-start inline-end, span-block-end inline-start, span-block-start inline-start;
    }
}
</style>