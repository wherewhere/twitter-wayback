<template>
    <button :class="['back-to-top', 'accent', { 'back-to-top-on': isShow }]" title="Back to Top" @click="backToTop">
        <ArrowUp16Regular />
        <span>&nbsp;{{ Math.round(scrollPercent) }}%</span>
    </button>
</template>

<script lang="ts" setup>
import { computed, onMounted, shallowRef } from "vue";
import ArrowUp16Regular from "@fluentui/svg-icons/icons/arrow_up_16_regular.svg?component";

function backToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

const scrollPercent = shallowRef(0);
const isShow = computed(() => scrollPercent.value >= 5);
onMounted(() => {
    addEventListener("scroll", () => {
        const contentHeight = document.body.scrollHeight - innerHeight;
        scrollPercent.value = contentHeight > 0 ? Math.min(100 * (window.scrollY ?? pageYOffset) / contentHeight, 100) : 0;
    }, { passive: true });
});
</script>

<style lang="scss" scoped>
.back-to-top {
    cursor: pointer;
    fill: currentColor;
    position: fixed;
    bottom: -300px;
    transition: bottom .25s ease-in-out;
    right: 8px;

    &.back-to-top-on {
        bottom: 8px;
    }

    svg {
        margin-bottom: -3px;
    }
}
</style>