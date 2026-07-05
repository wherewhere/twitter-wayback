<template>
    <component :is="tag" class="menu-flyout-item">
        <component v-if="icon" class="icon-root" :is="icon" />
        <span class="text-block">{{ text }}</span>
    </component>
</template>

<script lang="ts" setup>
import type { Component } from "vue";

const { tag = "div" } = defineProps<{
    icon?: Component,
    text?: string,
    tag?: keyof HTMLElementTagNameMap | Component
}>();
</script>

<style lang="scss" scoped>
@use "../styles/colors.scss";

$menu-flyout-item-background: colors.$subtle-fill-color-transparent;
$menu-flyout-item-background-pointer-over: colors.$subtle-fill-color-secondary;
$menu-flyout-item-background-pressed: colors.$subtle-fill-color-tertiary;
$menu-flyout-item-background-disabled: colors.$subtle-fill-color-transparent;

$menu-flyout-item-foreground: colors.$text-fill-color-primary;
$menu-flyout-item-foreground-pointer-over: colors.$text-fill-color-primary;
$menu-flyout-item-foreground-pressed: colors.$text-fill-color-primary;
$menu-flyout-item-foreground-disabled: colors.$text-fill-color-disabled;

$menu-flyout-item-margin: 2px 4px;
$menu-flyout-item-theme-padding: 8px 11px;

a.menu-flyout-item,
a.menu-flyout-item:hover,
a.menu-flyout-item:active,
a.menu-flyout-item:focus {
    text-decoration: none;
}

.menu-flyout-item {
    display: flex;
    align-items: center;
    background-color: $menu-flyout-item-background;
    color: $menu-flyout-item-foreground;
    fill: currentColor;
    font-size: colors.$content-control-font-size;
    border-radius: colors.$control-corner-radius;
    padding: $menu-flyout-item-theme-padding;
    margin: $menu-flyout-item-margin;
    white-space: nowrap;
    cursor: pointer;

    &:not(:disabled):hover {
        background-color: $menu-flyout-item-background-pointer-over;
        color: $menu-flyout-item-foreground-pointer-over;
    }

    &:not(:disabled):active {
        background-color: $menu-flyout-item-background-pressed;
        color: $menu-flyout-item-foreground-pressed;
    }

    &:disabled {
        background-color: $menu-flyout-item-background-disabled;
        color: $menu-flyout-item-foreground-disabled;
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
}
</style>