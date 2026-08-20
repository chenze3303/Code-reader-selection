<template>
  <span v-html="svg" :class="['ui-icon', cls]"></span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  cls: { type: String, default: '' },
  size: { type: [Number, String], default: '' }
})

const svg = computed(() => {
  const base = window.uiIcon ? window.uiIcon(props.name, props.cls) : ''
  if (!props.size) return base
  return base
    .replace('class="lucide-icon', 'style="width:' + props.size + 'px;height:' + props.size + 'px" class="lucide-icon')
})
</script>
