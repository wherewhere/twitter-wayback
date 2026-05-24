<template>
    <details :open="expanded">
        <summary>
            <div class="content-presenter">
                <slot name="header"></slot>
            </div>
            <div class="expand-collapse-chevron-border">
                <ChevronDown12Regular class="expand-collapse-chevron-down" />
                <ChevronUp12Regular class="expand-collapse-chevron-up" />
            </div>
        </summary>
        <div class="expander-content">
            <slot></slot>
        </div>
    </details>
</template>

<script setup lang="ts">
import ChevronDown12Regular from "@fluentui/svg-icons/icons/chevron_down_12_regular.svg?component";
import ChevronUp12Regular from "@fluentui/svg-icons/icons/chevron_up_12_regular.svg?component";

const { expanded = false } = defineProps<{
    expanded?: boolean;
}>();
</script>

<style lang="scss" scoped>
@use "../styles/controls/expander";
</style>