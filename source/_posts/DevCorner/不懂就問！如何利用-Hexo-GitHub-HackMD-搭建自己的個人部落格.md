---
title: 不懂就問！如何利用 Hexo + GitHub + HackMD 搭建自己的個人部落格
mathjax: true
cover: https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/HexoTutorial.jpg
categories: DevCorner
tags:
    - Blog
    - 網頁開發
abbrlink: 81070fa0
date: 2024-06-30 02:39:53
---

# 前言

從正在打這些字的今天開始算的話，距離網站架設起來的時間也有一個月了。

這段時間一直沒有好好的紀錄一下架站的過程，正好我身邊有一些朋友也想開始架自己的部落格，所以順便就來做個教學吧！

如同文章的標題，這次主要使用的就是 Hexo、GitHub、HackMD，那事不宜遲，我們就開始吧！

# Hexo 部署

在開始前，我們先來介紹一下 Hexo 是甚麼吧！Hexo 是一個很快速也很輕量的靜態網頁框架（大部分用來架設 Blog），它可以讓使用者利用 Markdown 寫作，Hexo 會自己幫你生成靜態文件。

總之就是個很方便的框架，**一天內一定可以讓你的網站順利上線**！（加上一些環境問題還有其他的依賴問題，最少一個禮拜內也一定可以完成的）

## 安裝 Hexo

在安裝前，有一些依賴環境需要先安裝，請先確保你的電腦上已經安裝了：

