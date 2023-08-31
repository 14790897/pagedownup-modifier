<template>
  <div id="app" class="p-4 bg-gray-100 h-screen">
    <h1 class="text-2xl font-bold mb-4">Custom Page Scroll</h1>
    <div class="space-y-4">
      <label class="flex items-center space-x-4">
        <span class="text-lg">Page Up Distance:</span>
        <input v-model="pageUpDistance" class="p-2 border rounded" />
      </label>
      <label class="flex items-center space-x-4">
        <span class="text-lg">Page Down Distance:</span>
        <input v-model="pageDownDistance" class="p-2 border rounded" />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">

const pageUpDistance = ref<number>(0);
const pageDownDistance = ref<number>(0);

onMounted(() => {
  chrome.storage.sync.get(['pageUpDistance', 'pageDownDistance'], (result: any) => {
    pageUpDistance.value = result.pageUpDistance || 300;
    pageDownDistance.value = result.pageDownDistance || 300;
  });
});

const updateScrollDistance = (key: string, value: number) => {
  chrome.storage.sync.set({ [key]: value });
};

watch(pageUpDistance, (newVal: number) => {
  updateScrollDistance('pageUpDistance', newVal);
});

watch(pageDownDistance, (newVal: number) => {
  updateScrollDistance('pageDownDistance', newVal);
});

</script>