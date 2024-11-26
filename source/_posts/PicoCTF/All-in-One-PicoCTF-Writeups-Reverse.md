---
title: 'All-in-One PicoCTF Writeups: Reverse'
categories:
  - PicoCTF
cover: >-
  https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/upload_4810c93f4ec30864588fcab3bf179d5f.png
date: '2024-06-01T10:27:03+08:00'
mathjax: true
tags:
  - PicoCTF
  - 資安
abbrlink: '461e0005'
---

# 前言

其實好像也沒什麼好講前言的，但就是不想要一開始就是題目分類，所以還是放了個前言 XD。

自己在刷 PicoCTF 的時候常常發現，幾乎所有的 writeup 都是英文的居多，所以想說來寫個完整一點的中文版！總之呢這裡就是會盡量彙整所有的 picoCTF 的題目在這邊（但是因為已經寫了 60 題左右才開始打算來寫 writeup，所以可能前面的部分會等其他都寫完再來補），如果有需要就可以直接來這邊看所有的 writeup，就這樣啦！希望能幫忙到你。

# Reverse

檔案下載下來後用 IDA 打開然後 TAB 看一下 Decompile 後的 Pseudo code，就出來了。

```txt
picoCTF{3lf_r3v3r5ing_succe55ful_fa9cb3b1}
```

# Safe Opener

這題給了一個 Java 的原始碼，要我們幫他解出保險箱的密碼，並把它用 picoCTF{}包起來就是 Flag 了，先來看看 code。

```java
import java.io.*;
import java.util.*;
public class SafeOpener {
    public static void main(String args[]) throws IOException {
        BufferedReader keyboard = new BufferedReader(new InputStreamReader(System.in));
        Base64.Encoder encoder = Base64.getEncoder();
        String encodedkey = "";
        String key = "";
        int i = 0;
        boolean isOpen;


        while (i < 3) {
            System.out.print("Enter password for the safe: ");
            key = keyboard.readLine();

            encodedkey = encoder.encodeToString(key.getBytes());
            System.out.println(encodedkey);

            isOpen = openSafe(encodedkey);
            if (!isOpen) {
                System.out.println("You have  " + (2 - i) + " attempt(s) left");
                i++;
                continue;
            }
            break;
        }
    }

    public static boolean openSafe(String password) {
        String encodedkey = "cGwzYXMzX2wzdF9tM18xbnQwX3RoM19zYWYz";

        if (password.equals(encodedkey)) {
            System.out.println("Sesame open");
            return true;
        }
        else {
            System.out.println("Password is incorrect\n");
            return false;
        }
    }
}
```

我們可以看到在第 31 行的地方有一串是被編碼過的 key，然後在第 6 行的地方創建了一個 Base64 encoder 的實例。這邊救世會把使用者輸入的 key 編碼後和第 31 行的東西比對，所以只要把`cGwzYXMzX2wzdF9tM18xbnQwX3RoM19zYWYz`拿去解碼就可以了。

```bash
base64 -d <<< cGwzYXMzX2wzdF9tM18xbnQwX3RoM19zYWYz
```

```txt
picoCTF{pl3as3_l3t_m3_1nt0_th3_saf3}
```

# GDB Test Drive

這題的話先用 `wget` 把題目這個二進制檔案抓下來。

![Wget](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240701212911463.png)

然後後面的步驟基本上就照著題目給的指令一步一步來就可以了。

![Instructions](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240701213346170.png)

這邊來稍微解釋一下每個指令的意義，他到底是做了哪些事情呢？

-   `chmod +x gdbme`
    -   修改 gdbme 檔案的權限，新增執行權限（x）
-   `gdb gdbme`
    -   使用 gdb（GNU Debugger）打開 gdbme 這個可執行檔案。
-   `layout asm`
    -   啟用組合語言（Assembly, ASM）視圖
-   `break *(main+99)`
    -   在 main 函數開始偏移 99 的位元組的地方設置斷點（Breakpoint）。
-   `jump *(main+104)`
    -   跳到 main 函數開始偏移 104 位元組的地方繼續執行。

至於這邊為甚麼要在 main+99 的地方設定斷點，是因為這裡他調用了一個函式叫做 `sleep`，所以當我們直接執行 gdbme 的時候會進入到**sleep**的狀態，讓我們以為這個程式沒有做任何事。