-   [Git](https://git-scm.com/)
-   [Node.js](https://nodejs.org/en)（官方推薦 Node.js 10.0 及其以上的版本）

如果還沒安裝過，請先去安裝（網路上找有很多教學了，就先跳過）。確保有以上的軟體後，就可以安裝啦！Hexo 的安裝真的真的超級簡單（Mac 使用者可能會有環境問題，請看 [官方說明文件](https://hexo.io/zh-tw/docs/)）。首先，請打開你的終端機（cmd、Powershell 等），並且輸入以下的命令：

```cmd
npm install hexo-cli -g
```

安裝完成後，輸入`hexo -v`查看版本號，有正確顯示的話就說明安裝成功啦！

![hexo -v](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240630164342694.png)

## 建立你的 Hexo 資料

安裝好 Hexo 的 CLI 工具後，就可以開始建立 Hexo 的資料夾了。**注意，這個檔案夾就是你以後寫文章、放文章照片等等的地方了**。首先，先移動到你想要放置這個檔案的路徑底下，並在這個路徑中打開終端，輸入以下的命令。

```cmd
hexo init <資料夾名稱>
```

![hexo init](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240630165449041.png)

接下來，要進入這個資料夾中，安裝這個專案所需要的依賴包。請依序的輸入以下的命令：

```cmd
cd <資料夾名稱>
npm install
```

![image](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240630165915129.png)

這樣就完成了初步的建立啦！建立完成後，專案資料夾下的檔案會像是以下這樣：

```bash
.
├── _config.yml
├── package.json
├── scaffolds
├── source
|   ├── _drafts
|   └── _posts
└── themes
```

這些檔案都有其各自的用途，分別是：

**\_config.yml**

-   網站的配置檔案，可以設定如 URL、預設語言、站點名稱等。大部分的設置都會在這裡。

**package.json**

-   存放專案中所有需要用到的模組。

**scaffolds**

-   [鷹架](https://hexo.io/zh-tw/docs/writing.html#%E9%B7%B9%E6%9E%B6%EF%BC%88Scaffold%EF%BC%89) 的資料夾，裡面會放一些鷹架的架構。

**source**

-   這裡就是存放所有網頁內容的資料夾，包含文章、圖片等。以後寫文章也基本都是在這層目錄工作。

**themes**

-   主題的資料夾。

到了這邊，你已經大致架完了 Hexo 的環境，那接下來看看怎麼部署到 GitHub 吧。

## Hexo 指令

之後寫文章一定會用到的，就是 Hexo 的指令了。我會簡單介紹幾個，想要了解更詳細請見 [官方文件](https://hexo.io/zh-tw/docs/commands)。

### 創建新文章

以下的角括號請替換為你自己的文章標題。

```cmd
hexo new "<文章標題>"
```

這個指令會生成一份**markdown**文件到`_post`資料夾中。

### 本地預覽

```cmd
hexo server
```

或是也可以簡寫為

```cmd
hexo s
```

這個指令會在 localhost 上面啟動伺服器，讓你先預覽網站。

### 部署

```cmd
hexo deploy
```

也可以簡寫為

```cmd
hexo d
```

它會自動把你的**source**資料夾中的內容生成為靜態檔案，並且部署到你所設定的 GitHub Repo。（後面會詳細介紹實作方式）

### 刪除靜態檔案

```cmd
hexo clean
```

這個指令會幫你把你使用`hexo generate`或是`hexo deploy`所產生的靜態檔案刪除。

# 連結 GitHub Repo

## 創建 Repo

首先，你要先建立一個 GitHub Repo，用來存放網站的靜態資料。同時，這個 GitHub Repo 也會成為到時候部署的地方（當然你也可以用其他的靜態網站託管服務，但這是免費的！）。

建立 Repo 的時候，請遵循以下幾個要點：

1. Repo 名稱設定為**USERNAME.github\.io**，**USERNAME**記得改為你自己的使用者名稱。
2. Repo 請設定為**公開**

完成後，我們就來把這個 Repo（以下簡稱為 GitHub Repo）連結到你的 Hexo 專案吧！開始前你需要先安裝一個部署的外掛。

```cmd
npm install hexo-deployer-git --save
```

打開你的 Hexo 專案中的`_config.yml`，並加入以下的設定：

```yaml
deploy:
    type: git
    repo: <你的 Repo URL> # https://bitbucket.org/JohnSmith/johnsmith.bitbucket.io
    branch: main
```

## 建立 GitHub Pages

進到你的 GitHub Repo 中，點選 Settings。

![GitHub Repo Settings](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240630173247120.png)

在側邊點選 Pages。

![GitHub Pages](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240630173423864.png)

把`Branch`切換到`Main`，並且按下`Save`。

![Set branch to main](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240630173802148.png)

完成後，等待個大約一到兩分鐘，上面就會顯示出你的網站部署好的 URL 啦！

![Finish!](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240630173922108.png)

因為我有購買域名，所以可以設定 Custom Domain。如果你也有購買域名，並且想設置它作為你的部落格 URL，請見 [GitHub Pages 自訂域名與 HTTPS 設定（GoDaddy + Cloudflare）](https://clairechang.tw/2023/06/28/web/github-pages-with-custom-domain/)。

## 修改 Hexo 配置文件

創建好 Repo 後，你需要打開 Hexo 專案資料夾裡面的的`_config.yml`文件（**注意，這邊是指 Hexo 配置文件，並不是主題配置文件**），新增以下內容。（詳見 [官方文檔](https://hexo.io/zh-tw/docs/one-command-deployment)）

```yaml
deploy:
    type: git
    repo: 你的專案連結 #舉例：https://bitbucket.org/JohnSmith/johnsmith.bitbucket.io
    branch: [branch] # 通常為main
```

修改完後，還需要去安裝一個套件。這個套件可以幫助你自動部署你使用`hexo d`時產生的靜態文件到你設定的 Repo。安裝方式如下：

1. 打開你的 Hexo 專案資料夾（有`package.json`的那個資料夾）。
2. 在這層目錄中打開終端。
3. 輸入`npm install hexo-deployer-git --save`。
4. 大功告成。

如果你有使用 Vscode 的 GitHub 擴充套件儲存過使用者 token，就可以直接用`hexo d`部署你的文章啦！如果沒有的話也沒關係，只需要在`hexo d`的時候提供使用者名稱和密碼就行了。

到這邊，你就已經大致完成啦！接下來只要找個喜歡的 [Hexo 主題](https://hexo.io/themes/)、[設定配置文件](https://hexo.io/zh-tw/docs/configuration)，就可以開始寫作囉！（這邊可以去看看官方文件，選個自己喜歡的主題，並照著文檔配置就行了）

## 部署到網站上

GitHub Pages 有個很方便的功能，就是當你每次有新的 Commit 的時候，它都會自動幫你更新你的網頁的內容。所以以後更新文章後，只需要使用`hexo deploy`把更新的內容提交到 GitHub 倉庫，它就會自動幫你更新網頁啦！

# 開始寫作啦！

我自己目前的寫作方式，是使用 [HackMD](https://hackmd.io/) 來寫作的，因為它有許多優點。

1. **免費的圖床**
    - 不只免費，操作也只要複製圖片並貼上，就能自動生成圖片 URL，讓寫作更輕鬆。
2. **迅速且輕便**
    - 以網頁為主的 HackMD，讓你只需要一個瀏覽器就可以快速打開筆記，並開始寫作。
3. **對 Markdown 語法的支援**
    - 支援 MathJax、Mermaid 等 Markdown 擴充語法，讓寫作可以更靈活。

至於我寫作的方式，步驟如下：

-   用`hexo new <文章標題>`先建立一篇文章在 Post 資料夾。（目的是可以生成文章創建的時間，以及文章的 [Front Matter](https://hexo.io/zh-tw/docs/front-matter)）
-   複製貼上（包含 Front Matter）到 HackMD 編輯。
-   編輯完後，再複製回原本的檔案。
-   用`hexo deploy`部署。

這樣就完成了一次的寫作啦！畢竟寫文章一定會多多少少有圖片，使用 HackMD 就可以不用擔心圖片問題，可以很方便也很迅速地完成寫作歐！

# 後記

我覺得用這套方法**便宜**、**方便**、**快速**，不僅可以提升你寫作的意願，也可以讓你在一開始比較有成就感，增強你寫作的動力！真的是很不錯的方式～

我自己建立部落格所需要的花費就只有

-   $1468 買了兩年的域名
-   ~~花了很多的時間踩坑~~（但是不是 Hexo 的問題，是我的主題依賴的問題）
-   ~~年輕的肝~~

總之，就是非常喜歡自己現在的成果啦！也希望你們可以搭建成功，同時也可以加入寫作的行列歐！

如果這篇文章對你有幫助，歡迎 [訂閱我的部落格](https://blog.cx330.tw/subscribe)，同時也非常歡迎大家在底下留言或按表情和我互動，如果我有哪裡說錯，也歡迎討論！
