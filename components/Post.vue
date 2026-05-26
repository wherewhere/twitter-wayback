<template>
    <div :class="['container', container]" @contextmenu="contextmenu" v-show="isShow" ref="card">
        <div style="padding: 12px 16px;">
            <a :href="post.wayback" target="_blank" rel="noopener noreferrer">
                {{ post.original }}
            </a>
        </div>
        <div class="context-menu" :style="style" ref="contextMenu">
            <div @click="refresh" role="button">
                <ArrowClockwise16Regular />
                Refresh
            </div>
            <div @click="copy" role="button">
                <Copy16Regular />
                Copy URL
            </div>
            <a :href="post.wayback" target="_blank" rel="noopener noreferrer">
                <ArchiveArrowBack16Regular />
                Wayback
            </a>
        </div>
    </div>
</template>

<script lang="ts" setup>
import "../types";
import { computed, nextTick, onMounted, shallowRef, useTemplateRef, type StyleValue } from "vue";
import type { WaybackItem } from "../helpers/wayback";
import ArrowClockwise16Regular from "@fluentui/svg-icons/icons/arrow_clockwise_16_regular.svg?component";
import ArchiveArrowBack16Regular from "@fluentui/svg-icons/icons/archive_arrow_back_16_regular.svg?component";
import Copy16Regular from "@fluentui/svg-icons/icons/copy_16_regular.svg?component";

export type PostType = {
    replies: boolean | undefined,
    retweets: boolean | undefined,
    quotes: boolean | undefined,
    media: boolean | undefined,
};

const { post, type } = defineProps<{
    post: InstanceType<typeof WaybackItem>,
    type: PostType
}>();

const style = shallowRef<StyleValue>({});
const contextMenu = useTemplateRef("contextMenu");
async function contextmenu(event: MouseEvent) {
    const target = event.target;
    if (target instanceof HTMLDivElement && !getSelection()?.toString()) {
        event.preventDefault();
        style.value = {
            display: "flex",
            left: 0,
            top: 0,
            visibility: "hidden"
        };
        await nextTick();

        const viewportRight = scrollX + innerWidth;
        const viewportBottom = scrollY + innerHeight;

        let { pageX: left, pageY: top } = event;
        const { offsetWidth, offsetHeight } = contextMenu.value!;

        if (left + offsetWidth > viewportRight) {
            left -= offsetWidth;
        }
        const maxLeft = viewportRight - offsetWidth;
        left = Math.max(scrollX, Math.min(left, maxLeft));

        if (top + offsetHeight > viewportBottom) {
            top -= offsetHeight;
        }
        const maxTop = viewportBottom - offsetHeight;
        top = Math.max(scrollY, Math.min(top, maxTop));

        style.value = {
            display: "flex",
            left,
            top
        };
    }
}

document.addEventListener("click", () => style.value = {});
const card = useTemplateRef("card");
const container = shallowRef<string>();

function changeUrl(content: Element) {
    const hrefs = content.querySelectorAll("[href]");
    for (const href of hrefs) {
        const original = href.getAttribute("href");
        if (original?.startsWith("/web/")) {
            href.setAttribute("href", `https://web.archive.org${original}`);
        }
    }
}

