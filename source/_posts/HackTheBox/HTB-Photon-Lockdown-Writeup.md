---
title: "[HTB] Photon Lockdown Writeup \U0001F6AB"
cover: >-
    https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/help-you-at-solving-hackthebox-htb-challenges-machines.png
categories:
    - - HackTheBox
    - - CTF
tags:
    - HTB
    - Hardware
    - HackTheBox
abbrlink: a42f8edc
date: 2024-09-09 10:49:21
---

# 0x00 Challenge Info

> We've located the adversary's location and must now secure access to their Optical Network Terminal to disable their internet connection. Fortunately, we've obtained a copy of the device's firmware, which is suspected to contain hardcoded credentials. Can you extract the password from it?

# 0x01 Reconnaissance

It gave us a zip file. So we first unzip it with the password `hackthebox`. Then we can see a directory called `ONT` which stands for Optical Network Terminal. The interesting file in it is the `rootfs` file.

If you want to know more about [Root file system](https://www.ibm.com/docs/hu/aix/7.2?topic=tree-root-file-system), you can click the link to go to the IBM explaining page. But here, I will focus on how to get the flag. First, I want to know more about the `rootfs` file here, so I use file command to help me.

```bash
┌──(kali㉿kali)-[~/CTF/ONT]
└─$ file rootfs
rootfs: Squashfs filesystem, little endian, version 4.0, zlib compressed, 10936182 bytes, 910 inodes, blocksize: 131072 bytes, created: Sun Oct  1 07:02:43 2023
```

It tells us that it is a SquashFS filesystem, which is a compressed read-only filesystem that usually used in embedded system. To decompress it, we can use the following command.

```bash
unsquashfs rootfs
```

Then we can get a `squashfs-root` directory! After jumping into the directory, we can see the structure is just like any linux root directory.

# 0x02 Exploit

Getting the flag in the whole system is very difficult if we check the file one by one. And since we know that the flag start with "HTB", we can simply use this command.

```bash
grep -r HTB .
```

Voila! Then we see the flag!

# 0x03 Pwned

![Pwned](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240909111043641.png)
