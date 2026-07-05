<template>
    <hr class="menu-flyout-separator" />
</template>

<style lang="scss" scoped>
@use "../styles/colors.scss";

$menu-flyout-separator-background: colors.$divider-stroke-color-default;

$menu-flyout-separator-height: 1px;
$menu-flyout-separator-theme-padding: 1px 0;

.menu-flyout-separator {
    height: $menu-flyout-separator-height;
    background: $menu-flyout-separator-background;
    margin: $menu-flyout-separator-theme-padding;
    border-width: 0;
}
</style>