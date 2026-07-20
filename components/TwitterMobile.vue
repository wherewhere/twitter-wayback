<template>
    <div class="tweet-mobile-container">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
@use "../styles/twitter_mobile" as *;
@use "../styles/wayback" as *;

.tweet-mobile-container {
    @include wayback-perfix("twitter-mobile");

    :deep() {
        @include twitter-mobile();

        .r-o52ifk {
            display: none;
        }
    }
}
</style>