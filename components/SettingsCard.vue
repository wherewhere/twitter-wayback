<template>
    <div class="settings-card">
        <SettingsPresenter class="presenter">
            <template #icon>
                <slot name="icon"></slot>
            </template>
            <template #header>
                <slot name="header"></slot>
            </template>
            <template #description>
                <slot name="description"></slot>
            </template>
            <slot></slot>
        </SettingsPresenter>
    </div>
</template>

<script lang="ts" setup>
import SettingsPresenter from "./SettingsPresenter.vue";
</script>

<style lang="scss">
@use "../styles/colors";

$settings-card-padding: 16px;

.settings-card {
    display: block;
    box-sizing: border-box;
    background: colors.$card-background-fill-color-default;
    color: colors.$text-fill-color-primary;
    border: 1px solid colors.$card-stroke-color-default;
    border-radius: colors.$control-corner-radius;

    .presenter {
        padding: $settings-card-padding;
    }
}
</style>