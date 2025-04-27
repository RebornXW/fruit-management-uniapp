<template>
    <text :style="iconStyle" class="custom-icon">{{ iconText }}</text>
</template>

<script>
// 图标映射表
const iconMap = {
    'search': '\uf002',
    'more': '\uf142',
    'arrow-up': '\uf062',
    'arrow-down': '\uf063',
    'minus': '\uf068',
    'plus': '\uf067',
    'file': '\uf15b',
    'calendar': '\uf133',
    'right': '\uf054',
    'down': '\uf078',
    'setting': '\uf013',
    'edit': '\uf304',
    'delete': '\uf1f8',
    'check': '\uf00c',
    'add': '\uf067',
    'exchange': '\uf362',
    'chart': '\uf080',
    'users': '\uf0c0',
    'logout': '\uf2f5',
    'close': '\uf00d',
    'left': '\uf104'
};

export default {
    name: 'CustomIcon',
    props: {
        type: {
            type: String,
            required: true
        },
        size: {
            type: [Number, String],
            default: 16
        },
        color: {
            type: String,
            default: '#333'
        }
    },
    computed: {
        iconText() {
            return iconMap[this.type] || '';
        },
        iconStyle() {
            return {
                fontSize: `${this.size}px`,
                color: this.color
            };
        }
    }
}
</script>

<style>
.custom-icon {
    font-family: "FontAwesome" !important;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
</style>