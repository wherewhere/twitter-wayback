<template>
    <div class="tweet-container">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
@use "../styles/twitter" as *;
@use "../styles/wayback" as *;

.tweet-container {
    @include wayback-perfix("twitter");
    padding: 12px 16px;

    :deep() {
        @include twitter();
    }
}
</style>