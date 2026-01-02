function getApi(params: Record<string, string> & Partial<{
    url: string,
    matchType: string,
    collapse: string,
    output: string,
    fl: string,
    filter: string
}>) {
    const url = new URL("https://web.archive.org/web/timemap/json");
    url.search = new URLSearchParams(params).toString();
    return url;
}

export class WaybackItem {
    original: string;
    mimetype: string;
    timestamp: string;
    groupcount: number

    constructor(original: string, mimetype: string, timestamp: string, groupcount: string) {
        this.original = original;
        this.mimetype = mimetype;
        this.timestamp = timestamp;
        this.groupcount = +groupcount;
    }

    get wayback() {
        return `https://web.archive.org/web/${this.timestamp}if_/${this.original}`;
    };
    async fetch() {
        const url = getApi({
            url: this.original,
            output: "json",
            fl: "original,mimetype,timestamp",
            filter: "!statuscode:[45].."
        });
        return await fetch(url).then(r => r.json()) as string[][] | undefined;
    };
}

export async function* getTwitterPosts(username: string) {
    if (!username) { return; }
    const url = getApi({
        url: `twitter.com/${username}/status/`,
        matchType: "prefix",
        collapse: "urlkey",
        output: "json",
        fl: "original,mimetype,timestamp,groupcount",
        filter: "!statuscode:[45].."
    });
    const data: string[][] | undefined = await fetch(url).then(r => r.json());
    if (Array.isArray(data)) {
        for (const item of data.slice(1)) {
            if (Array.isArray(item)) {
                const [original, mimetype, timestamp, groupcount] = item;
                yield new WaybackItem(original, mimetype, timestamp, groupcount);
            }
        }
    }
}