![Sleep function](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/H1IxfrlvA.png)

所以在這邊我們才要把斷點設在 main+99，讓他執行到這邊的時候暫停一下，然後我們直接使用 jump 叫到下面一個地方，也就是 main+104 繼續執行。

![Flag](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240701213211218.png)

這樣就得到 flag 啦。

```txt
picoCTF{d3bugg3r_dr1v3_72bd8355}
```

# Transformation

這題給了一個文字檔案叫做 enc，以及一段 Python 程式碼告訴你他的加密邏輯。如下。

```python
''.join([chr((ord(flag[i]) << 8) + ord(flag[i + 1])) for i in range(0, len(flag), 2)])
```

然後 enc 長這樣。

```txt
灩捯䍔䙻ㄶ形楴獟楮獴㌴摟潦弸彥㜰㍢㐸㙽
```

看起來像亂碼，不過那是因為 Python 把它兩個字元的 ASCII 合併成 16 個 Bytes，再轉回字元，所以看起來亂糟糟。那解碼就是要把 16 個 Bytes 分別拆回去兩個 8 個 Bytes 的字元。

```python
def decode(encoded_string):
    decoded_flag = []
    for char in encoded_string:
        # 取得 Unicode 字符的 16 位整數值
        value = ord(char)
        # 提取高 8 位和低 8 位
        high_byte = value >> 8       # 取高 8 位
        low_byte = value & 0xFF      # 取低 8 位
        # 將其轉換回原來的兩個字符
        decoded_flag.append(chr(high_byte))
        decoded_flag.append(chr(low_byte))
    return ''.join(decoded_flag)

# 測試範例
encoded_string = "灩捯䍔䙻ㄶ形楴獟楮獴㌴摟潦弸彥㜰㍢㐸㙽"
decoded_flag = decode(encoded_string)
print(decoded_flag)
```

這樣就出來啦！

```txt
picoCTF{16_bits_inst34d_of_8_e703b486}
```

# vault-door-training

這題就是把 Java 檔下載下來就解出來了。他的原始碼如下。

```java
import java.util.*;

class VaultDoorTraining {
    public static void main(String args[]) {
        VaultDoorTraining vaultDoor = new VaultDoorTraining();
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter vault password: ");
        String userInput = scanner.next();
	String input = userInput.substring("picoCTF{".length(),userInput.length()-1);
	if (vaultDoor.checkPassword(input)) {
	    System.out.println("Access granted.");
	} else {
	    System.out.println("Access denied!");
	}
   }

    // The password is below. Is it safe to put the password in the source code?
    // What if somebody stole our source code? Then they would know what our
    // password is. Hmm... I will think of some ways to improve the security
    // on the other doors.
    //
    // -Minion #9567
    public boolean checkPassword(String password) {
        return password.equals("w4rm1ng_Up_w1tH_jAv4_3808d338b46");
    }
}
```

在倒數第三行那個東西就是 Flag 了，自己把它加上 Flag 的格式就可以。這題主要是在提醒說不要把密碼等重要資訊放在原始碼裡面。

```txt
picoCTF{w4rm1ng_Up_w1tH_jAv4_3808d338b46}
```

# Picker I

這題是直接給了一個 Python 的原代碼，甚至不是執行檔。直接打開來看看。

