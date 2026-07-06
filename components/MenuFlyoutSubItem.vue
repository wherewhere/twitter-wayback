<template>
    <div class="menu-flyout-sub-item" ref="flyout">
        <div class="root">
            <component v-if="icon" class="icon-root" :is="icon" />
            <span class="text-block">{{ text }}</span>
            <ChevronRight12Regular class="sub-item-chevron" />
        </div>
        <MenuFlyoutPresenter class="sub-menu" ref="presenter" v-check-solt="$slots.default">
            <slot></slot>
        </MenuFlyoutPresenter>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, useTemplateRef, type Component } from "vue";
import { anchorPositioningAsync, isAnchorNameSupported } from "../helpers/polyfills";
import vCheckSolt from "../directives/checkSolt";
import ChevronRight12Regular from "@fluentui/svg-icons/icons/chevron_right_12_regular.svg?component";
import MenuFlyoutPresenter from "./MenuFlyoutPresenter.vue";

defineProps<{
    icon?: Component,
    text?: string
}>();

const flyout = useTemplateRef("flyout");
const presenter = useTemplateRef("presenter");

onMounted(() => {
    if (!isAnchorNameSupported) {
        anchorPositioningAsync({
            elements: [flyout.value!, presenter.value!.$el]
        });
    }
});
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
        display: none;
        position-anchor: --menu-flyout-sub-item;
        position-area: span-block-end inline-end;
        position-try-order: most-block-size;
        position-try-fallbacks: span-block-start inline-end, span-block-end inline-start, span-block-start inline-start;
    }

    &:hover .sub-menu {
        display: flex;
    }
}
</style>