<template>
    <a :class="['container', container]" :href="post.wayback" target="_blank" ref="card">
        <div id="nonjsonview">
            <div class="tweet-content">
                {{ post.original }}
            </div>
        </div>
    </a>
</template>

<script lang="ts" setup>
import { onMounted, shallowRef, useTemplateRef } from "vue";
import { type WaybackItem } from "../helpers/wayback";

const { post } = defineProps<{
    post: InstanceType<typeof WaybackItem>
}>();
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
@use "../styles/twitter" as *;
@use "../styles/twitter_core" as *;
@use "../styles/twitter_more" as *;
@use "../styles/twitter_mobile" as *;

.container {
    flex: 1;
    font-family: Helvetica, Arial, sans-serif;
    display: flex;
    border: 1px solid #cfd9de;
    border-radius: 12px;
    background-color: white;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    color: inherit;
    text-decoration: none;
    max-width: 100%;
    box-sizing: border-box;
    word-wrap: break-word;
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