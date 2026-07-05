<template>
    <div class="tweet-desktop-container">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
@use "../styles/colors.scss";
@use "../styles/twitter_desktop" as *;

.tweet-desktop-container {
    :deep() {
        @include twitter-desktop();

        .TweetArrows {
            display: none;
        }

        .AdaptiveMedia-photoContainer {
            display: flex;
            align-items: center;

            >img {
                top: auto !important;
            }
        }

        .permalink-header {
            &:has(>.follow-bar:first-child) {
                flex-direction: row-reverse;
            }

            .account-group>.fullname {
                color: #14171a;
                display: flex;
                font-size: 18px;
                font-weight: 700;
                line-height: 24px;
                max-width: 32ch;

                .Icon {
                    padding-left: 4px;
                }

                .Icon--verified {
                    font-size: 1.2em;
                }
            }

            .time {
                display: none;
            }
        }

        .IconTextContainer {
            display: inline-block;
        }

        .permalink {
            margin-bottom: 0;
            border-radius: inherit;

            .permalink-tweet-container .tweet {
                border-radius: colors.$overlay-corner-radius colors.$overlay-corner-radius 0 0;
            }

            &:has(.permalink-replies.hidden) {
                .permalink-tweet-container .tweet {
                    border-radius: colors.$overlay-corner-radius;
                }
            }
        }
    }
}
</style>