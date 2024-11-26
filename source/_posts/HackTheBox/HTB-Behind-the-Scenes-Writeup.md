---
title: "[HTB] Behind the Scenes Writeup"
cover: >-
    https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/help-you-at-solving-hackthebox-htb-challenges-machines.png
categories:
    - - HackTheBox
    - - CTF
tags:
    - HTB
    - Reverse
    - HackTheBox
abbrlink: e18c2f54
date: 2024-09-09 19:45:08
---

# 0x00 Challenge Info

> After struggling to secure our secret strings for a long time, we finally figured out the solution to our problem: Make decompilation harder. It should now be impossible to figure out how our programs work!

# 0x01 Reconnaissance

First we can run the binary to see what's going on.

```bash
┌──(kali㉿kali)-[~/CTF/rev_behindthescenes]
└─$ ./behindthescenes
./challenge <password>
```

It tell us we should put some password as the argument to execute this. Next step, I check the printable strings in the binary by using `strings` or the strings tab in IDA.

![Strings](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240909195132019.png)

I found this is similar to the flag but we still don't know the %s. So we can find some string that looks like the flag and fill it in.

# 0x02 Exploit

Finally I found it in the Hex View tab in IDA.

![Hex View](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240909200529473.png)

Then we run the binary with `./behindthescenes Itz_0nLy_UD2`, it print out the flag!

# 0x03 Pwned

![Pwned](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240909200824219.png)

After I watch others writeups, I found that my solution may not be the official way, maybe it's an unintended solution. It's recommend to read the following writeup to learn more from this challenge.

[**HackTheBox Behind The Scenes 逆向题目分析**](https://blog.51cto.com/baimao/6186866)
