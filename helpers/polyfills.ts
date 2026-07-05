export const isAnchorNameSupported = CSS.supports("anchor-name", "--a");

export async function anchorPositioningAsync(useAnimationFrameOrOption: Parameters<typeof import("@oddbird/css-anchor-positioning/fn").default>[0]) {
    return import("@oddbird/css-anchor-positioning/fn").then(x => x.default(useAnimationFrameOrOption));
}