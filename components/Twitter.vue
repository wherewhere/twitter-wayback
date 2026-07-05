<template>
    <div class="tweet-container">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
@use "../styles/twitter" as *;

.tweet-container {
    padding: 12px 16px;

    :deep() {
        @include twitter();
    }
}
</style>