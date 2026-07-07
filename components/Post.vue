<template>
    <div class="container" v-show="isShow" ref="card">
        <component :is="container">
            <NodeHost v-if="element" :element="element" />
            <div v-else style="padding: 12px 16px">
                <a :href="post.wayback" target="_blank" rel="noopener noreferrer">
                    {{ post.original }}
                </a>
            </div>
        </component>
        <MenuFlyout :host="card!" :checker="checker">
            <MenuFlyoutItem :icon="ArrowClockwise16Regular" text="Refresh" @click="refresh" />
            <MenuFlyoutItem :icon="Copy16Regular" text="Copy URL" @click="copy" />
            <MenuFlyoutItem :icon="ArchiveArrowBack16Regular" text="Wayback" tag="a" :href="post.wayback"
                target="_blank" rel="noopener noreferrer" />
            <MenuFlyoutSubItem v-if="usersList.length || mediaList.length" :icon="Save16Regular" text="Save">
                <MenuFlyoutItem v-for="list in usersList" :icon="Person16Regular" :text="list.username" tag="a"
                    :title="list.avatar" :href="`https://web.archive.org/save/${list.avatar}`" target="_blank"
                    rel="noopener noreferrer" />
                <MenuFlyoutSeparator v-if="usersList.length && mediaList.length" />
                <MenuFlyoutItem v-for="list in mediaList" :icon="getMediaIcon(list.type)" :text="list.title" tag="a"
                    :title="list.url" :href="`https://web.archive.org/save/${list.url}?name=orig&format=jpg`" target="_blank"
                    rel="noopener noreferrer" />
            </MenuFlyoutSubItem>
        </MenuFlyout>
    </div>
</template>

<script lang="ts" setup>
import "../types";
import { computed, defineAsyncComponent, onMounted, ref, shallowRef, useTemplateRef, type Component } from "vue";
import type { WaybackItem } from "../helpers/wayback";
import NodeHost from "./NodeHost.vue";
import EmptyHost from "./EmptyHost.vue";
import MenuFlyout from "./MenuFlyout.vue";
import MenuFlyoutItem from "./MenuFlyoutItem.vue";
import MenuFlyoutSubItem from "./MenuFlyoutSubItem.vue";
import MenuFlyoutSeparator from "./MenuFlyoutSeparator.vue";
import ArrowClockwise16Regular from "@fluentui/svg-icons/icons/arrow_clockwise_16_regular.svg?component";
import ArchiveArrowBack16Regular from "@fluentui/svg-icons/icons/archive_arrow_back_16_regular.svg?component";
import Copy16Regular from "@fluentui/svg-icons/icons/copy_16_regular.svg?component";
import Save16Regular from "@fluentui/svg-icons/icons/save_16_regular.svg?component";
import Person16Regular from "@fluentui/svg-icons/icons/person_16_regular.svg?component";
import Image16Regular from "@fluentui/svg-icons/icons/image_16_regular.svg?component";
import Video16Regular from "@fluentui/svg-icons/icons/video_16_regular.svg?component";
import Gif16Regular from "@fluentui/svg-icons/icons/gif_16_regular.svg?component";

const Twitter = defineAsyncComponent({
    loader: () => import("./Twitter.vue"),
    loadingComponent: EmptyHost
});
const TwitterDesktop = defineAsyncComponent({
    loader: () => import("./TwitterDesktop.vue"),
    loadingComponent: EmptyHost
});
const TwitterMobile = defineAsyncComponent({
    loader: () => import("./TwitterMobile.vue"),
    loadingComponent: EmptyHost
});

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

const card = useTemplateRef<HTMLElement>("card");
const element = ref<Node | null>(null);
const container = shallowRef<Component | string>("div");

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

const usersList = ref<{ username: string, avatar: string }[]>([]);
const mediaList = ref<{ type: string, title: string, url: string }[]>([]);

function getMediaIcon(type: string) {
    switch (type) {
        case "photo":
            return Image16Regular;
        case "video":
            return Video16Regular;
        case "animated_gif":
            return Gif16Regular;
    }
}

