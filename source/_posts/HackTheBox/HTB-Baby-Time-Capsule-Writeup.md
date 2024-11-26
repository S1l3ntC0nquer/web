---
title: "[HTB] Baby Time Capsule Writeup \U0001F48A"
cover: >-
    https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/help-you-at-solving-hackthebox-htb-challenges-machines.png
categories:
    - - HackTheBox
    - - CTF
tags:
    - HTB
    - Crypto
    - HacktTheBox
abbrlink: 67b7db12
date: 2024-08-16 20:44:06
---

# 0x00 Challenge Info

> Qubit Enterprises is a new company touting it's propriety method of qubit stabilization. They expect to be able to build a quantum computer that can factor a RSA-1024 number in the next 10 years. As a promotion they are giving out "time capsules" which contain a message for the future encrypted by 1024 bit RSA. They might be great engineers, but they certainly aren't cryptographers, can you find a way to read the message without having to wait for their futuristic machine?

It told us that this is a RSA question, so let's see the code on the server side.

# 0x01 Reconnaissance

```python
from Crypto.Util.number import bytes_to_long, getPrime
import socketserver
import json

FLAG = b"HTB{--REDACTED--}"


class TimeCapsule:

    def __init__(self, msg):
        self.msg = msg
        self.bit_size = 1024
        self.e = 5

    def _get_new_pubkey(self):
        while True:
            p = getPrime(self.bit_size // 2)
            q = getPrime(self.bit_size // 2)
            n = p * q
            phi = (p - 1) * (q - 1)
            try:
                pow(self.e, -1, phi)
                break
            except ValueError:
                pass

        return n, self.e

    def get_new_time_capsule(self):
        n, e = self._get_new_pubkey()
        m = bytes_to_long(self.msg)
        m = pow(m, e, n)

        return {"time_capsule": f"{m:X}", "pubkey": [f"{n:X}", f"{e:X}"]}


def challenge(req):
    time_capsule = TimeCapsule(FLAG)
    while True:
        try:
            req.sendall(
                b"Welcome to Qubit Enterprises. Would you like your own time capsule? (Y/n) "
            )
            msg = req.recv(4096).decode().strip().upper()
            if msg == "Y" or msg == "YES":
                capsule = time_capsule.get_new_time_capsule()
                req.sendall(json.dumps(capsule).encode() + b"\n")
            elif msg == "N" or msg == "NO":
                req.sendall(b"Thank you, take care\n")
                break
            else:
                req.sendall(b"I'm sorry I don't understand\n")
        except:
            # Socket closed, bail
            return


class MyTCPRequestHandler(socketserver.BaseRequestHandler):

    def handle(self):
        req = self.request
        challenge(req)


class ThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    pass


def main():
    socketserver.TCPServer.allow_reuse_address = True
    server = ThreadingTCPServer(("0.0.0.0", 1337), MyTCPRequestHandler)
    server.serve_forever()


if __name__ == "__main__":
    main()
```

The most important part of this code is the `__init__()` function, cause it defined the public key exponent e to be always 5. And the server lets the users to get the different key pairs multiple times, so we can infer the plaintext by the [Chinese Remainder Theorem](https://blog.cx330.tw/posts/72a59deb/).

In RSA, we know that $c = m^e \bmod n$, which $c$ is ciphertext, $m$ is message and $e$ is the public exponent.

We can also write the equation above to be the following.

$\begin{aligned} &x = m^e\\ &c=x\bmod n\end{aligned}$

Here the $x$ and $c$ are congruence modulo when module $n$.

$\begin{aligned}&x\equiv c_1\bmod n_1\\&x\equiv c_2\bmod n_2\\&x\equiv c_3\bmod n_3 \end{aligned}$

Now we can use CRT (Chinese Remainder Theorem) to find $x$. Once we found $x$, we can easily calculate the 5th root of it, since 5 isn't a large number. That way, we can know the $m$.

# 0x02 Exploit

So here's the exploit.

```python
from gmpy2 import iroot
from sympy.ntheory.modular import crt
from Crypto.Util.number import long_to_bytes

# Here are the given ciphertexts and public keys
c1 = 0x2B9562DA73EA4B61F4A34C9B73A4F51AA20E31311E07F16CF8975B9AF095C3168EFFF0DC17FCA34BC0510AC2A5A0D4FF40428F70A384FED8DD0FC317E3CF86BE08FFB7A607E18ACBC0B4A1E20CCA4D506427C28480931D86AE897A38FB4B1A2EAAD68E2D031FFE0C86328AFD5381B1A3DF53286675D51D954AF4B95B32439F4A
c2 = 0x49DB31D4844E30C86AA1EB3F76EA489BEEA27A833C6A3093FB9E8F39AEF789BF09A0E377CCF10C26A42422A3B1895F91F054C16009EADCE22FB4660AF02582C70F6E5612CB7ACE7E586CED4696767B03D0F412F95E23630CC67A83619A32BD2E25314E1089EAC49D291A3293DECDF125EAC54C247ED71D3C43F78E6430E52E3D
c3 = 0x54EDE9F2D3825E314EB4980457EF319142663D2B85CD14C959BEE706C14F9BC1158A204FF523B11F52DC828EC747E96697E76643A167E18BD335068EDC9A15EF5F92D61C3FA4506625FC5C37189F271321BA2B39D57F6359E9DE29C609F7F4DE4531E8CE39F028F1A603DC3AB78A70C58338E9EA3DA8EEF1EFFAD8CACCAF0C04

n1 = 0x58469A7931E268B0BC57AA95D2BE6FC288CBA4520909EC9964EAFE1F30CAA63D1FE4DDEFFA74CF9107CD8DFD6B09DC479062AA4B492AB0240EDB292E0C17EE21E4FBF621E783F90190AB7EBB97F5760C7DC3A113A9676828C1B210A72601D23AA3D1CDD236A65607B32BA7E5C797FE245300D6D9C37C209258FDEDF4E8EE92E5
n2 = 0x6FE5A8ABC6D747E31223E1F33C8308FD4CF9FCC12E8559F451DF7BC5B82D4872ED966DDA40C4E4484C5D0ED4B50518B4CCDF05ED167617C501797058689851FC25C77BAADE43ACF480C37CAE027BE600E8DCBEEAF13FCB6875989EB843A62432F94765D8041071A8D409F71C3968098A6FACD2BF8DF23E9733CDA50FBEF619BB
n3 = 0xC379270FF14CA4D3953AD46E80D4AC3F2094C95EF68DF6E44B0D1FBCAE5AEFB22E6CF447454528F18DBA5D79BCD8E8025FE5931B296683E09D465C0CC0852ACFE712F450D46B4CD683E0B0A099E73133C384CC0B2E527AE2E7D9E50CDAE0AA41784B1222DECE283BE7C537D16D9773F88CE246025CD1BA134A1E5C5C254B10F9

# Here x is m to the power of e, where e is 5
x = crt([n1, n2, n3], [c1, c2, c3])[0]
# Get the 5th root of x, which is m
m = iroot(x, 5)[0]

print(long_to_bytes(m))
```

# 0x03 Pwned

```txt
HTB{t3h_FuTUr3_15_bR1ghT_1_H0p3_y0uR3_W34r1nG_5h4d35!}
```