```python
import sys


def getRandomNumber():
    print(4)  # Chosen by fair die roll.
    # Guaranteed to be random.
    # (See XKCD)


def exit():
    sys.exit(0)


def esoteric1():
    esoteric = """
  int query_apm_bios(void)
{
	struct biosregs ireg, oreg;

	/* APM BIOS installation check */
	initregs(&ireg);
	ireg.ah = 0x53;
	intcall(0x15, &ireg, &oreg);

	if (oreg.flags & X86_EFLAGS_CF)
		return -1;		/* No APM BIOS */

	if (oreg.bx != 0x504d)		/* "PM" signature */
		return -1;

	if (!(oreg.cx & 0x02))		/* 32 bits supported? */
		return -1;

	/* Disconnect first, just in case */
	ireg.al = 0x04;
	intcall(0x15, &ireg, NULL);

	/* 32-bit connect */
	ireg.al = 0x03;
	intcall(0x15, &ireg, &oreg);

	boot_params.apm_bios_info.cseg        = oreg.ax;
	boot_params.apm_bios_info.offset      = oreg.ebx;
	boot_params.apm_bios_info.cseg_16     = oreg.cx;
	boot_params.apm_bios_info.dseg        = oreg.dx;
	boot_params.apm_bios_info.cseg_len    = oreg.si;
	boot_params.apm_bios_info.cseg_16_len = oreg.hsi;
	boot_params.apm_bios_info.dseg_len    = oreg.di;

	if (oreg.flags & X86_EFLAGS_CF)
		return -1;

	/* Redo the installation check as the 32-bit connect;
	   some BIOSes return different flags this way... */

	ireg.al = 0x00;
	intcall(0x15, &ireg, &oreg);

	if ((oreg.eflags & X86_EFLAGS_CF) || oreg.bx != 0x504d) {
		/* Failure with 32-bit connect, try to disconnect and ignore */
		ireg.al = 0x04;
		intcall(0x15, &ireg, NULL);
		return -1;
	}

	boot_params.apm_bios_info.version = oreg.ax;
	boot_params.apm_bios_info.flags   = oreg.cx;
	return 0;
}
  """
    print(esoteric)


def win():
    # This line will not work locally unless you create your own 'flag.txt' in
    #   the same directory as this script
    flag = open("flag.txt", "r").read()
    # flag = flag[:-1]
    flag = flag.strip()
    str_flag = ""
    for c in flag:
        str_flag += str(hex(ord(c))) + " "
    print(str_flag)


def esoteric2():
    esoteric = """
#include "boot.h"

#define MAX_8042_LOOPS	100000
#define MAX_8042_FF	32

static int empty_8042(void)
{
	u8 status;
	int loops = MAX_8042_LOOPS;
	int ffs   = MAX_8042_FF;

	while (loops--) {
		io_delay();

		status = inb(0x64);
		if (status == 0xff) {
			/* FF is a plausible, but very unlikely status */
			if (!--ffs)
				return -1; /* Assume no KBC present */
		}
		if (status & 1) {
			/* Read and discard input data */
			io_delay();
			(void)inb(0x60);
		} else if (!(status & 2)) {
			/* Buffers empty, finished! */
			return 0;
		}
	}

	return -1;
}

/* Returns nonzero if the A20 line is enabled.  The memory address
   used as a test is the int $0x80 vector, which should be safe. */

#define A20_TEST_ADDR	(4*0x80)
#define A20_TEST_SHORT  32
#define A20_TEST_LONG	2097152	/* 2^21 */

static int a20_test(int loops)
{
	int ok = 0;
	int saved, ctr;

	set_fs(0x0000);
	set_gs(0xffff);

	saved = ctr = rdfs32(A20_TEST_ADDR);

	while (loops--) {
		wrfs32(++ctr, A20_TEST_ADDR);
		io_delay();	/* Serialize and make delay constant */
		ok = rdgs32(A20_TEST_ADDR+0x10) ^ ctr;
		if (ok)
			break;
	}

	wrfs32(saved, A20_TEST_ADDR);
	return ok;
}

/* Quick test to see if A20 is already enabled */
static int a20_test_short(void)
{
	return a20_test(A20_TEST_SHORT);
}
  """
    print(esoteric)


while True:
    try:
        print('Try entering "getRandomNumber" without the double quotes...')
        user_input = input("==> ")
        eval(user_input + "()")
    except Exception as e:
        print(e)
        break
```

這裡我最感興趣的部份是在最後的 while 循環裡面會直接使用`eval(user_input + "()")`去調用函數，所以可以直接連接到題目後輸入 win 去觸發`win()`函數，就會輸出 hex 的 flag，再拿去 CyberChef 轉回字串就可以囉。

![Pwned](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240910160443473.png)

```txt
picoCTF{4_d14m0nd_1n_7h3_r0ugh_b523b2a1}
```

# Picker II

這題的代碼長這樣。

