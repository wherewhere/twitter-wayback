<template>
    <div class="tweet-container">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
@use "../styles/twitter_mobile" as *;

.tweet-mobile-container {
    :deep() {
        @include twitter-mobile();

        .r-o52ifk {
            display: none;
        }
    }
}
</style>