<template>
    <span ref="host">
        <span></span>
    </span>
</template>

<script lang="ts" setup>
import { onMounted, useTemplateRef, watch } from "vue";

const { element } = defineProps<{
    element: Node;
}>();

const host = useTemplateRef("host");
watch(
    () => element,
    (newValue, oldValue) => {
        const hostEl = host.value;
        if (hostEl && newValue !== oldValue) {
            hostEl.firstElementChild?.replaceWith(newValue.cloneNode(true));
        }
    }
);

onMounted(() => {
    if (element) {
        host.value!.firstElementChild?.replaceWith(element.cloneNode(true));
    }
});
</script>