```python
import sys


def getRandomNumber():
    print(4)  # Chosen by fair die roll.
    # Guaranteed to be random.
    # (See XKCD)


def exit():
    sys.exit(0)


def esoteric1():
    esoteric = """
  int query_apm_bios(void)
{
	struct biosregs ireg, oreg;

	/* APM BIOS installation check */
	initregs(&ireg);
	ireg.ah = 0x53;
	intcall(0x15, &ireg, &oreg);

	if (oreg.flags & X86_EFLAGS_CF)
		return -1;		/* No APM BIOS */

	if (oreg.bx != 0x504d)		/* "PM" signature */
		return -1;

	if (!(oreg.cx & 0x02))		/* 32 bits supported? */
		return -1;

	/* Disconnect first, just in case */
	ireg.al = 0x04;
	intcall(0x15, &ireg, NULL);

	/* 32-bit connect */
	ireg.al = 0x03;
	intcall(0x15, &ireg, &oreg);

	boot_params.apm_bios_info.cseg        = oreg.ax;
	boot_params.apm_bios_info.offset      = oreg.ebx;
	boot_params.apm_bios_info.cseg_16     = oreg.cx;
	boot_params.apm_bios_info.dseg        = oreg.dx;
	boot_params.apm_bios_info.cseg_len    = oreg.si;
	boot_params.apm_bios_info.cseg_16_len = oreg.hsi;
	boot_params.apm_bios_info.dseg_len    = oreg.di;

	if (oreg.flags & X86_EFLAGS_CF)
		return -1;

	/* Redo the installation check as the 32-bit connect;
	   some BIOSes return different flags this way... */

	ireg.al = 0x00;
	intcall(0x15, &ireg, &oreg);

	if ((oreg.eflags & X86_EFLAGS_CF) || oreg.bx != 0x504d) {
		/* Failure with 32-bit connect, try to disconnect and ignore */
		ireg.al = 0x04;
		intcall(0x15, &ireg, NULL);
		return -1;
	}

	boot_params.apm_bios_info.version = oreg.ax;
	boot_params.apm_bios_info.flags   = oreg.cx;
	return 0;
}
  """
    print(esoteric)


def win():
    # This line will not work locally unless you create your own 'flag.txt' in
    #   the same directory as this script
    flag = open("flag.txt", "r").read()
    # flag = flag[:-1]
    flag = flag.strip()
    str_flag = ""
    for c in flag:
        str_flag += str(hex(ord(c))) + " "
    print(str_flag)


def esoteric2():
    esoteric = """
#include "boot.h"

#define MAX_8042_LOOPS	100000
#define MAX_8042_FF	32

static int empty_8042(void)
{
	u8 status;
	int loops = MAX_8042_LOOPS;
	int ffs   = MAX_8042_FF;

	while (loops--) {
		io_delay();

		status = inb(0x64);
		if (status == 0xff) {
			/* FF is a plausible, but very unlikely status */
			if (!--ffs)
				return -1; /* Assume no KBC present */
		}
		if (status & 1) {
			/* Read and discard input data */
			io_delay();
			(void)inb(0x60);
		} else if (!(status & 2)) {
			/* Buffers empty, finished! */
			return 0;
		}
	}

	return -1;
}

/* Returns nonzero if the A20 line is enabled.  The memory address
   used as a test is the int $0x80 vector, which should be safe. */

#define A20_TEST_ADDR	(4*0x80)
#define A20_TEST_SHORT  32
#define A20_TEST_LONG	2097152	/* 2^21 */

static int a20_test(int loops)
{
	int ok = 0;
	int saved, ctr;

	set_fs(0x0000);
	set_gs(0xffff);

	saved = ctr = rdfs32(A20_TEST_ADDR);

	while (loops--) {
		wrfs32(++ctr, A20_TEST_ADDR);
		io_delay();	/* Serialize and make delay constant */
		ok = rdgs32(A20_TEST_ADDR+0x10) ^ ctr;
		if (ok)
			break;
	}

	wrfs32(saved, A20_TEST_ADDR);
	return ok;
}

/* Quick test to see if A20 is already enabled */
static int a20_test_short(void)
{
	return a20_test(A20_TEST_SHORT);
}
  """
    print(esoteric)


def filter(user_input):
    if "win" in user_input:
        return False
    return True


while True:
    try:
        user_input = input("==> ")
        if filter(user_input):
            eval(user_input + "()")
        else:
            print("Illegal input")
    except Exception as e:
        print(e)
        break
```

