<template>
    <Expander class="settings-expander" :expanded="expanded">
        <template #header>
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
                <slot name="action-content"></slot>
            </SettingsPresenter>
        </template>
        <slot></slot>
    </Expander>
</template>

<script lang="ts" setup>
import Expander from "./Expander.vue";
import SettingsPresenter from "./SettingsPresenter.vue";

defineProps<{
    expanded?: boolean;
}>();
</script>

<style lang="scss" scoped>
@use "../styles/colors";
@use "../styles/controls/expander";

$settings-expander-header-padding: 16px 0;
$settings-expander-item-padding: 8px 44px 8px 58px;

.settings-expander :deep() {
    summary {
        background: colors.$card-background-fill-color-default;
        color: colors.$text-fill-color-primary;
        border: expander.$expander-header-border-thickness solid colors.$card-stroke-color-default;
        transition: background-color colors.$control-faster-animation-duration ease-in-out;

        .content-presenter {
            flex: 1;

            .presenter {
                padding: $settings-expander-header-padding;
            }
        }

        .expand-collapse-chevron-border {
            margin-left: 4px;
        }

        &:not(:disabled):hover {
            background: colors.$control-fill-color-secondary;
            color: colors.$text-fill-color-primary;
            border-left: expander.$expander-header-border-thickness solid colors.$control-stroke-color-default;
            border-top: expander.$expander-header-border-thickness solid colors.$control-stroke-color-default;
            border-right: expander.$expander-header-border-thickness solid colors.$control-stroke-color-default;
            border-bottom: expander.$expander-header-border-thickness solid colors.$control-stroke-color-secondary;

            .expand-collapse-chevron-border {
                background: expander.$expander-chevron-background;
                border-color: expander.$expander-chevron-border;
            }
        }

        &:not(:disabled):active {
            background: colors.$control-fill-color-tertiary;
            color: colors.$text-fill-color-secondary;
            border: expander.$expander-header-border-thickness solid colors.$card-stroke-color-default;

            .expand-collapse-chevron-border {
                background: expander.$expander-chevron-background;
                border-color: expander.$expander-chevron-border;
            }
        }

        &:disabled {
            background: colors.$control-fill-color-disabled;
            color: colors.$text-fill-color-disabled;
            border: expander.$expander-header-border-thickness solid colors.$card-stroke-color-default;

            .expand-collapse-chevron-border {
                background: expander.$expander-chevron-background;
                border-color: expander.$expander-chevron-border;
            }
        }
    }

    .expander-content {
        padding: 0;

        div.setting-expander-content-grid {
            padding: $settings-expander-item-padding;
        }

        .default-setting-expander-item {
            background: none;
            border: none;
            border-top: expander.$expander-header-border-thickness solid colors.$card-stroke-color-default;
            border-radius: 0;
            box-shadow: none;

            .presenter {
                padding: $settings-expander-item-padding;
            }

            &:first-child {
                border-top: none;
            }
        }
    }
}
</style>