<template>
    <div class="settings-presenter">
        <div class="header-root">
            <div class="icon-holder" v-check-solt="$slots.icon">
                <slot name="icon"></slot>
            </div>
            <div class="header-panel">
                <span v-check-solt="$slots.header">
                    <slot name="header"></slot>
                </span>
                <span class="description" v-check-solt="$slots.description">
                    <slot name="description"></slot>
                </span>
            </div>
        </div>
        <div class="content-presenter" v-check-solt="$slots.default">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts" setup>
import vCheckSolt from "../directives/checkSolt";
</script>

<style lang="scss" scoped>
@use "../styles/colors";

$settings-card-description-font-size: colors.$caption-text-block-font-size;
$settings-card-header-icon-max-size: 20px;
$settings-card-header-icon-margin: 0 20px 0 2px;
$settings-card-vertical-header-content-spacing: 8px 0 0 0;

.settings-presenter {
    display: flex;
    justify-content: space-between;
    align-items: center;

    div.header-root {
        display: flex;
        align-items: center;
        flex: 1;
    }

    div.icon-holder {
        max-width: $settings-card-header-icon-max-size;
        max-height: $settings-card-header-icon-max-size;
        margin: $settings-card-header-icon-margin;
        fill: currentColor;
    }

    div.header-panel {
        display: flex;
        flex-direction: column;
        margin: 0 24px 0 0;
    }

    span.description {
        font-size: $settings-card-description-font-size;
        color: colors.$text-fill-color-secondary;
    }

    div.content-presenter {
        display: grid;
    }

    :deep(a.text-button) {
        font-weight: bold;
        text-decoration: inherit;
    }

    @media (max-width: 600px) {
        flex-flow: column;
        justify-content: normal;
        align-items: normal;

        div.header-panel {
            margin: 0;
        }

        div.content-presenter {
            margin: $settings-card-vertical-header-content-spacing;
        }

        .settings-nowarp & {
            flex-flow: row;
            justify-content: space-between;
            align-items: center;

            div.header-panel {
                margin: 0 calc(var(--design-unit) * 6px) 0 0;
            }

            div.content-presenter {
                margin: 0;
            }
        }

        .settings-keepwarp & {
            flex-flow: column;
            justify-content: normal;
            align-items: normal;

            div.header-panel {
                margin: 0;
            }

            div.content-presenter {
                margin: $settings-card-vertical-header-content-spacing;
            }
        }
    }
}
</style>