其實和上面那題很類似，但是多了一個`filter()`函數去檢查輸入不能有 win，但是我們可以直接使用

```python
print(open("flag.txt", "r").read())
```

雖然後面會多出一個`()`，但是不會影響前面的`print()`函數執行。所以還是可以得到 Flag。

```txt
picoCTF{f1l73r5_f41l_c0d3_r3f4c70r_m1gh7_5ucc33d_b924e8e5}
```

# Picker III

這題一樣先來看一下代碼。

```python
import re


USER_ALIVE = True
FUNC_TABLE_SIZE = 4
FUNC_TABLE_ENTRY_SIZE = 32
CORRUPT_MESSAGE = "Table corrupted. Try entering 'reset' to fix it"

func_table = ""


def reset_table():
    global func_table

    # This table is formatted for easier viewing, but it is really one line
    func_table = """\
print_table                     \
read_variable                   \
write_variable                  \
getRandomNumber                 \
"""


def check_table():
    global func_table

    if len(func_table) != FUNC_TABLE_ENTRY_SIZE * FUNC_TABLE_SIZE:
        return False

    return True


def get_func(n):
    global func_table

    # Check table for viability
    if not check_table():
        print(CORRUPT_MESSAGE)
        return

    # Get function name from table
    func_name = ""
    func_name_offset = n * FUNC_TABLE_ENTRY_SIZE
    for i in range(func_name_offset, func_name_offset + FUNC_TABLE_ENTRY_SIZE):
        if func_table[i] == " ":
            func_name = func_table[func_name_offset:i]
            break

    if func_name == "":
        func_name = func_table[
            func_name_offset : func_name_offset + FUNC_TABLE_ENTRY_SIZE
        ]

    return func_name


def print_table():
    # Check table for viability
    if not check_table():
        print(CORRUPT_MESSAGE)
        return

    for i in range(0, FUNC_TABLE_SIZE):
        j = i + 1
        print(str(j) + ": " + get_func(i))


def filter_var_name(var_name):
    r = re.search("^[a-zA-Z_][a-zA-Z_0-9]*$", var_name)
    if r:
        return True
    else:
        return False


def read_variable():
    var_name = input("Please enter variable name to read: ")
    if filter_var_name(var_name):
        eval("print(" + var_name + ")")
    else:
        print("Illegal variable name")


def filter_value(value):
    if ";" in value or "(" in value or ")" in value:
        return False
    else:
        return True


def write_variable():
    var_name = input("Please enter variable name to write: ")
    if filter_var_name(var_name):
        value = input("Please enter new value of variable: ")
        if filter_value(value):
            exec("global " + var_name + "; " + var_name + " = " + value)
        else:
            print("Illegal value")
    else:
        print("Illegal variable name")


def call_func(n):
    """
    Calls the nth function in the function table.
    Arguments:
      n: The function to call. The first function is 0.
    """

    # Check table for viability
    if not check_table():
        print(CORRUPT_MESSAGE)
        return

    # Check n
    if n < 0:
        print("n cannot be less than 0. Aborting...")
        return
    elif n >= FUNC_TABLE_SIZE:
        print(
            "n cannot be greater than or equal to the function table size of "
            + FUNC_TABLE_SIZE
        )
        return

    # Get function name from table
    func_name = get_func(n)

    # Run the function
    eval(func_name + "()")


def dummy_func1():
    print("in dummy_func1")


def dummy_func2():
    print("in dummy_func2")


def dummy_func3():
    print("in dummy_func3")


def dummy_func4():
    print("in dummy_func4")


def getRandomNumber():
    print(4)  # Chosen by fair die roll.
    # Guaranteed to be random.
    # (See XKCD)


def win():
    # This line will not work locally unless you create your own 'flag.txt' in
    #   the same directory as this script
    flag = open("flag.txt", "r").read()
    # flag = flag[:-1]
    flag = flag.strip()
    str_flag = ""
    for c in flag:
        str_flag += str(hex(ord(c))) + " "
    print(str_flag)


def help_text():
    print(
        """
This program fixes vulnerabilities in its predecessor by limiting what
functions can be called to a table of predefined functions. This still puts
the user in charge, but prevents them from calling undesirable subroutines.

* Enter 'quit' to quit the program.
* Enter 'help' for this text.
* Enter 'reset' to reset the table.
* Enter '1' to execute the first function in the table.
* Enter '2' to execute the second function in the table.
* Enter '3' to execute the third function in the table.
* Enter '4' to execute the fourth function in the table.

Here's the current table:
  """
    )
    print_table()


reset_table()

while USER_ALIVE:
    choice = input("==> ")
    if choice == "quit" or choice == "exit" or choice == "q":
        USER_ALIVE = False
    elif choice == "help" or choice == "?":
        help_text()
    elif choice == "reset":
        reset_table()
    elif choice == "1":
        call_func(0)
    elif choice == "2":
        call_func(1)
    elif choice == "3":
        call_func(2)
    elif choice == "4":
        call_func(3)
    else:
        print('Did not understand "' + choice + '" Have you tried "help"?')
```

