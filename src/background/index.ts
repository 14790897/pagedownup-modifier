async function handleScroll(command, tabId, pageDownDistance, pageUpDistance) {
  try {
    const result = await chrome.storage.local.get(['targetElement'])
    const targetClass = result.targetElement || ''
    const selector = targetClass ? '.' + targetClass.split(' ').join('.') : ''
    console.log('targetClass in handleScroll:', targetClass)
    const distance =
      command === 'scroll-down' ? pageDownDistance : -pageUpDistance

    await chrome.scripting.executeScript({
      target: { tabId },
      func: (distance, selector) => {
        const targetElement = selector
          ? document.querySelector(selector)
          : window
        if (targetElement) {
          targetElement.scrollBy(0, distance)
        } else {
          console.warn('Target element not found:', selector)
        }
      },
      args: [distance, selector],
    })

    console.log(command === 'scroll-down' ? 'scroll down' : 'scroll up')
  } catch (error) {
    console.error('An error occurred:', error)
  }
}

chrome.commands.onCommand.addListener(async function (command) {
  try {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    })
    const activeTab = tabs[0]
    const tabId = activeTab.id

    if (!tabId) {
      console.log('No tabId found')
      return
    }

    const items = await chrome.storage.sync.get([
      'pageDownDistance',
      'pageUpDistance',
    ])
    const pageDownDistance = items.pageDownDistance || 300
    const pageUpDistance = items.pageUpDistance || 300

    await handleScroll(command, tabId, pageDownDistance, pageUpDistance)
  } catch (error) {
    console.error('An error occurred:', error)
  }
})

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    // 确保标签页已完全加载并且是当前活动标签
    console.log('Tab updated:', tabId)
    try {
      // 移除之前保存的元素
      await chrome.storage.local.remove(['targetElement'])
      await chrome.scripting.executeScript({
        target: { tabId },
        func: function () {
          let hasSentMessage = false // 设置一个标志来跟踪是否已经发送过消息

          document.addEventListener(
            'scroll',
            function (event) {
              if (!hasSentMessage) {
                // 只有在还没有发送过消息的情况下才发送
                // 使用chrome.runtime.sendMessage发送捕获到的event.target
                chrome.runtime.sendMessage({
                  type: 'SCROLLED_ELEMENT',
                  targetClass: event.target.className, // 或其他能唯一标识这个元素的信息
                })
                hasSentMessage = true // 更新标志以防止再次发送
                localStorage.setItem(
                  'lastScrolledElement',
                  event.target.className
                ) // 本地存储
                // 监听来自 background 的消息
                chrome.runtime.onMessage.addListener(
                  (message, sender, sendResponse) => {
                    if (message.type === 'GET_LOCAL_STORAGE') {
                      const storedData =
                        localStorage.getItem('lastScrolledElement') || ''
                      sendResponse({ data: storedData })
                    }
                  }
                )
              }
            },
            true
          ) // 注意这里的`true`
        },
      })
      console.log('Script executed on tab:', tabId)
    } catch (error) {
      console.log('Error executing script:', error)
    }
  }
})

// 在标签页激活时执行
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tabId = activeInfo.tabId
  try {
    // 移除之前保存的元素
    await chrome.storage.local.remove(['targetElement'])
    chrome.tabs.sendMessage(
      tabId,
      { type: 'GET_LOCAL_STORAGE' },
      async (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError)
          return
        }
        // 处理从 content script 返回的数据
        console.log('Received data from content script:', response.data)
        await chrome.storage.local.set({ targetElement: response.data }) // 保存接收到的类名
      }
    )
    // await chrome.scripting.executeScript({
    //   target: { tabId },
    //   func: function () {
    //     // 从localStorage获取存储的类名
    //     const storedClassName = localStorage.getItem('lastScrolledElement')

    //     // 如果存在，则发送给service worker
    //     if (storedClassName) {
    //       chrome.runtime.sendMessage({
    //         type: 'SCROLLED_ELEMENT',
    //         targetClass: storedClassName,
    //       })
    //     }
    //   },
    // })
  } catch (error) {
    console.log('Error executing script:', error)
  }
})

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'SCROLLED_ELEMENT') {
    console.log('Received scrolled element with class:', message.targetClass)
    await chrome.storage.local.set({ targetElement: message.targetClass }) // 保存接收到的类名
  }
})
