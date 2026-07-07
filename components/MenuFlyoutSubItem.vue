<template>
    <div class="menu-flyout-sub-item" ref="flyout" @pointerenter="pointerenter" @pointerleave="pointerleave">
        <div class="root" @click="click">
            <component v-if="icon" class="icon-root" :is="icon" />
            <span class="text-block">{{ text }}</span>
            <ChevronRight12Regular class="sub-item-chevron" />
        </div>
        <MenuFlyoutPresenter class="sub-menu" :class="{ open }" ref="presenter" v-check-solt="$slots.default">
            <slot></slot>
        </MenuFlyoutPresenter>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, shallowRef, useTemplateRef, type Component } from "vue";
import { anchorPositioningAsync, isAnchorNameSupported } from "../helpers/polyfills";
import vCheckSolt from "../directives/checkSolt";
import ChevronRight12Regular from "@fluentui/svg-icons/icons/chevron_right_12_regular.svg?component";
import MenuFlyoutPresenter from "./MenuFlyoutPresenter.vue";

defineProps<{
    icon?: Component,
    text?: string
}>();

const open = shallowRef(false);
function click(event: PointerEvent) {
    event.preventDefault();
    event.stopPropagation();
    open.value = !open.value;
}

let showTimer: number | null = null;
let hideTimer: number | null = null;
const defaultMenuShowDelay = 400;

function pointerenter(event: PointerEvent) {
    event.preventDefault();
    if (hideTimer !== null) {
        clearTimeout(hideTimer);
        hideTimer = null;
    }
    if (event.pointerType === "mouse" || event.pointerType === "pen") {
        showTimer = window.setTimeout(() => open.value = true, defaultMenuShowDelay);
    }
}

function pointerleave(event: PointerEvent) {
    event.preventDefault();
    if (showTimer !== null) {
        clearTimeout(showTimer);
        showTimer = null;
    }
    if (event.pointerType === "mouse" || event.pointerType === "pen") {
        hideTimer = window.setTimeout(() => open.value = false, defaultMenuShowDelay);
    }
}

function hide() {
    open.value = false;
}

onMounted(() => document.addEventListener("click", hide));
onUnmounted(() => document.removeEventListener("click", hide));

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

$default-menu-show-delay: 400ms;

.menu-flyout-sub-item {
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
        transition: background-color colors.$control-faster-animation-duration ease-in-out;
        anchor-name: --menu-flyout-sub-item;

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
        opacity: 0;
        display: none;
        transition: opacity colors.$control-faster-animation-duration linear,
            display colors.$control-faster-animation-duration allow-discrete;
        position-anchor: --menu-flyout-sub-item;
        position-area: span-block-end inline-end;
        position-try-order: most-block-size;
        position-try-fallbacks: span-block-start inline-end,
            span-block-end inline-start,
            span-block-start inline-start,
            span-right bottom,
            span-left bottom,
            span-right top,
            span-left top;

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