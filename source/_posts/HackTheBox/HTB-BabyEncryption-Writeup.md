---
title: "[HTB] BabyEncryption Writeup"
cover: >-
    https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/help-you-at-solving-hackthebox-htb-challenges-machines.png
categories:
    - - HackTheBox
    - - CTF
tags:
    - HTB
    - Crypto
    - HackTheBox
abbrlink: 3df19469
date: 2024-08-11 17:41:48
---

# 0x00 Challenge Info

> You are after an organised crime group which is responsible for the illegal weapon market in your country. As a secret agent, you have infiltrated the group enough to be included in meetings with clients. During the last negotiation, you found one of the confidential messages for the customer. It contains crucial information about the delivery. Do you think you can decrypt it?

This is the description of the challenge, let's see the encrypting script and try to decrypt it!

# 0x01 Reconnaissance

The following is the encrypting script given by the challenge.

```python
import string
from secret import MSG


def encryption(msg):
    ct = []
    for char in msg:
        ct.append((123 * char + 18) % 256)
    return bytes(ct)


ct = encryption(MSG)
f = open("./msg.enc", "w")
f.write(ct.hex())
f.close()
```

We can see the program do the following things.

1. Get the ascii value of each char.
2. Times it with 123.
3. Plus it with 18.
4. Mod 256 to make sure the final value is between 0 to 255.
5. Add this value to ct.

To know more details of ASCII, we can see this table below.

![ASCII Table from GeeksforGeeks](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/ASCII-Table.png)

Since the possible character for the flag on the ASCII table is from 33 to 126, we can brute force it to know the flag.

# 0x02 Exploit

Now we can write the exploit to brute force it.

```python
CT = "6e0a9372ec49a3f6930ed8723f9df6f6720ed8d89dc4937222ec7214d89d1e0e352ce0aa6ec82bf622227bb70e7fb7352249b7d893c493d8539dec8fb7935d490e7f9d22ec89b7a322ec8fd80e7f8921"
CT = bytes.fromhex(CT)


def decrypt(cipher_text: bytes) -> str:
    plaintext = ""
    for char in cipher_text:
        # Since the possible char on ascii table is from 33 to 126
        for i in range(33, 126):
            if (123 * i + 18) % 256 == char:
                plaintext += chr(i)
    return plaintext


print(decrypt(CT))
```

# 0x03 Pwned

By running the exploit, we can get the flag easily.

```txt
HTB{l00k_47_y0u_r3v3rs1ng_3qu4710n5_c0ngr475}
```
