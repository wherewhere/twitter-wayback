<template>
    <div class="stack-vertical" style="row-gap: 8px; align-items: stretch;">
        <div class="stack-horizontal" style="column-gap: 8px; justify-content: space-between;">
            <input name="username" v-model="username" type="text" placeholder="wherewhere7"
                @keyup.enter="() => getPosts(username)" style="flex: 1;" />
            <button @click="() => getPosts(username)" :disabled="!username || isLoading">Fetch</button>
        </div>
        <div v-if="isLoading">
            <svg class="header-refresh-ring" width="16" height="16" viewBox="0 0 16 16">
                <circle class="indeterminate-indicator" cx="8px" cy="8px" r="7px"></circle>
            </svg>
        </div>
        <div v-else-if="posts.length" class="masonry">
            <div v-for="value in posts">
                <Post :post="value" />
            </div>
        </div>
        <div v-else-if="error">
            Error fetching posts:<br />
            {{ error }}
        </div>
        <div v-else>
            Enter a Twitter username and click "Fetch" to load archived posts.
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, shallowRef } from "vue";
import { useSeoMeta } from "@unhead/vue";
import { name, description, keywords } from "./package.json";
import { getTwitterPosts, type WaybackItem } from "./helpers/wayback";
import Post from "./components/Post.vue";

const author = "wherewhere";
const meta = useSeoMeta({
    // Basic SEO
    title: name,
    description,
    author: author,
    keywords: keywords.join(", "),

    // Open Graph
    ogTitle: name,
    ogDescription: description,
    ogType: "website",
    ogLocale: "en-US",
    ogSiteName: name,

    // Twitter
    twitterCard: "summary",
    twitterSite: "@wherewhere7",

    // Product specific (structured data will be generated)
    articleAuthor: [author],
    articleTag: keywords
});

function getUsername() {
    const hash = window.location.hash.slice(1);
    return hash || '';
}

const username = shallowRef(getUsername());
addEventListener("hashchange", () => username.value = getUsername());
function saveUserName(username: string) {
    window.location.hash = username;
    meta.patch({
        // Basic SEO
        title: username ? `${username} | ${name}` : name,

        // Open Graph
        ogTitle: username || name,
        ogSiteName: name
    });
}

const isLoading = shallowRef(false);
let source: InstanceType<typeof WaybackItem>[] = [];
const error = ref<unknown>();
const posts = ref<InstanceType<typeof WaybackItem>[]>([]);
async function getPosts(username: string) {
    if (isLoading.value) { return; }
    isLoading.value = true;
    try {
        saveUserName(username);
        error.value = undefined;
        source = [];
        posts.value = [];
        for await (const post of getTwitterPosts(username)) {
            source.push(post);
        }
        const count = Math.max(3, Math.floor(window.innerHeight / 200) * Math.floor((window.innerWidth / 420)));
        posts.value.push(...source.slice(0, count));
        source = source.slice(count);
    }
    catch (e) {
        console.error(e);
        error.value = e;
    }
    finally {
        isLoading.value = false;
    }
}

function onScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        if (source.length > 0) {
            posts.value.push(...source.slice(0, 3));
            source = source.slice(3);
        }
    }
}

onMounted(() => {
    addEventListener("scroll", onScroll);
    addEventListener("resize", onScroll);
});
</script>

<style lang="scss">
@use "./styles/colors";

body {
    background: colors.$solid-background-fill-color-base;
    font-size: colors.$content-control-font-size;
    color: colors.$text-fill-color-primary;
    font-family: colors.$body-font;
}
</style>

<style lang="scss" scoped>
@use "./styles/masonry";
@use "./styles/controls";
@use "./styles/colors";

.stack-vertical {
    display: flex;
    flex-direction: column;
}

.stack-horizontal {
    display: flex;
    flex-direction: row;
}

.masonry {
    @include masonry.masonry("420px", "8px", "8px");

    >div {
        display: flex;
    }
}

.header-refresh-ring {
    height: 100px;
    width: 100px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.indeterminate-indicator {
    stroke: colors.$accent-fill-color-default;
    fill: none;
    stroke-width: 2px;
    stroke-linecap: round;
    transform-origin: 50% 50%;
    transform: rotate(-90deg);
    transition: 0.2s ease-in-out;
    animation: 2s linear 0s infinite normal none spin-infinite;
}

@keyframes spin-infinite {
    0% {
        stroke-dasharray: 0.01px, 43.97px;
        transform: rotate(0deg);
    }

    50% {
        stroke-dasharray: 21.99px, 21.99px;
        transform: rotate(450deg);
    }

    100% {
        stroke-dasharray: 0.01px, 43.97px;
        transform: rotate(1080deg);
    }
}
</style>