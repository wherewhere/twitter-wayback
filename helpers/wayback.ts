import { popString } from "./utils";

function getApi(params: Record<string, string> & Partial<{
    url: string,
    matchType: string,
    collapse: string,
    output: string,
    fl: string,
    filter: string,
    from?: string,
    to?: string
}>) {
    const url = new URL("https://web.archive.org/web/timemap/json");
    url.search = new URLSearchParams(params).toString();
    return url;
}

export class WaybackItem {
    id: number;
    original: string;
    mimetype: string;
    timestamp: string;
    groupcount: number;

    constructor(original: string, mimetype: string, timestamp: string, groupcount: string) {
        this.id = +(popString(original.split('/')) || 0);
        this.original = original;
        this.mimetype = mimetype;
        this.timestamp = timestamp;
        this.groupcount = +groupcount;
    }

    get wayback() {
        return `https://web.archive.org/web/${this.timestamp}if_/${this.original}`;
    }

    async fetch() {
        const url = getApi({
            url: this.original,
            output: "json",
            fl: "original,mimetype,timestamp",
            filter: "!statuscode:[45].."
        });
        return await fetch(url).then(r => r.json()) as string[][] | undefined;
    }
}

export async function* getTwitterPosts(username: string, from?: string, to?: string) {
    if (!username) { return; }
    const params: Parameters<typeof getApi>[0] = {
        url: `twitter.com/${username}/status/`,
        matchType: "prefix",
        collapse: "urlkey",
        output: "json",
        fl: "original,mimetype,timestamp,groupcount",
        filter: "!statuscode:[45].."
    }
    if (from) { params.from = from; }
    if (to) { params.to = to; }
    const url = getApi(params);
    const data: string[][] | undefined = await fetch(url).then(r => r.json());
    if (Array.isArray(data)) {
        for (const item of data.slice(1)) {
            if (Array.isArray(item)) {
                const [original, mimetype, timestamp, groupcount] = item;
                const split = original.split('/').filter(x => !!x);
                if (split.length === 5 && !isNaN(+split.pop()!)) {
                    yield new WaybackItem(original, mimetype, timestamp, groupcount);
                }
            }
        }
    }
}