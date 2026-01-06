<template>
    <dialog ref="dialog">
        <div class="dialog-space" contract7Present:CornerRadius="{ThemeResource OverlayCornerRadius}">
            <div class="content-scroll-viewer">
                <div>
                    <div class="title">
                        <slot name="title"></slot>
                    </div>
                    <div class="content">
                        <slot></slot>
                    </div>
                </div>
            </div>
            <div class="command-space">
                <button v-if="PrimaryButtonText" @click="() => close('Primary')"
                    :class="['primary-button', getBottonStyle('Primary', DefaultButton)]"
                    :disabled="!IsPrimaryButtonEnabled">
                    {{ PrimaryButtonText }}
                </button>
                <button v-if="SecondaryButtonText" @click="() => close('Secondary')"
                    :class="['secondary-button', getBottonStyle('Secondary', DefaultButton)]"
                    :disabled="!IsSecondaryButtonEnabled">
                    {{ SecondaryButtonText }}
                </button>
                <button v-if="CloseButtonText" @click="() => close('None')"
                    :class="['close-button', getBottonStyle('Close', DefaultButton)]">
                    {{ CloseButtonText }}
                </button>
            </div>
        </div>
    </dialog>
</template>

<script lang="ts" setup>
import { useTemplateRef } from 'vue';

type ContentDialogResult = "None" | "Primary" | "Secondary";
const {
    DefaultButton = "None",
    PrimaryButtonText,
    IsPrimaryButtonEnabled = true,
    SecondaryButtonText,
    IsSecondaryButtonEnabled = true,
    CloseButtonText
} = defineProps<{
    DefaultButton?: ContentDialogResult | "Close";
    PrimaryButtonText?: string;
    IsPrimaryButtonEnabled?: boolean;
    SecondaryButtonText?: string;
    IsSecondaryButtonEnabled?: boolean;
    CloseButtonText?: string;
}>();

function getBottonStyle(currentButton: Exclude<ContentDialogResult, "None"> | "Close", defaultButton: ContentDialogResult | "Close") {
    return currentButton === defaultButton ? "accent" : undefined;
}

const dialog = useTemplateRef("dialog");

function close(result: ContentDialogResult) {
    dialog.value!.close(result);
}

function showAsync() {
    return new Promise<ContentDialogResult>(resolve => {
        dialog.value!.showModal();
        dialog.value!.addEventListener("close", ev => {
            const target = ev.target;
            if (target instanceof HTMLDialogElement) {
                resolve(target.returnValue as ContentDialogResult);
            }
        });
    })
}

defineExpose({
    showAsync,
    hide: () => close("None")
});
</script>

<style lang="scss" scoped>
@use "../styles/colors" as *;
@use "../styles/controls/dialog" as dialog;

.dialog-space {
    flex: 1;
    display: flex;
    overflow: inherit;
    flex-direction: column;
    justify-content: space-between;
    border-radius: $overlay-corner-radius;

    .content-scroll-viewer {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: auto;
        scrollbar-width: none;

        >div {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: dialog.$content-dialog-top-overlay;
            padding: dialog.$content-dialog-padding;
            border-bottom: dialog.$content-dialog-separator-thickness solid dialog.$content-dialog-separator-border;

            .title {
                margin-bottom: dialog.$content-dialog-title-margin-bottom;
                font-size: 20px;
                font-weight: 600;
                word-wrap: break-word;
                max-lines: 2;
            }

            .content {
                flex: 1;
                word-wrap: break-word;
            }
        }
    }

    .command-space {
        display: flex;
        justify-content: flex-end;
        column-gap: dialog.$content-dialog-button-spacing;
        padding: dialog.$content-dialog-padding;
        background: dialog.$content-dialog-background;

        button {
            flex: 1;
            max-width: 50%;
        }
    }
}
</style>