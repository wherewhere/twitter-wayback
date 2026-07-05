<template>
    <div class="menu-flyout-presenter">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
@use "../styles/colors.scss";

$menu-flyout-presenter-background: colors.$solid-background-fill-color-tertiary;
$menu-flyout-presenter-border-brush: colors.$surface-stroke-color-flyout;
$menu-flyout-presenter-border-thickness: 1px;

$menu-flyout-presenter-theme-padding: 2px 0;
$menu-flyout-theme-min-height: 32px;

.menu-flyout-presenter {
    display: flex;
    flex-direction: column;
    position: fixed;
    background-color: $menu-flyout-presenter-background;
    border: $menu-flyout-presenter-border-thickness solid $menu-flyout-presenter-border-brush;
    min-width: 96px;
    min-height: $menu-flyout-theme-min-height;
    box-shadow: 0 8px 16px rgba(0, 0, 0, .14);
    padding: $menu-flyout-presenter-theme-padding;
    border-radius: colors.$overlay-corner-radius;
    z-index: 11;
}
</style>