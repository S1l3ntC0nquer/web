---
title: 'All-in-One PicoCTF Writeups: Misc (General Skills)'
categories:
  - PicoCTF
cover: >-
  https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/upload_4810c93f4ec30864588fcab3bf179d5f.png
date: '2024-06-01T10:27:03+08:00'
mathjax: true
tags:
  - PicoCTF
  - 資安
abbrlink: 4376026b
---

# 前言

其實好像也沒什麼好講前言的，但就是不想要一開始就是題目分類，所以還是放了個前言 XD。

自己在刷 PicoCTF 的時候常常發現，幾乎所有的 writeup 都是英文的居多，所以想說來寫個完整一點的中文版！總之呢這裡就是會盡量彙整所有的 picoCTF 的題目在這邊（但是因為已經寫了 60 題左右才開始打算來寫 writeup，所以可能前面的部分會等其他都寫完再來補），如果有需要就可以直接來這邊看所有的 writeup，就這樣啦！希望能幫忙到你。

# binhexa

這題比較簡單，就是一些基礎的 Binary operations 和最後把 bin 轉為 hexadecimal 就行了，它主要有六題的邏輯運算和一題 bin to hexadecimal。我是直接使用 picoCTF 提供的 Webshell 進行 nc 連接，然後用 [這個線上工具](https://www.rapidtables.com/calc/math/binary-calculator.html) 運算。題目如下。

```txt
Binary Number 1: 00101010
Binary Number 2: 00101011

Question 1/6:
Operation 1: '&'
Perform the operation on Binary Number 1&2.
Enter the binary result: 00101010
Correct!

Question 2/6:
Operation 2: '*'
Perform the operation on Binary Number 1&2.
Enter the binary result: 11100001110
Correct!

Question 3/6:
Operation 3: '<<'
Perform a left shift of Binary Number 1 by 1 bits.
Enter the binary result: 1010100
Correct!

Question 4/6:
Operation 4: '+'
Perform the operation on Binary Number 1&2.
Enter the binary result: 1010101
Correct!

Question 5/6:
Operation 5: '|'
Perform the operation on Binary Number 1&2.
Enter the binary result: 00101011
Correct!

Question 6/6:
Operation 6: '>>'
Perform a right shift of Binary Number 2 by 1 bits.
Enter the binary result: 10101
Correct!

Enter the results of the last operation in hexadecimal: 15

Correct answer!
The flag is: picoCTF{b1tw^3se_0p3eR@tI0n_su33essFuL_d6f8047e}
```

這樣就得到 flag 啦！Easy peasy。

# endianness

這題 nc 到題目後會教你輸入某個字串的小端序和大端序，如下。這邊題目要求是 Hex 形式，並且字元中間不要有空格。

![題目](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240819171802197.png)

這邊我用 [CyberChef](https://gchq.github.io/CyberChef/) 就可以把這個字串轉為 Hex，轉換完後就是大端序的形式了，最後只要手動轉換為小端序，並且發送給 server 就可以了。

```txt
picoCTF{3ndi4n_sw4p_su33ess_02999450}
```

# Binary Search

這題好像沒有甚麼好講的，就是 Binary Search。其實就有點像是小時候玩的終極密碼啦笑死，就這樣。

```txt
picoCTF{g00d_gu355_3af33d18}
```

# Blame Game

這題給了個 zip，解壓後我們把整個專案目錄丟進 VSCode 看看。

![Handout](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240906034638052.png)

就一個檔案，但是是不能運行的。這邊題目要求我們找出是誰在搞鬼，因為我有裝 VSCode 的插件，所以直接點旁邊的 git，再點選 Contributors 就出來了。

![Pwned](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240906034831808.png)

```txt
picoCTF{@sk_th3_1nt3rn_2c6bf174}
```

# Commitment Issues

這題和上一題差不多，也是打開丟 VSCode 就出來了。

![Pwned](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240906035110911.png)

```txt
picoCTF{s@n1t1z3_ea83ff2a}
```

# Time Machine

這題更簡單，打開後直接看 Commit 紀錄就找到了。

![Pwned](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240906132115701.png)

```txt
picoCTF{t1m3m@ch1n3_8defe16a}
```

# Collaborative Development

這題就是去各個不同的 Branch 裡面看`flag.py`，把三個拼湊在一起就可以了。

```txt
picoCTF{t3@mw0rk_m@k3s_th3_dr3@m_w0rk_2c91ca76}
```

# Based

有三關，分別是 bin to ascii、oct to ascii、hex to ascii。如下。推薦用 CyberChef 的 magic recipe。

```txt
┌──(kali㉿kali)-[~]
└─$ nc jupiter.challenges.picoctf.org 29956.
Let us see how data is stored
chair
Please give the 01100011 01101000 01100001 01101001 01110010 as a word.
...
you have 45 seconds.....

Input:
chair
Please give me the  163 165 142 155 141 162 151 156 145 as a word.
Input:
submarine
Please give me the 737472656574 as a word.
Input:
street
You've beaten the challenge
Flag: picoCTF{learning_about_converting_values_b375bb16}
```

```txt
picoCTF{learning_about_converting_values_b375bb16}
```

# plumbing

這題使用`nc jupiter.challenges.picoctf.org 4427`連接到題目主機後會發現它不斷的輸出很多字串，像這樣。

![題目](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240906143752460.png)

推測 Flag 應該就藏於其中，然後題目叫做 plumbing，可以聯想到要用 pipe，所以用這行命令就可以了。

```bash
nc jupiter.challenges.picoctf.org 4427 | grep picoCTF
```

```txt
picoCTF{digital_plumb3r_5ea1fbd7}
```
