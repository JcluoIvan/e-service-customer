<template>
    <div class="Emojis-Component">
        <div class="tabs">
            <div class="tab"
                :class="{active: tab.value === activeTab.value}"
                v-for="tab in tabs"
                @mousedown="activeTab = tab"
                :key="tab.value">
                {{ tab.emoji }}
            </div>
            <div class="tab-empty"></div>
        </div>
        <div class="search-panel">
            <input type="text"
                v-model="search"
                placeholder="Sarch">
            <i class="material-icons">search</i>
        </div>
        <div class="common-panel">
        </div>
        <div class="emoji-list">
            <h6>{{ activeTab.label }}</h6>
            <span class="emoji-item"
                v-for="item in emojis"
                @mouseenter="activeEmoji = item"
                @mouseleave="activeEmoji = null"
                @mousedown="onSelectEmoji(item)"
                :key="item.emoji">
                {{ item.emoji }}
            </span>
        </div>
        <div class="emoji-detail">
            <div class="emoji-detail__emoji">{{ activeEmoji ? activeEmoji.emoji : '' }}</div>
            <div class="emoji-detail__label">
                <h6>{{ activeEmoji ? activeEmoji.label : '' }}</h6>
                <small>{{ activeEmoji ? activeEmoji.shorts.join(', ') : '' }}</small>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import emojis, { PeopleEmoji, EmojiType, FoodsEmoji, SymbolsEmoji, NatureEmoji, EmojiItem } from '@/support/emojis';

namespace P {
    export interface Tab {
        value: EmojiType;
        emoji: string;
        label: string;
        list: EmojiItem[];
    }
}

const tabs: P.Tab[] = [
    {
        value: EmojiType.People,
        emoji: '🙂',
        label: 'Smileys & People',
        list: PeopleEmoji,
    },
    {
        value: EmojiType.Nature,
        emoji: '🐻',
        label: 'Animals & Nature',
        list: NatureEmoji,
    },
    {
        value: EmojiType.Foods,
        emoji: '🍔',
        label: 'Food & Drink',
        list: FoodsEmoji,
    },
    {
        value: EmojiType.Symbols,
        emoji: '🔣',
        label: 'Symbols',
        list: SymbolsEmoji,
    },
];

@Component
export default class Emojis extends Vue {
    public activeTab: P.Tab = tabs[0];
    public activeEmoji: EmojiItem | null = null;
    public search = '';
    get tabs() {
        return tabs;
    }
    get emojis() {
        const search = this.search;
        return this.activeTab.list.filter((o) => {
            return [o.label, o.shorts].some((s) => s.indexOf(search) >= 0);
        });
    }

    protected onSelectEmoji(item: EmojiItem) {
        this.$emit('select', item);
    }
    // get groups() {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/common.scss';
.Emojis-Component {
    border: 1px solid #ccc;
    border-radius: 5px;
    background: #fff;
    width: 400px;

    .tabs {
        padding: 5px;
        padding-bottom: 0;
        border-bottom: 1px solid #ccc;
        margin: 0;
        display: flex;

        .tab {
            margin-bottom: 0;
            padding: 5px;
            padding-bottom: 5px;
            border-bottom: 3px solid #fff;
            transition: 150ms;
            flex: none;
            cursor: pointer;
            &:hover {
                background: #eee;
            }
            &.active {
                border-bottom-color: color(primary);
            }
        }
        .tab-empty {
            flex: 1;
        }
    }
    .search-panel {
        border: 1px solid #bbb;
        border-radius: 5px;
        margin: 10px;
        display: flex;
        overflow: hidden;
        input {
            flex: 1;
            outline: none;
            border: 0;
            padding: 5px 10px;
            font-size: 1rem;
        }
        .material-icons {
            flex: none;
            color: #aaa;
            padding: 5px 10px;
            font-size: 1.6rem;
        }
    }

    .emoji-list {
        position: relative;
        padding: 5px 10px;
        height: 250px;
        overflow: auto;
        border-bottom: 1px solid #ccc;
        .emoji-item {
            display: inline-block;
            margin: 2px;
            width: 2.2rem;
            height: 2.2rem;
            text-align: center;
            font-size: 1.5rem;

            cursor: pointer;
            &:hover {
                background: #ccc;
            }
        }
    }

    .emoji-detail {
        position: relative;
        height: 5rem;
        display: flex;
        width: 100%;
        .emoji-detail__emoji {
            flex: none;
            font-size: 4rem;
            background: #eee;
            display: inline-block;
            text-align: center;
            line-height: 1;
            padding: 0.25rem;
            width: 6rem;
        }
        .emoji-detail__label {
            flex: 1;
            overflow: hidden;
            white-space: nowrap;
            width: 100%;

            h6 {
                font-size: 1.2rem;
                color: #555;
                margin: 0.8rem 0.8rem 0.2rem 0.8rem;
            }
            small {
                font-size: 1rem;
                margin-left: 2rem;
                color: #999;
            }
        }
    }
}
</style>
