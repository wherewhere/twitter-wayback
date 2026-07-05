<template>
    <div class="combobox" :class="className" :style="style" :width="width" :height="height">
        <select v-bind="$attrs" v-model="model">
            <slot></slot>
        </select>
        <ChevronDown12Regular class="drop-down-glyph" />
    </div>
</template>

<script generic="T" lang="ts" setup>
import { ClassValue, StyleValue } from "vue";
import ChevronDown12Regular from "@fluentui/svg-icons/icons/chevron_down_12_regular.svg?component";

const {
    class: className,
    style,
    width,
    height
} = defineProps<{
    class?: ClassValue,
    style?: StyleValue,
    width?: number,
    height?: number
}>();
const model = defineModel<T>();
</script>

<style lang="scss" scoped>
@use "../styles/colors";

$combobox-dropdown-glyph-foreground: colors.$text-fill-color-secondary;
$combobox-dropdown-glyph-foreground-disabled: colors.$text-fill-color-disabled;
$combobox-dropdown-foreground: colors.$text-fill-color-primary;
$combobox-dropdown-background: colors.$solid-background-fill-color-tertiary;
$combobox-dropdown-border: colors.$surface-stroke-color-flyout;

$combobox-item-pill-fill: colors.$accent-fill-color-default;
$combobox-item-pill-height: 16px;
$combobox-item-pill-width: 3px;
$combobox-item-pill-min-scale: 0.625;
$combobox-item-pill-corner-radius: 1.5px;

$combobox-item-scale-animation-duration: 0.167s;

$combobox-padding: 6px 34px 6px 11px;
$combobox-dropdown-border-thickness: 1px;
$combobox-dropdown-content-margin: 0 4px;
$combobox-dropdown-button-background-corner-radius: 4px;

.combobox {
    position: relative;

    select {
        width: 100%;
        height: 100%;
        appearance: none;
        padding: $combobox-padding;

        +.drop-down-glyph {
            position: absolute;
            right: 14px;
            top: calc(50% - 6px);
            color: $combobox-dropdown-glyph-foreground;
            fill: currentColor;
        }

        @supports (appearance: base-select) {
            appearance: base-select;
            justify-content: space-between;
            align-items: center;

            &::picker-icon {
                display: none;
            }

            &::picker(select) {
                appearance: base-select;
                color: $combobox-dropdown-foreground;
                background: $combobox-dropdown-background;
                border: $combobox-dropdown-border-thickness solid $combobox-dropdown-border;
                border-radius: colors.$overlay-corner-radius;
                padding: $combobox-dropdown-content-margin;
                box-shadow: 0 0 16px rgba(0, 0, 0, .14);
            }

            :deep() option {
                position: relative;
                min-block-size: auto;

                &::checkmark {
                    content: '';
                    position: absolute;
                    left: 0;
                    height: $combobox-item-pill-height;
                    width: $combobox-item-pill-width;
                    background: $combobox-item-pill-fill;
                    border-radius: $combobox-item-pill-corner-radius;
                    transition: height $combobox-item-scale-animation-duration cubic-bezier(0, 0, 0, 1);
                }

                &:not(:disabled):active {
                    &::checkmark {
                        height: $combobox-item-pill-height * $combobox-item-pill-min-scale;
                    }
                }
            }
        }

        &:disabled {
            +.drop-down-glyph {
                color: $combobox-dropdown-glyph-foreground-disabled;
            }
        }
    }
}
</style>