這裡有趣的地方在於它的`write_variable`可以讓我們去把函式的名稱給替換掉，所以我們這邊使用 table 上的 3 去呼叫`write_variable`，並且把`print_table`覆寫為`win`，然後再執行 1，就可以得到 Flag 了。

```txt
┌──(kali㉿kali)-[~/CTF]
└─$  nc saturn.picoctf.net 55745
==> 3
Please enter variable name to write: print_table
Please enter new value of variable: win
==> 1
0x70 0x69 0x63 0x6f 0x43 0x54 0x46 0x7b 0x37 0x68 0x31 0x35 0x5f 0x31 0x35 0x5f 0x77 0x68 0x34 0x37 0x5f 0x77 0x33 0x5f 0x67 0x33 0x37 0x5f 0x77 0x31 0x37 0x68 0x5f 0x75 0x35 0x33 0x72 0x35 0x5f 0x31 0x6e 0x5f 0x63 0x68 0x34 0x72 0x67 0x33 0x5f 0x63 0x32 0x30 0x66 0x35 0x32 0x32 0x32 0x7d
==>
```

然後一樣再拿去轉回 printable 就可以了。

```txt
picoCTF{7h15_15_wh47_w3_g37_w17h_u53r5_1n_ch4rg3_c20f5222}
```

# Classic Crackme 0x100

把 binary 丟進 IDA 看一下。以下是反編譯後的代碼。

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  char input[51]; // [rsp+0h] [rbp-A0h] BYREF
  char output[51]; // [rsp+40h] [rbp-60h] BYREF
  int random2; // [rsp+7Ch] [rbp-24h]
  int random1; // [rsp+80h] [rbp-20h]
  char fix; // [rsp+87h] [rbp-19h]
  int secret3; // [rsp+88h] [rbp-18h]
  int secret2; // [rsp+8Ch] [rbp-14h]
  int secret1; // [rsp+90h] [rbp-10h]
  int len; // [rsp+94h] [rbp-Ch]
  int i_0; // [rsp+98h] [rbp-8h]
  int i; // [rsp+9Ch] [rbp-4h]

  strcpy(output, "apijaczhzgtfnyjgrdvqrjbmcurcmjczsvbwgdelvxxxjkyigy");
  setvbuf(_bss_start, 0LL, 2, 0LL);
  printf("Enter the secret password: ");
  __isoc99_scanf("%50s", input);
  i = 0;
  len = strlen(output);
  secret1 = 85;
  secret2 = 51;
  secret3 = 15;
  fix = 97;
  while ( i <= 2 )
  {
    for ( i_0 = 0; i_0 < len; ++i_0 )
    {
      random1 = (secret1 & (i_0 % 255)) + (secret1 & ((i_0 % 255) >> 1));
      random2 = (random1 & secret2) + (secret2 & (random1 >> 2));
      input[i_0] = ((random2 & secret3) + input[i_0] - fix + (secret3 & (random2 >> 4))) % 26 + fix;
    }
    ++i;
  }
  if ( !memcmp(input, output, len) )
    printf("SUCCESS! Here is your flag: %s\n", "picoCTF{sample_flag}");
  else
    puts("FAILED!");
  return 0;
}
```

總之他就是把使用者的輸入做了一堆複雜的運算後，去比較和 15 行的那串字串是否一致，若一致就吐 Flag。所以我們要逆推回去，找到輸入甚麼才可以在做了一堆運算後等於那串字串。這邊我請 ChatGPT 寫了一個腳本，果然可行。

```python
def decrypt(encrypted_str):
    secret1 = 85
    secret2 = 51
    secret3 = 15
    fix = 97
    output = list(encrypted_str)
    len_str = len(output)

    # 需要反轉加密過程
    for _ in range(3):  # 解密過程也重複三次
        for i in range(len_str):
            random1 = (secret1 & (i % 255)) + (secret1 & ((i % 255) >> 1))
            random2 = (random1 & secret2) + (secret2 & (random1 >> 2))
            output[i] = chr(
                (
                    (
                        ord(output[i])
                        - fix
                        - (random2 & secret3)
                        - (secret3 & (random2 >> 4))
                    )
                    % 26
                )
                + fix
            )

    return "".join(output)


