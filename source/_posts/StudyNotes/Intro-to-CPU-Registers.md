---
title: Intro to CPU Registers
cover: >-
  https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/CPU_Registers.jpg
categories: StudyNotes
tags:
  - Registers
  - Pwn
abbrlink: 1d65dc6
date: 2024-07-30 13:53:37
copyright_author: HTB Academy
copyright_author_href: "https://academy.hackthebox.com/"
copyright_info: This article is a repost or translation of the original work. All rights belong to the original author.
copyright_url: "https://academy.hackthebox.com/course/preview/stack-based-buffer-overflows-on-linux-x86"
---

# Discalimer ⚠️

The resources for this article are from [Stack-Based Buffer Overflows on Linux x86](https://academy.hackthebox.com/course/preview/stack-based-buffer-overflows-on-linux-x86), and this article is intended only for personal review. It is advisable to consult the original resource for more detailed information. 

# CPU Registers

Registers are the essential parts of CPU. Almost every register have a small amout of storage space to store   data temporarily. These registers can be classified as General registers, Control registers, Segment registers. The one we care the most is General registers. In these, they can be subdevided into Data registers, Pointer registers, and Index registers.

## Data registers

| 32-bit Register | 64-bit Register | Description                                                  |
| :-------------- | :-------------- | :----------------------------------------------------------- |
| `EAX`           | `RAX`           | Accumulator is used in Input/Output and for arithmetic operations |
| `EBX`           | `RBX`           | Base is used in indexed addressing                           |
| `ECX`           | `RCX`           | Counter is used to rotate instructions & count loops         |
| `EDX`           | `RDX`           | Data is used for Input/Output and in arithmetic operations for multiply and divide operations involving large values |



## Pointer registers

| 32-bit Register | 64-bit Register | Description                                                  |
| :-------------- | :-------------- | :----------------------------------------------------------- |
| `EIP`           | `RIP`           | Instruction Pointer (IP) stores the offset address of the next instruction to be executed |
| `ESP`           | `RSP`           | Stack Pointer (SP) points to the top of the stack            |
| `EBP`           | `RBP`           | Base Pointer (BP) points to the base of the stack            |

## Index registers

| 32-bit Register | 64-bit Register | Description                                                  |
| :-------------- | :-------------- | :----------------------------------------------------------- |
| `ESI`           | `RSI`           | Source Index is used as a pointer from a source for string operations |
| `EDI`           | `RDI`           | Destination is used as a pointer to a destination for string operations |

# Stack Frames

Since the stack starts with a high address and grows down to low memory addresses as values are added, the `Base Pointer` points to the beginning (base) of the stack, while the `Stack Pointer` points to the top of the stack.

As the stack grows, it is logically divided into regions called `Stack Frames`, which allocate the required memory in the stack for the corresponding function. A stack frame defines a frame of data with the beginning (`EBP`) and the end (`ESP`) that is pushed onto the stack when a function is called.

Since the stack memory is built on a `Last-In-First-Out` (`LIFO`) data structure, the first step is to store the previous `EBP` position on the stack, which can be restored after the function completes. If we now look at the `bowfunc` function, it looks like following in GDB:

```bash
(gdb) disas bowfunc 

Dump of assembler code for function bowfunc:
   0x0000054d <+0>:	    push   ebp       # <---- 1. Stores previous EBP
   0x0000054e <+1>:	    mov    ebp,esp
   0x00000550 <+3>:	    push   ebx
   0x00000551 <+4>:	    sub    esp,0x404
   <...SNIP...>
   0x00000580 <+51>:	leave  
   0x00000581 <+52>:	ret    
```

The `EBP` in the stack frame is set first when a function is called and contains the `EBP` of the previous stack frame. Next, the value of the `ESP` is copied to the `EBP`, creating a new stack frame.

```bash
(gdb) disas bowfunc 

Dump of assembler code for function bowfunc:
   0x0000054d <+0>:	    push   ebp       # <---- 1. Stores previous EBP
   0x0000054e <+1>:	    mov    ebp,esp   # <---- 2. Creates new Stack Frame
   0x00000550 <+3>:	    push   ebx
   0x00000551 <+4>:	    sub    esp,0x404 
   <...SNIP...>
   0x00000580 <+51>:	leave  
   0x00000581 <+52>:	ret 
```

Then some space is created in the stack, moving the `ESP` to the top for the operations and variables needed and processed.

## Function Prologue

```bash
(gdb) disas bowfunc 

Dump of assembler code for function bowfunc:
   0x0000054d <+0>:	    push   ebp       # <---- 1. Stores previous EBP
   0x0000054e <+1>:	    mov    ebp,esp   # <---- 2. Creates new Stack Frame
   0x00000550 <+3>:	    push   ebx
   0x00000551 <+4>:	    sub    esp,0x404 # <---- 3. Moves ESP to the top
   <...SNIP...>
   0x00000580 <+51>:	leave  
   0x00000581 <+52>:	ret    
```

These three instructions represent the so-called `Prologue`.

For getting out of the stack frame, the opposite is done, the `Epilogue`. During the epilogue, the `ESP` is replaced by the current `EBP`, and its value is reset to the value it had before in the prologue. The epilogue is relatively short, and apart from other possibilities to perform it, in our example, it is performed with two instructions:

## Function Epilogue

```bash
(gdb) disas bowfunc 

Dump of assembler code for function bowfunc:
   0x0000054d <+0>:	    push   ebp       
   0x0000054e <+1>:	    mov    ebp,esp   
   0x00000550 <+3>:	    push   ebx
   0x00000551 <+4>:	    sub    esp,0x404 
   <...SNIP...>
   0x00000580 <+51>:	leave  # <----------------------
   0x00000581 <+52>:	ret    # <--- Leave stack frame
```

# Endianness

During load and save operations in registers and memories, the bytes are read in a different order. This byte order is called `endianness`. Endianness is distinguished between the `little-endian` format and the `big-endian` format.

`Big-endian` and `little-endian` are about the order of valence. In `big-endian`, the digits with the highest valence are initially. In `little-endian`, the digits with the lowest valence are at the beginning. Mainframe processors use the `big-endian` format, some RISC architectures, minicomputers, and in TCP/IP networks, the byte order is also in `big-endian` format.

Now, let us look at an example with the following values:

- Address: `0xffff0000`
- Word: `\xAA\xBB\xCC\xDD`

| Memory Address | 0xffff0000 | 0xffff0001 | 0xffff0002 | 0xffff0003 |
| :------------- | :--------- | :--------- | :--------- | :--------- |
| Big-Endian     | AA         | BB         | CC         | DD         |
| Little-Endian  | DD         | CC         | BB         | AA         |

This is very important for us to enter our code in the right order later when we have to tell the CPU to which address it should point.

