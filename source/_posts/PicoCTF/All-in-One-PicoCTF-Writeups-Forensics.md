---
title: 'All-in-One PicoCTF Writeups: Forensics'
categories:
  - PicoCTF
cover: >-
  https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/upload_4810c93f4ec30864588fcab3bf179d5f.png
date: '2024-06-01T10:27:03+08:00'
mathjax: true
tags:
  - PicoCTF
  - 資安
abbrlink: 83db1007
---

# 前言

其實好像也沒什麼好講前言的，但就是不想要一開始就是題目分類，所以還是放了個前言 XD。

自己在刷 PicoCTF 的時候常常發現，幾乎所有的 writeup 都是英文的居多，所以想說來寫個完整一點的中文版！總之呢這裡就是會盡量彙整所有的 picoCTF 的題目在這邊（但是因為已經寫了 60 題左右才開始打算來寫 writeup，所以可能前面的部分會等其他都寫完再來補），如果有需要就可以直接來這邊看所有的 writeup，就這樣啦！希望能幫忙到你。

# MSB

看這個題目名稱，然後又出現在 Forensics，應該是跟隱寫術有關了。如果你還不知道 LSB 和 MSB 都是個啥，可以先去看看 [Cryptography Notes 密碼學任督二脈](https://blog.cx330.tw/Notebooks/Cryptography-Notebook-%E5%AF%86%E7%A2%BC%E5%AD%B8%E4%BB%BB%E7%9D%A3%E4%BA%8C%E8%84%88/)，裡面有解釋了甚麼是 LSB 和 MSB。

題目的題幹說，This image passes LSB statistical analysis。那相反的，它其實就是在暗示 flag 可能藏在 RGB 像素值的 MSB 中，所以就來提取它每個像素中的的 MSB 吧。這邊用到了 Python 中的 Pillow 這個庫，如果覺得太麻煩，也可以直接用這個現成的工具 [Stegsolve](https://github.com/zardus/ctf-tools/tree/master/stegsolve)。

Exploit 如下：

```python
from PIL import Image
import re


def extract_msb(image_path):
    image = Image.open(image_path)
    pixels = image.load()

    # 獲取圖片尺寸
    width, height = image.size

    # 初始化儲存提取自MSB的字串
    msb_data = ""

    # 提取每個像素的MSB
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            # AND運算只保留了r, g, b的最高位，後面清零，再右移7位
            msb_data += str((r & 0b10000000) >> 7)
            msb_data += str((g & 0b10000000) >> 7)
            msb_data += str((b & 0b10000000) >> 7)

    # 將提取的MSB每8個位元轉換成字元
    hidden_text = ""
    for i in range(0, len(msb_data), 8):
        byte = msb_data[i : i + 8]
        if len(byte) == 8:
            hidden_text += chr(int(byte, 2))

    return hidden_text


def find_pico_ctf(data):
    pattern = r"picoCTF\{.*?\}"
    matches = re.findall(pattern, data)

    if matches:
        for match in matches:
            print(f"Found: {match}")
    else:
        print("No matches found")


if __name__ == "__main__":
    image_path = (
        "MSB/Ninja-and-Prince-Genji-Ukiyoe-Utagawa-Kunisada.flag.png"  # 替換為你的路徑
    )
    hidden_message = extract_msb(image_path)
    find_pico_ctf(hidden_message)
```

```txt
picoCTF{15_y0ur_que57_qu1x071c_0r_h3r01c_ea7deb4c}
```

# Verify

先連接到題目給的主機。

![Connect to the host](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/24/8/image_1446d103ab2481cd2a91af64ed316881.png)

之後用 `ls`看一下有甚麼文件。

```bash
ctf-player@pico-chall$ ls
checksum.txt  decrypt.sh  files
```

其中題目有說 `decrypt.sh`是用來解密檔案的腳本，`checksum.txt`是紀錄了正確的 hash 值得文件，最後 files 是一個目錄，裡面有很多文件，但只有一個是可以用來被解密的正確腳本。所以我們要做的就是去比對每個文件的哈希值和 `checksum.txt`的值。我們利用下面這兩個命令，先 `cat`出正確的雜湊值，再去用 `sha256sum`去計算每個 `files`裡面的檔案的雜湊，最後比對。

```bash
ctf-player@pico-chall$ cat checksum.txt
5848768e56185707f76c1d74f34f4e03fb0573ecc1ca7b11238007226654bcda
ctf-player@pico-chall$ sha256sum files/* | grep 5848768e56185707f76c1d74f34f4e03fb0573ecc1ca7b11238007226654bcda
5848768e56185707f76c1d74f34f4e03fb0573ecc1ca7b11238007226654bcda  files/8eee7195
```

最後一行顯示正確的文件是 `8eee7195`，那就用 `./decrypt.sh`解密他。就得到 Flag 啦。

```txt
picoCTF{trust_but_verify_8eee7195}
```

# CanYouSee

這題的 Handout 解壓縮之後是一張圖片，我一開始嘗試了 steghide 去提取隱寫資訊，但是提取出來後的東西是下面這個。

```txt
The flag is not here maybe think in simpler terms. Data that explains data.
```

Data that explains data. 這就告訴我們要找他的 Metadata 啦。這邊使用下面這個命令。

```bash
exiftool ukn_reality.jpg
```

執行後的結果為：

```bash
ExifTool Version Number         : 12.76
File Name                       : ukn_reality.jpg
Directory                       : .
File Size                       : 2.3 MB
File Modification Date/Time     : 2024:03:11 20:05:53-04:00
File Access Date/Time           : 2024:09:01 13:25:54-04:00
File Inode Change Date/Time     : 2024:09:01 13:25:46-04:00
File Permissions                : -rw-r--r--
File Type                       : JPEG
File Type Extension             : jpg
MIME Type                       : image/jpeg
JFIF Version                    : 1.01
Resolution Unit                 : inches
X Resolution                    : 72
Y Resolution                    : 72
XMP Toolkit                     : Image::ExifTool 11.88
Attribution URL                 : cGljb0NURntNRTc0RDQ3QV9ISUREM05fYjMyMDQwYjh9Cg==
Image Width                     : 4308
Image Height                    : 2875
Encoding Process                : Baseline DCT, Huffman coding
Bits Per Sample                 : 8
Color Components                : 3
Y Cb Cr Sub Sampling            : YCbCr4:2:0 (2 2)
Image Size                      : 4308x2875
Megapixels                      : 12.4
```

Attribution URL 看起來很可疑，拿去 base64 解碼一下。

```bash
base64 -d <<< cGljb0NURntNRTc0RDQ3QV9ISUREM05fYjMyMDQwYjh9Cg==
```

果然，得到 Flag 啦。

```txt
picoCTF{ME74D47A_HIDD3N_b32040b8}
```

# Secret of the Polyglot

這題給了個 PDF 檔案，打開後發現了一半的 Flag。

![一半的 Flag](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240902021611952.png)

```txt
1n_pn9_&_pdf_1f991f77}
```

之後用`file flag2of2-final.pdf`這個命令檢查一下這個檔案。發現他其實是一個 PNG 檔案。所以我們用`mv flag2of2-final.pdf flag2of2-final.png`把檔名改掉後打開這張圖片。

![另一半的 Flag](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240902021848978.png)

```txt
picoCTF{f1u3n7_
```

最後把兩個組合起來就好了。

```txt
picoCTF{f1u3n7_1n_pn9_&_pdf_1f991f77}
```

# Scan Surprise

先用 SSH 連接到題目。

```bash
ssh -p 51523 ctf-player@atlas.picoctf.net
```

然後發現他給了一張 QR Code 的圖片叫做 Flag.png。但因為我手邊沒有手機，用`zbarimg`把其中的資訊提取出來。

```bash
zbarimg flag.png
```

他輸出的東西像這樣：

```bash
Connection Error (Failed to connect to socket /var/run/dbus/system_bus_socket: No such file or directory)
Connection Null
QR-Code:picoCTF{p33k_@_b00_b5ce2572}
scanned 1 barcode symbols from 1 images in 0 seconds
```

果然 Flag 就出來了！

```txt
picoCTF{p33k_@_b00_b5ce2572}
```
