<template>
  <div id="app" class="p-4 bg-gray-100 ">
    <h1 class="flex justify-center items-center text-xl font-bold mb-4">Custom Page Scroll</h1>
    <div class="flex justify-center items-center text-xl font-bold mb-4">
      <h1>{{ greeting }}</h1>
    </div>
    <div class="space-y-4">
      <label class="flex items-center space-x-4">
        <span class="text-base">Page Up Distance:</span>
        <input v-model="pageUpDistance" class="p-2 border rounded w-full" />
      </label>
      <label class="flex items-center space-x-4">
        <span class="text-base">Page Down Distance:</span>
        <input v-model="pageDownDistance" class="p-2 border rounded w-full" />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
const greeting = ref('');
const pageUpDistance = ref<number>(0);
const pageDownDistance = ref<number>(0);

onMounted(() => {
  chrome.storage.sync.get(['pageUpDistance', 'pageDownDistance'], (result: any) => {
    pageUpDistance.value = result.pageUpDistance || 300;
    pageDownDistance.value = result.pageDownDistance || 300;
  });

  //Show the greeting world 8.31
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    greeting.value = '早上好！';
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting.value = '中午好！';
  } else {
    greeting.value = '晚上好！';
  }


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