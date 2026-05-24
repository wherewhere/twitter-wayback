<template>
    <div class="combobox" :class="className" :style="style" :width="width" :height="height">
        <select v-bind="$attrs" v-model="model">
            <slot></slot>
        </select>
        <ChevronDown12Regular class="drop-down-glyph" />
    </div>
</template>

<script generic="T" lang="ts" setup>
import { ClassValue, StyleValue } from 'vue';
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

$combo-box-drop-down-glyph-foreground: colors.$text-fill-color-secondary;
$combo-box-drop-down-glyph-foreground-disabled: colors.$text-fill-color-disabled;

$combo-box-padding: 6px 34px 6px 11px;

.combobox {
    position: relative;

    select {
        width: 100%;
        height: 100%;
        appearance: none;
        padding: $combo-box-padding;

        +.drop-down-glyph {
            position: absolute;
            right: 14px;
            top: calc(50% - 6px);
            color: $combo-box-drop-down-glyph-foreground;
        }

        &:disabled {
            +.drop-down-glyph {
                color: $combo-box-drop-down-glyph-foreground-disabled;
            }
        }
    }
}
</style>