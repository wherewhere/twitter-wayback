<template>
    <div :class="['container', container]" @contextmenu="contextmenu" ref="card">
        <div id="nonjsonview">
            <div class="tweet-content">
                {{ post.original }}
            </div>
        </div>
    </div>
    <div class="context-menu" :style="style">
        <a :href="post.wayback" target="_blank">Wayback</a>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, shallowRef, useTemplateRef, type StyleValue } from "vue";
import { type WaybackItem } from "../helpers/wayback";

const { post } = defineProps<{
    post: InstanceType<typeof WaybackItem>
}>();

const style = shallowRef<StyleValue>({});
function contextmenu(event: PointerEvent) {
    const target = event.target;
    if (target instanceof HTMLDivElement) {
        event.preventDefault();
        style.value = {
            display: "flex",
            left: `${event.pageX}px`,
            top: `${event.pageY}px`
        };
    }
}

document.addEventListener("click", () => style.value = {});

const card = useTemplateRef("card");

const container = shallowRef<string>();

async function getCard({ wayback, mimetype }: { wayback: string, mimetype: string }) {
    if (mimetype === "application/json") {
        const html = await fetch(wayback).then(res => res.text());
        const document = new DOMParser().parseFromString(html, "text/html");
        const content = document.getElementById("nonjsonview");
        if (content) {
            container.value = "tweet-container";
            card.value!.firstElementChild?.replaceWith(content.cloneNode(true));
        }
    }
    else {
        const html = await fetch(wayback).then(res => res.text());
        const document = new DOMParser().parseFromString(html, "text/html");
        const content = document.querySelector(".permalink-tweet-container .js-original-tweet");
        if (content) {
            container.value = "tweet-desktop-container";
            card.value!.firstElementChild?.replaceWith(content.cloneNode(true));
        }
        else {
            container.value = "tweet-mobile-container";
            const content = document.querySelector("meta[itemprop='mainEntityOfPage']~div>article");
            if (content) {
                card.value!.firstElementChild?.replaceWith(content.cloneNode(true));
            }
        }
    }
}

onMounted(async () => {
    if (post.groupcount > 1) {
        try {
            const data = post.fetch();
            if (Array.isArray(data)) {
                const json = data.filter(x => x[1] === "application/json");
                for (const [original, mimetype, timestamp] of json) {
                    try {
                        const wayback = `https://web.archive.org/web/${timestamp}if_/${original}`;
                        getCard({ wayback, mimetype });
                        break;
                    }
                    catch { }
                }
                const html = data.filter(x => x[1] === "text/html");
                for (const [original, mimetype, timestamp] of html) {
                    try {
                        const wayback = `https://web.archive.org/web/${timestamp}if_/${original}`;
                        getCard({ wayback, mimetype });
                        break;
                    }
                    catch { }
                }
                return;
            }
        }
        catch { }
    }
    getCard(post);
});
</script>

<style lang="scss" scoped>
@use "../styles/colors.scss";
@use "../styles/twitter" as *;
@use "../styles/twitter_core" as *;
@use "../styles/twitter_more" as *;
@use "../styles/twitter_mobile" as *;

.container {
    flex: 1;
    font-family: Helvetica, Arial, sans-serif;
    display: flex;
    border: 1px solid colors.$card-stroke-color-default;
    border-radius: 12px;
    background-color: colors.$card-background-fill-color-default;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    color: inherit;
    text-decoration: none;
    max-width: 100%;
    box-sizing: border-box;
    word-wrap: break-word;
}

.context-menu {
    display: none;
    flex-direction: column;
    position: absolute;
    background-color: colors.$solid-background-fill-color-tertiary;
    min-width: 96px;
    min-height: 32px;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.2), 0 16px 32px rgba(0, 0, 0, 0.24);
    padding: 2px 0;
    border-radius: colors.$overlay-corner-radius;
    z-index: 999;

    >a {
        background-color: transparent;
        color: colors.$text-fill-color-primary;
        font-size: colors.$content-control-font-size;
        border-radius: colors.$control-corner-radius;
        padding: 8px 11px;
        margin: 2px 4px;
        text-decoration: none;

        &:hover {
            background-color: colors.$solid-background-fill-color-secondary;
        }

        &:active {
            background-color: colors.$solid-background-fill-color-tertiary;
        }
    }
}

.tweet-container {
    padding: 12px 16px;

    :deep() {
        @include twitter();
    }
}

.tweet-desktop-container {
    :deep() {
        .permalink-header .time {
            display: none;
        }

        @include twitter-core();
        @include twitter-more();
    }
}

.tweet-mobile-container {
    :deep() {
        @include twitter-mobile();
    }
}
</style>