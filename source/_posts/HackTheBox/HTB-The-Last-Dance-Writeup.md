---
title: "[HTB] The Last Dance Writeup 💃"
cover: >-
    https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/help-you-at-solving-hackthebox-htb-challenges-machines.png
categories:
    - [HackTheBox]
    - [CTF]
tags:
    - HTB
    - Crypto
    - HackTheBox
abbrlink: acba6120
date: 2024-07-16 01:30:34
---

# 0x00 Challenge Info

Hello hackers. Let's see the encrypted message.

```txt
c4a66edfe80227b4fa24d431
7aa34395a258f5893e3db1822139b8c1f04cfab9d757b9b9cca57e1df33d093f07c7f06e06bb6293676f9060a838ea138b6bc9f20b08afeb73120506e2ce7b9b9dcd9e4a421584cfaba2481132dfbdf4216e98e3facec9ba199ca3a97641e9ca9782868d0222a1d7c0d3119b867edaf2e72e2a6f7d344df39a14edc39cb6f960944ddac2aaef324827c36cba67dcb76b22119b43881a3f1262752990
7d8273ceb459e4d4386df4e32e1aecc1aa7aaafda50cb982f6c62623cf6b29693d86b15457aa76ac7e2eef6cf814ae3a8d39c7
```

And also, the description of this challenge is as follows.

> To be accepted into the upper class of the Berford Empire, you had to attend the annual Cha-Cha Ball at the High Court. Little did you know that among the many aristocrats invited, you would find a burned enemy spy. Your goal quickly became to capture him, which you succeeded in doing after putting something in his drink. Many hours passed in your agency's interrogation room, and you eventually learned important information about the enemy agency's secret communications. Can you use what you learned to decrypt the rest of the messages?

According to this, we can probably know that it's a ChaCha20 encryption. To know more about it, we can analyze the source code given by the challenge.

# 0x01 Reconnaissance

So here's the code.

```python
from Crypto.Cipher import ChaCha20
from secret import FLAG
import os


def encryptMessage(message, key, nonce):
    cipher = ChaCha20.new(key=key, nonce=iv)
    ciphertext = cipher.encrypt(message)
    return ciphertext


def writeData(data):
    with open("out.txt", "w") as f:
        f.write(data)


if __name__ == "__main__":
    message = b"Our counter agencies have intercepted your messages and a lot "
    message += b"of your agent's identities have been exposed. In a matter of "
    message += b"days all of them will be captured"

    key, iv = os.urandom(32), os.urandom(12)

    encrypted_message = encryptMessage(message, key, iv)
    encrypted_flag = encryptMessage(FLAG, key, iv)

    data = iv.hex() + "\n" + encrypted_message.hex() + "\n" + encrypted_flag.hex()
    writeData(data)
```

Bingo, it's a ChaCha20 encryption. [ChaCha20](https://en.wikipedia.org/wiki/ChaCha20-Poly1305) is a stream cipher algorithm designed by Daniel J. Bernstein in 2008. It's a variant of Salsa20 and often used in encrypted communication such as TLS & VPN. The main concept of it is the XOR operation. Since it's a type of XOR cipher, it has the following properties.

$$
\begin{align*}
Key = Ciphertext \oplus Plaintext \\
Ciphertext = Plaintext \oplus Key \\
Plaintext = Ciphertext \oplus Key
\end{align*}
$$

In this challenge, it **reuses** the key and the initial vector (iv), and it also tells us the message, which is the first plaintext, so we can calculate the key by doing XOR to the 1st cipher and the 1st plaintext (check the code and you'll know why). And as long as we got the key, we can calculate the 2nd plaintext with the same key. So, let's hack the planet!

# 0x02 Exploit

To calculate the XOR value of two bytes, I use the function `xor` provided by `pwntools`. And below is my exploit. **You can try it by yourself before checking out the script.**

```python
from pwn import xor
from Crypto.Util.number import long_to_bytes, bytes_to_long

message = b"Our counter agencies have intercepted your messages and a lot "
message += b"of your agent's identities have been exposed. In a matter of "
message += b"days all of them will be captured"

cipher_1 = 0x7AA34395A258F5893E3DB1822139B8C1F04CFAB9D757B9B9CCA57E1DF33D093F07C7F06E06BB6293676F9060A838EA138B6BC9F20B08AFEB73120506E2CE7B9B9DCD9E4A421584CFABA2481132DFBDF4216E98E3FACEC9BA199CA3A97641E9CA9782868D0222A1D7C0D3119B867EDAF2E72E2A6F7D344DF39A14EDC39CB6F960944DDAC2AAEF324827C36CBA67DCB76B22119B43881A3F1262752990
cipher_1 = long_to_bytes(cipher_1)
cipher_2 = 0x7D8273CEB459E4D4386DF4E32E1AECC1AA7AAAFDA50CB982F6C62623CF6B29693D86B15457AA76AC7E2EEF6CF814AE3A8D39C7
cipher_2 = long_to_bytes(cipher_2)

key = xor(cipher_1, message)
plaintext = xor(cipher_2, key)

print(plaintext)
```

# 0x03 Pwned

```txt
HTB{und3r57AnD1n9_57R3aM_C1PH3R5_15_51mPl3_a5_7Ha7}
```