const hasMedia = shallowRef<boolean>();
const isReply = shallowRef<boolean>();
const isRetweet = shallowRef<boolean>();
const isQuoted = shallowRef<boolean>();
async function getCardAsync({ wayback, mimetype }: { wayback: string, mimetype: string }) {
    if (mimetype === "application/json") {
        const html = await fetch(wayback).then(res => res.text());
        const document = new DOMParser().parseFromString(html, "text/html");
        const content = document.getElementById("nonjsonview");
        if (content) {
            changeUrl(content);
            container.value = "tweet-container";
            const json = document.querySelector("#jsonview pre")?.textContent;
            if (json) {
                try {
                    const post = JSON.parse(json);
                    hasMedia.value = !!post.includes?.media?.length;
                    const data = post.data;
                    if (data) {
                        isReply.value = !!data.referenced_tweets?.some((tweet: any) => tweet.type === "replied_to");
                        isRetweet.value = !!data.referenced_tweets?.some((tweet: any) => tweet.type === "retweeted");
                        isQuoted.value = !!data.referenced_tweets?.some((tweet: any) => tweet.type === "quoted");
                        const dateString = data.created_at;
                        if (typeof dateString === "string") {
                            const date = new Date(dateString);
                            const parentDate = content.querySelector<HTMLAnchorElement>("#parentdate");
                            if (parentDate) {
                                parentDate.innerText = date.toString();
                                parentDate.href = wayback;
                            }
                        }
                    }
                    const scripts = content.querySelectorAll<HTMLScriptElement>(".embedded-tweet-container script");
                    if (scripts) {
                        for (const script of scripts) {
                            const code = script.textContent;
                            if (code) {
                                const func = new Function("document", code);
                                func(document);
                            }
                        }
                    }
                }
                catch { }
            }
            card.value!.firstElementChild?.replaceWith(content.cloneNode(true));
            return true;
        }
    }
    else {
        const html = await fetch(wayback).then(res => res.text());
        const document = new DOMParser().parseFromString(html, "text/html");
        const content = document.querySelector(".original-permalink-page");
        if (content) {
            changeUrl(content);
            container.value = "tweet-desktop-container";
            hasMedia.value = !!content.querySelector(".AdaptiveMedia");
            card.value!.firstElementChild?.replaceWith(content.cloneNode(true));
            return true;
        }
        else {
            const content = document.querySelector("main");
            if (content) {
                changeUrl(content);
                container.value = "tweet-mobile-container";
                hasMedia.value = !!content.querySelector("div[aria-label='Image']");
                card.value!.firstElementChild?.replaceWith(content.cloneNode(true));
                return true;
            }
        }
    }
}

function matches(expected: boolean | undefined, actual: boolean | undefined) {
    return expected === actual || expected === undefined || actual === undefined;
}

const isShow = computed(() => {
    return matches(type.replies, isReply.value)
        && matches(type.retweets, isRetweet.value)
        && matches(type.quotes, isQuoted.value)
        && matches(type.media, hasMedia.value);
});

function copy() {
    return navigator.clipboard.writeText(post.original);
}

async function refresh() {
    if (post.groupcount > 1) {
        try {
            const data = await post.fetch();
            if (Array.isArray(data)) {
                const json = data.filter(x => x[1] === "application/json");
                for (const [original, mimetype, timestamp] of json) {
                    try {
                        const wayback = `https://web.archive.org/web/${timestamp}if_/${original}`;
                        if (await getCardAsync({ wayback, mimetype })) {
                            post.timestamp = timestamp;
                            return;
                        }
                    }
                    catch { }
                }
                const html = data.filter(x => x[1] === "text/html");
                for (const [original, mimetype, timestamp] of html) {
                    try {
                        const wayback = `https://web.archive.org/web/${timestamp}if_/${original}`;
                        if (await getCardAsync({ wayback, mimetype })) {
                            post.timestamp = timestamp;
                            return;
                        }
                    }
                    catch { }
                }
            }
        }
        catch {
            getCardAsync(post);
        }
    }
    else {
        getCardAsync(post);
    }
}

onMounted(refresh);
</script>

<style lang="scss" scoped>
@use "../styles/colors.scss";
@use "../styles/twitter" as *;
@use "../styles/twitter_mobile" as *;
@use "../styles/twitter_desktop" as *;

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

.tweet-container {
    padding: 12px 16px;

    :deep() {
        @include twitter();
    }
}

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

.tweet-mobile-container {
    :deep() {
        @include twitter-mobile();

        .r-o52ifk {
            display: none;
        }
    }
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
    z-index: 11;

    >a,
    >div[role="button"] {
        display: flex;
        align-items: center;
        background-color: transparent;
        color: colors.$text-fill-color-primary;
        fill: currentColor;
        font-size: colors.$content-control-font-size;
        border-radius: colors.$control-corner-radius;
        padding: 8px 11px;
        margin: 2px 4px;
        text-decoration: none;
        white-space: nowrap;
        cursor: pointer;

        &:hover,
        &:active,
        &:focus {
            color: colors.$text-fill-color-primary;
            text-decoration: none;
        }

        &:hover {
            background-color: colors.$solid-background-fill-color-secondary;
        }

        &:active {
            background-color: colors.$solid-background-fill-color-tertiary;
        }

        >svg:first-child {
            margin-right: 12px;
            margin-top: -1px;
            width: 16px;
            height: 16px;
        }
    }
}
</style>