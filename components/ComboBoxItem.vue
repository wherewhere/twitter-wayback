<template>
    <option>
        <slot></slot>
    </option>
</template>

<style lang="scss" scoped>
@use "../styles/colors";

$combobox-item-pill-fill: colors.$accent-fill-color-default;
$combobox-item-pill-height: 16px;
$combobox-item-pill-width: 3px;
$combobox-item-pill-min-scale: 0.625;
$combobox-item-pill-corner-radius: 1.5px;

$combobox-item-scale-animation-duration: colors.$control-fast-animation-duration;

@supports (appearance: base-select) {
    option {
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
            transition: height $combobox-item-scale-animation-duration cubic-bezier(colors.$control-fast-out-slow-in-key-spline);
        }

        &:not(:disabled):active {
            &::checkmark {
                height: $combobox-item-pill-height * $combobox-item-pill-min-scale;
            }
        }
    }
}
</style>