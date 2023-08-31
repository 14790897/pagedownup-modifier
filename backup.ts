chrome.tabs.onActivated.addListener(async (activeInfo) => {
  console.log('Tab activated:', activeInfo.tabId)
  try {
    await chrome.scripting.executeScript({
      target: { tabId: activeInfo.tabId },
      func: modifyPageScroll,
    })
    console.log('Script executed on tab:', activeInfo.tabId)
  } catch (error) {
    console.log('Error executing script:', error)
  }
})

chrome.storage.onChanged.addListener(async (changes, namespace) => {
  // 获取当前激活的标签页
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  const activeTab = tabs[0]
  if (activeTab && activeTab.id) {
    // 重新注入脚本
    chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: modifyPageScroll,
    })
  }
})

async function modifyPageScroll() {
  console.log('modifyPageScroll function called')

  try {
    let currentListener = await getStorageData('currentListener')
    // 如果已经有一个监听器，先移除它
    if (currentListener) {
      document.removeEventListener('keydown', JSON.parse(currentListener))
    }

    const items = await chrome.storage.sync.get([
      'pageDownDistance',
      'pageUpDistance',
    ])

    console.log('Fetched from storage:', items)

    const pageDownDistance = items.pageDownDistance || 300
    const pageUpDistance = items.pageUpDistance || 300

    console.log(
      `Using distances - PageDown: ${pageDownDistance}, PageUp: ${pageUpDistance}`
    )

    // 创建新的事件监听器
    currentListener = function (event) {
      if (event.code === 'PageDown') {
        window.scrollBy(0, pageDownDistance)
        event.preventDefault()
      } else if (event.code === 'PageUp') {
        window.scrollBy(0, -pageUpDistance)
        event.preventDefault()
      }
    }

    // 添加新的事件监听器
    document.addEventListener('keydown', JSON.parse(currentListener))
    await chrome.storage.local.set({ currentListener: JSON.stringify(currentListener) })
  } catch (error) {
    console.log('Error fetching from storage:', error)
  }
}

async function getStorageData<T>(
  storageKey: string,
  defaultValue: T = {} as T
): Promise<T> {
  try {
    const result = await chrome.storage.local.get(storageKey)
    if (!result[storageKey]) {
      console.log('Notice: the value is null in getStorageData.')
    }
    return (result[storageKey] || defaultValue) as T
  } catch (error) {
    console.error(`Error fetching ${storageKey}:`, error)
    return defaultValue
  }
}


// document.addEventListener('keydown', function (event) {
//   if (
//     (event.code === 'PageDown' && event.altKey) ||
//     (event.code === 'PageUp' && event.altKey)
//   ) {
//     event.preventDefault() // 阻止默认行为
//   }
// })

// chrome.tabs.onActivated.addListener(async (activeInfo) => {
//   console.log('Tab activated:', activeInfo.tabId)
//   try {
//     await chrome.scripting.executeScript({
//       target: { tabId: activeInfo.tabId },
//       func: function () {
//         document.addEventListener('keydown', function (event) {
//           if (event.code === 'PageDown' && event.altKey) {
//             event.preventDefault()
//             for (let i = 0; i < 3; i++) {
//               simulateKeyPress('ArrowDown')
//             }
//           } else if (event.code === 'PageUp' && event.altKey) {
//             event.preventDefault()
//             for (let i = 0; i < 3; i++) {
//               simulateKeyPress('ArrowUp')
//             }
//           }
//         })

//         function simulateKeyPress(key) {
//           const event = new KeyboardEvent('keydown', {
//             bubbles: true,
//             cancelable: true,
//             key: key,
//           })
//           document.dispatchEvent(event)
//         }
//       },
//     })
//     console.log('Script executed on tab:', activeInfo.tabId)
//   } catch (error) {
//     console.log('Error executing script:', error)
//   }
// })