# 固定輸出字符串
output = "apijaczhzgtfnyjgrdvqrjbmcurcmjczsvbwgdelvxxxjkyigy"

# 解密測試
decrypted_input = decrypt(output)
print(f"解密結果: {decrypted_input}")
```

這樣跑出來後，他說我們要輸入的東西是：

```txt
amfdxwtywanwhpauoxphlasawliqdxqkppvnauvzpoolaymtap
```

接著就連到題目 Server，輸入這串，果然就得到 Flag 了。

```txt
picoCTF{s0lv3_angry_symb0ls_e1ad09b7}
```

# packer

載下來後先用 `checksec` 發現他有加殼，要先脫殼。

![Checksec](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240930121126261.png)

這邊是 UPX 殼，要脫殼的話只要用以下指令就可以了。

```bash
upx -d <FileName>
```

這邊我脫好殼後再檢查一次，就沒有出現 Packer 了。

![Checksec](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240930121307082.png)

接著，用 strings 去看看有沒有跟 Flag 有關的東西。（當然，這一步也可以用像是 IDA、Ghidra 等反組譯器去分析）

![strings out | grep flag](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240930121451955.png)

知道了 Flag 是 7069636f4354467b5539585f556e5034636b314e365f42316e34526933535f31613561336633397d 後，直接拿去賽博廚師就出來了。

![Pwned](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240930121616805.png)

```txt
picoCTF{U9X_UnP4ck1N6_B1n4Ri3S_1a5a3f39}
```

# Shop

這題我甚至沒什麼逆向，盲猜打出來了XD。他就是 nc 連到題目後會是一個 shop，然後可以買東西，其中一個物品是 Flag，但初始的錢只有 40 元。打法就是購買商品，購買數量填寫負數，所以你就會越買錢越多，等錢超過 100 元就可以買 Flag，然後它會吐出 ASCII 值，再轉回來就是 Flag 了。

![Pwned](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20241104102410078.png)

```txt
picoCTF{b4d_brogrammer_b8d7271f}
```

後來用 IDA 開來看了下，發現問題出在這裡。

```c
inv.array[v11].count = count - v9;
if ( (unsigned int)*v10 >= inv.len )
	runtime_panicindex();
v14 = *v10;
v15 = wallet - *_num * inv.array[v14].price;
if ( (unsigned int)*v10 >= user.len )
	runtime_panicindex();
user.array[v14].count += *_num;
if ( inv.len <= 2u )
	runtime_panicindex();
if ( inv.array[2].count != 1 )
	main_get_flag();      
```

這邊第 5 行的 `_num` 是一個 `int` 指針，所以它可以為負值，這邊沒有做檢查就直接計算了，所以可以買負的數量的商品。

# Bbbbloat

這題用 IDA 打開後會發現 main 函數中有這段。

```c
printf("What's my favorite number? ");
v5 = 863305;
__isoc99_scanf("%d", &v4);
v5 = 863305;
if ( v4 == 549255 )                         // 549255 is the favorite number
{
    v5 = 863305;
    s = (char *)sub_1249(0LL, v7);
    fputs(s, stdout);
    putchar(10);
    free(s);
}
else
{
    puts("Sorry, that's not it!");
}
return 0LL;
```

所以我們只要在執行的時候輸入 549255 他就輸出 Flag 了。

```txt
picoCTF{cu7_7h3_bl047_695036e3}
```

