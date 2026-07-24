<template>
    <div class="back-to-top-host">
        <button :class="['back-to-top', 'accent', { 'back-to-top-on': isShow }]" title="Back to Top" @click="backToTop">
            <ArrowUp16Regular />
            <span>&nbsp;{{ Math.round(scrollPercent) }}%</span>
        </button>
    </div>
</template>

<script lang="ts" setup>
import "../types";
import { computed, onMounted, shallowRef } from "vue";
import ArrowUp16Regular from "@fluentui/svg-icons/icons/arrow_up_16_regular.svg?component";

function backToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

const scrollPercent = shallowRef(0);
const isShow = computed(() => scrollPercent.value >= 1);
onMounted(() => {
    addEventListener("scroll", () => {
        const contentHeight = document.body.scrollHeight - innerHeight;
        scrollPercent.value = contentHeight > 0 ? Math.min(100 * (window.scrollY ?? pageYOffset) / contentHeight, 100) : 0;
    }, { passive: true });
});
</script>

<style lang="scss" scoped>
.back-to-top-host {
    left: 0;
    right: 0;
    bottom: 0;
    max-width: 100vw;
    position: fixed;

    .back-to-top {
        cursor: pointer;
        fill: currentColor;
        position: absolute;
        bottom: -300px;
        transition: bottom .25s ease-in-out;
        right: 8px;
        pointer-events: auto;

        &.back-to-top-on {
            bottom: 8px;
        }

        svg {
            margin-bottom: -3px;
        }
    }
}
</style>