<template>
    <div class="stack-vertical" style="row-gap: 8px; align-items: stretch;">
        <div class="stack-horizontal" style="column-gap: 8px; justify-content: space-between;">
            <input id="username" name="username" v-model="username" type="text" placeholder="wherewhere7"
                @keyup.enter="() => getPosts(username)" style="flex: 1;" />
            <button class="icon-button" title="Fetch" @click="() => getPosts(username)"
                :disabled="!username || isLoading">
                <ArrowRight16Regular />
            </button>
            <button class="icon-button" title="Settings" @click="openSettingsFlyout">
                <Settings16Regular />
            </button>
        </div>
        <ContentDialog ref="settings" PrimaryButtonText="Save" CloseButtonText="Close" DefaultButton="Primary">
            <template #title>
                <h2 id="settings" class="unset">Settings</h2>
            </template>
            <div class="stack-vertical" style="row-gap: 0.3rem;">
                <SettingsCard>
                    <template #icon>
                        <Person20Regular />
                    </template>
                    <template #header>
                        <h3 id="settings-username" class="unset">Username</h3>
                    </template>
                    <template #description>
                        The Twitter username whose archived posts you want to view.
                    </template>
                    <input name="username" v-model="username" type="text" placeholder="wherewhere7" />
                </SettingsCard>
                <SettingsCard>
                    <template #icon>
                        <ArrowSort20Regular />
                    </template>
                    <template #header>
                        <h3 id="settings-username" class="unset">Sort</h3>
                    </template>
                    <template #description>
                        Choose the order in which posts are displayed.
                    </template>
                    <select name="sortOrder" v-model="sortOrder">
                        <option value="oldest">Oldest to Newest</option>
                        <option value="newest">Newest to Oldest</option>
                    </select>
                </SettingsCard>
                <SettingsCard>
                    <template #icon>
                        <CalendarLtr20Regular />
                    </template>
                    <template #header>
                        <h3 id="settings-username" class="unset">From</h3>
                    </template>
                    <template #description>
                        Filter posts starting from a specific date.
                    </template>
                    <input name="fromDate" type="date" v-model="fromDate" />
                </SettingsCard>
                <SettingsCard>
                    <template #icon>
                        <CalendarRtl20Regular />
                    </template>
                    <template #header>
                        <h3 id="settings-username" class="unset">To</h3>
                    </template>
                    <template #description>
                        Filter posts up to a specific date.
                    </template>
                    <input name="toDate" type="date" v-model="toDate" />
                </SettingsCard>
            </div>
        </ContentDialog>
        <div v-if="isLoading">
            <svg class="refresh-ring" width="16" height="16" viewBox="0 0 16 16">
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
        <label v-else for="username">
            Enter a Twitter username and click "Fetch" to load archived posts.
        </label>
    </div>
</template>

<script lang="ts" setup>
import "./types";
import { onMounted, ref, shallowRef, useTemplateRef, watchEffect } from "vue";
import { useSeoMeta } from "@unhead/vue";
import { name, description, keywords } from "./package.json";
import { getTwitterPosts, type WaybackItem } from "./helpers/wayback";
import { popString } from "./helpers/utils";
import ContentDialog from "./components/ContentDialog.vue";
import SettingsCard from "./components/SettingsCard.vue";
import Post from "./components/Post.vue";
import ArrowRight16Regular from "@fluentui/svg-icons/icons/arrow_right_16_regular.svg?component";
import Settings16Regular from "@fluentui/svg-icons/icons/settings_16_regular.svg?component";
import Person20Regular from "@fluentui/svg-icons/icons/person_20_regular.svg?component";
import ArrowSort20Regular from "@fluentui/svg-icons/icons/arrow_sort_20_regular.svg?component";
import CalendarLtr20Regular from "@fluentui/svg-icons/icons/calendar_ltr_20_regular.svg?component";
import CalendarRtl20Regular from "@fluentui/svg-icons/icons/calendar_rtl_20_regular.svg?component";

const settingsFlyout = useTemplateRef("settings");
async function openSettingsFlyout() {
    const result = await settingsFlyout.value!.showAsync();
    if (result === "Primary") {
        setSettings();
    }
}

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

function getDateString(date?: string) {
    if (!date) { return; }
    const d = new Date(date);
    return `${d.getUTCFullYear().toString().padStart(2, '0')}${(d.getUTCMonth() + 1).toString().padStart(2, '0')}${d.getUTCDate().toString().padStart(2, '0')}`;
}

const username = shallowRef('');
const sortOrder = shallowRef<"oldest" | "newest">("oldest");
const fromDate = shallowRef<string>();
const toDate = shallowRef<string>();

let hashChanged = false;
function getSettings() {
    if (hashChanged) {
        hashChanged = false;
        return;
    }
    const hash = location.hash.substring(1);
    if (hash) {
        const params = new URLSearchParams(hash);
        if (params.has("user")) {
            username.value = params.get("user")!;
        }
        if (params.has("sort")) {
            sortOrder.value = params.get("sort") as "oldest" | "newest";
        }
        if (params.has("from")) {
            fromDate.value = params.get("from")!;
        }
        if (params.has("to")) {
            toDate.value = params.get("to")!;
        }
    }
}

function setSettings() {
    const settings: Record<string, string> = {};
    if (username.value) {
        if (username.value.includes('/')) {
            username.value = popString(username.value.split('/')) || '';
        }
        settings.user = username.value;
    }
    if (sortOrder.value === "newest") {
        settings.sort = sortOrder.value;
    }
    if (fromDate.value) {
        settings.from = fromDate.value;
    }
    if (toDate.value) {
        settings.to = toDate.value;
    }
    window.location.hash = new URLSearchParams(settings).toString();
    meta.patch({
        // Basic SEO
        title: username.value ? `${username.value} | ${name}` : name,

        // Open Graph
        ogTitle: username.value || name,
        ogSiteName: name
    });
}

addEventListener("hashchange", getSettings);

const isLoading = shallowRef(false);
let source: InstanceType<typeof WaybackItem>[] = [];
const error = ref<unknown>();
const posts = ref<InstanceType<typeof WaybackItem>[]>([]);
async function getPosts(username: string) {
    if (isLoading.value) { return; }
    isLoading.value = true;
    try {
        setSettings();
        error.value = undefined;
        source = [];
        posts.value = [];
        for await (const post of getTwitterPosts(username, getDateString(fromDate.value), getDateString(toDate.value))) {
            source.push(post);
        }
        if (sortOrder.value === "newest") {
            source = source.reverse().sort((a, b) => b.id - a.id);
        }
        else {
            source = source.sort((a, b) => a.id - b.id);
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
    getSettings();
});
</script>

<style lang="scss">
@use "./styles/colors";
@use "./styles/controls";

body {
    background: colors.$solid-background-fill-color-base;
    font-size: colors.$content-control-font-size;
    color: colors.$text-fill-color-primary;
    font-family: colors.$body-font;
}

h6.unset,
h5.unset,
h4.unset,
h3.unset,
h2.unset,
h1.unset {
    margin-top: 0;
    margin-bottom: 0;
    font-weight: inherit;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
}
</style>

<style lang="scss" scoped>
@use "./styles/masonry";
@use "./styles/colors";

input,
section {
    min-width: 0;
    width: auto;
}

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

.icon-button {
    padding: 6px 7px;
}

.refresh-ring {
    height: 100px;
    width: 100px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

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
}
</style>