async function getCardAsync({ wayback, mimetype }: { wayback: string, mimetype: string }) {
    usersList.value = [];
    mediaList.value = [];
    if (mimetype === "application/json") {
        const html = await fetch(wayback).then(res => res.text());
        const document = new DOMParser().parseFromString(html, "text/html");
        const content = document.getElementById("nonjsonview");
        if (content) {
            changeUrl(content);
            container.value = Twitter;
            const json = document.querySelector("#jsonview pre")?.textContent;
            if (json) {
                try {
                    type twitter = {
                        data: {
                            created_at: string,
                            referenced_tweets?: {
                                type: string
                            }[]
                        },
                        includes: {
                            media?: {
                                type: string,
                                url: string,
                                variants?: {
                                    bit_rate: number,
                                    url: string
                                }[]
                            }[],
                            users: {
                                username: string,
                                profile_image_url: string
                            }[]
                        }
                    }
                    const post: twitter = JSON.parse(json);
                    const includes = post.includes;
                    const media = includes?.media;
                    hasMedia.value = !!media?.length;
                    const data = post.data;
                    if (data) {
                        isReply.value = !!data.referenced_tweets?.some(tweet => tweet.type === "replied_to");
                        isRetweet.value = !!data.referenced_tweets?.some(tweet => tweet.type === "retweeted");
                        isQuoted.value = !!data.referenced_tweets?.some(tweet => tweet.type === "quoted");
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
                    const users = includes?.users;
                    if (Array.isArray(users)) {
                        for (const item of users) {
                            usersList.value.push({
                                username: item.username,
                                avatar: item.profile_image_url
                            });
                        }
                    }
                    if (Array.isArray(media)) {
                        let count = 0;
                        for (const item of media) {
                            switch (item.type) {
                                case "photo":
                                    mediaList.value.push({
                                        type: "photo",
                                        title: `Photo ${++count}`,
                                        url: item.url
                                    });
                                    break;
                                case "video":
                                case "animated_gif":
                                    const variants = item.variants;
                                    if (Array.isArray(variants)) {
                                        const variant = variants.sort((a, b) => b.bit_rate - a.bit_rate)[0];
                                        if (variant) {
                                            mediaList.value.push({
                                                type: item.type,
                                                title: `${item.type === "video" ? "Video" : "GIF"} ${++count}`,
                                                url: variant.url
                                            });
                                        }
                                    }
                                    break;
                            }
                        }
                    }
                }
                catch { }
            }
            element.value = content;
            return true;
        }
    }
    else {
        const html = await fetch(wayback).then(res => res.text());
        const document = new DOMParser().parseFromString(html, "text/html");
        const content = document.querySelector(".original-permalink-page");
        if (content) {
            changeUrl(content);
            container.value = TwitterDesktop;
            hasMedia.value = !!content.querySelector(".AdaptiveMedia");
            element.value = content;
            return true;
        }
        else {
            const content = document.querySelector("main");
            if (content) {
                changeUrl(content);
                container.value = TwitterMobile;
                hasMedia.value = !!content.querySelector("div[aria-label='Image']");
                element.value = content;
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

function checker(target: EventTarget | null) {
    return target instanceof HTMLDivElement && !getSelection()?.toString();
}

onMounted(refresh);
</script>

<style lang="scss" scoped>
@use "../styles/colors.scss";

$menu-flyout-item-foreground: colors.$text-fill-color-primary;
$menu-flyout-item-foreground-pointer-over: colors.$text-fill-color-primary;
$menu-flyout-item-foreground-pressed: colors.$text-fill-color-primary;
$menu-flyout-item-foreground-disabled: colors.$text-fill-color-disabled;

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

a.menu-flyout-item {
    color: $menu-flyout-item-foreground;

    &:not(:disabled):hover {
        color: $menu-flyout-item-foreground-pointer-over;
    }

    &:not(:disabled):active {
        color: $menu-flyout-item-foreground-pressed;
    }

    &:not(:disabled):focus {
        color: $menu-flyout-item-foreground;
    }

    &:disabled {
        color: $menu-flyout-item-foreground-disabled;
    }

    &:hover,
    &:active,
    &:focus {
        text-decoration: none;
    }
}
</style>