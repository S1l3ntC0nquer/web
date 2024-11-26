---
title: Intro to Chinese Remainder Theorem
cover: "https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/CRT.jpg"
abbrlink: 72a59deb
date: 2024-08-13 16:39:01
categories: StudyNotes
tags:
    - CRT
    - Math
---

# Prologue

Chinese Remainder Theorem (CRT) is also known as Sun zi's Theorem. It first appear on the Chinese book called **Sūnzǐ Suànjīng**, literally The Mathematical Classic of Master Sun/Master Sun's Mathematical Manual. Here's the math question in that book.

> 今有物不知其數，三三數之餘二，五五數之餘三，七七數之餘二，問物幾何？
>
> There is something, but we do not know its exact quantity. When divided by 3, the remainder is 2; when divided by 5, the remainder is 3; when divided by 7, the remainder is 2. What is the quantity?

To solve this, we need to know what the CRT is.

# Statement

Suppose $n_1,n_2,…,n_k$ are positive integers which are pairwise coprime (i.e., the greatest common devisor of each pair is 1). For any given integers $a_1,a_2,…,a_k$, there exists an integer $x$ that satisfies the following system of congruences:

$\begin{aligned} & x \equiv a_1\left(\bmod n_1\right) \\ & x \equiv a_2\left(\bmod n_2\right) \\ & \vdots \\ & x \equiv a_k\left(\bmod n_k\right)\end{aligned}$

Moreover, the solution of $x$ is unique modulo $N$, where

$N=n_1\cdot n_2 \cdot\ldots\cdot n_k$

# How it works

1. **Find $N$:** Compute the product $N=n_1\cdot n_2 \cdot\ldots\cdot n_k$.
2. **Compute Partial Products:** For each $i$, compute $N_i=\frac{N}{n_i}$.
3. **Find Modular Inverse:** For each $i$, find the modular inverse $M_i$ of $N_i$ modulo $n_i$. That is, find $M_i$ such that $N_i \cdot M_i \equiv 1\pmod n_i$.
4. **Construct the solution:** The solution $x$ can be constructed as:
   $x=\sum_{i=1}^k a_i \cdot N_i \cdot M_i\pmod N$

# Example

Suppose we want to solve the following system of congruences:

$\begin{aligned} x\equiv 2\left(\bmod 3\right) \\ x \equiv 3\left(\bmod 5\right) \\  x \equiv 2\left(\bmod 7\right) \end{aligned}$

1. Compute $N=3\cdot5\cdot7=105$.

2. Compute $N_1=\frac{105}{3}=35,\quad N_2=\frac{105}{5}=21,\quad N_3=\frac{105}{7}=15$.

3. Find modular inverses:
   
   $35 \cdot M_1 \equiv 1(\bmod 3),\quad 21 \cdot M_2 \equiv 1(\bmod 5),\quad 15 \cdot M_3 \equiv 1(\bmod 7)$. 
   
   Solving these, we get $M_1=2,\quad M_2=1,\quad M_3=1$
   
1. Construct the solution:

    $\begin{aligned} & x=[(2 \cdot 35 \cdot 2)+(3 \cdot 21 \cdot 1)+(2 \cdot 15 \cdot 1)](\bmod 105) \\ & x=(140+63+30)(\bmod 105) \\ & x=233(\bmod 105) \\ & x=23(\bmod 105)\end{aligned}$

So, $x=23$ is a solution to the system of congruences.
