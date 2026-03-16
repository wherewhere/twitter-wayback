<template>
    <div :class="['container', container]" @contextmenu="contextmenu" ref="card">
        <div style="padding: 12px 16px;">
            <a :href="post.wayback" target="_blank" rel="noopener noreferrer">
                {{ post.original }}
            </a>
        </div>
        <div class="context-menu" :style="style">
            <div @click="refresh" role="button">
                <ArrowClockwise16Regular />
                Refresh
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
import { onMounted, shallowRef, useTemplateRef, type StyleValue } from "vue";
import { type WaybackItem } from "../helpers/wayback";
import ArrowClockwise16Regular from "@fluentui/svg-icons/icons/arrow_clockwise_16_regular.svg?component";
import ArchiveArrowBack16Regular from "@fluentui/svg-icons/icons/archive_arrow_back_16_regular.svg?component";

const { post } = defineProps<{
    post: InstanceType<typeof WaybackItem>
}>();

const style = shallowRef<StyleValue>({});
function contextmenu(event: PointerEvent) {
    const target = event.target;
    if (target instanceof HTMLDivElement && !getSelection()?.toString()) {
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

function changeUrl(content: Element) {
    const hrefs = content.querySelectorAll("[href]");
    for (const href of hrefs) {
        const original = href.getAttribute("href");
        if (original?.startsWith("/web/")) {
            href.setAttribute("href", `https://web.archive.org${original}`);
        }
    }
}

async function getCardAsync({ wayback, mimetype }: { wayback: string, mimetype: string }) {
    if (mimetype === "application/json") {
        const html = await fetch(wayback).then(res => res.text());
        const document = new DOMParser().parseFromString(html, "text/html");
        const content = document.getElementById("nonjsonview");
        if (content) {
            changeUrl(content);
            container.value = "tweet-container";
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
            card.value!.firstElementChild?.replaceWith(content.cloneNode(true));
            return true;
        }
        else {
            const content = document.querySelector("main");
            if (content) {
                changeUrl(content);
                container.value = "tweet-mobile-container";
                card.value!.firstElementChild?.replaceWith(content.cloneNode(true));
                return true;
            }
        }
    }
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
    z-index: 999;

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