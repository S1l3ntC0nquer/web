/**
 * @see https://kmar.top/posts/b70ec88f/
 */

module.exports.config = {
  /**
   * 與 ServiceWorker 有關的配置項
   * 若想禁止插件自動生成 sw，此項填 false 即可
   * @type ?Object|boolean
   */
  serviceWorker: {
    escape: 0,
    cacheName: "AnZhiYuThemeCache",
    debug: false,
  },
  register: {
    onsuccess: undefined,
    onerror: undefined,
    builder: (root, hexoConfig, pluginConfig) => {
      const { onerror, onsuccess } = pluginConfig.register;
      return `<script>
                    (() => {
                        const sw = navigator.serviceWorker
                        const error = ${onerror && onerror.toString()}
                        if (!sw?.register('${new URL(root).pathname}sw.js')
                            ${onsuccess ? "?.then(" + onsuccess + ")" : ""}
                            ?.catch(error)
                            ) error()
                    })()
                </script>`;
    },
  },
  dom: {
    onsuccess: () => {
      caches.match('https://id.v3/').then(function(response) {
        if (response) {
          // 如果找到了匹配的緩存響應
          response.json().then(function(data) {
            anzhiyuPopupManager && anzhiyuPopupManager.enqueuePopup('通知📢', `已刷新緩存，更新爲${data.global + "." + data.local}版本最新內容`, null, 5000);
          });
        } else {
          console.info('未找到匹配的緩存響應');
        }
      }).catch(function(error) {
        console.error('緩存匹配出錯:', error);
      });
    },
  },
  json: {
    maxHtml: 15,
    charLimit: 1024,
    merge: ['page', 'archives', 'categories', 'tags'],
    exclude: {
      localhost: [],
      other: [],
    },
  },
  external: {
    timeout: 5000,
    js: [],
    stable: [
      /^https:\/\/npm\.elemecdn\.com\/[^/@]+\@[^/@]+\/[^/]+\/[^/]+$/,
      /^https:\/\/cdn\.cbd\.int\/[^/@]+\@[^/@]+\/[^/]+\/[^/]+$/,
      /^https:\/\/cdn\.jsdelivr\.net\/npm\/[^/@]+\@[^/@]+\/[^/]+\/[^/]+$/,
    ],
    replacer: srcUrl => {
      if (srcUrl.startsWith('https://npm.elemecdn.com')) {
        const url = new URL(srcUrl)
        return [
            srcUrl,
            `https://cdn.cbd.int` + url.pathname,
            `https://cdn.jsdelivr.net/npm` + url.pathname,
            `https://cdn1.tianli0.top/npm` + url.pathname,
            `https://fastly.jsdelivr.net/npm` + url.pathname
        ]
      } else {
        return srcUrl
      }
    },
  }
};

/**
 * 緩存列表
 * @param clean 清理全站時是否刪除其緩存
 * @param match {function(URL)} 匹配規則
 */
module.exports.cacheRules = {
  simple: {
    clean: true,
    search: false,
    match: (url, $eject) => {
      const allowedHost = $eject.domain;
      const allowedPaths = ["/404.html", "/css/index.css"];
      return url.host === allowedHost && allowedPaths.includes(url.pathname);
    },
  },
  cdn: {
    clean: true,
    match: url =>
      [
        "cdn.cbd.int",
        "lf26-cdn-tos.bytecdntp.com",
        "lf6-cdn-tos.bytecdntp.com",
        "lf3-cdn-tos.bytecdntp.com",
        "lf9-cdn-tos.bytecdntp.com",
        "cdn.staticfile.org",
        "npm.elemecdn.com",
      ].includes(url.host) && url.pathname.match(/\.(js|css|woff2|woff|ttf|cur)$/),
  },
};

/**
 * 獲取一個 URL 對應的備用 URL 列表，訪問順序按列表順序，所有 URL 訪問時參數一致
 * @param srcUrl {string} 原始 URL
 * @return {{list: string[], timeout: number}} 返回 null 或不返回表示對該 URL 不啓用該功能。timeout 爲超時時間（ms），list 爲 URL 列表，列表不包含原始 URL 表示去除原始訪問
 */
module.exports.getSpareUrls = srcUrl => {
  if (srcUrl.startsWith("https://npm.elemecdn.com")) {
    return {
      timeout: 3000,
      list: [srcUrl, `https://cdn.cbd.int/${new URL(srcUrl).pathname}`],
    };
  }
};

/**
 * 獲取要插入到 sw 中的變量或常量
 * @param hexo hexo 對象
 * @param rules 合併後的 sw-rules 對象
 * @return {Object} 要插入的鍵值對
 */
module.exports.ejectValues = (hexo, rules) => {
  return {
    domain: {
      prefix: "const",
      value: new URL(hexo.config.url).host,
    },
  };
};
