---
abbrlink: 517a12d7
categories:
- - StudyNotes
cover: https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/24/9/euclidean_9fab94cfbbb8a5c35339bd17b312eeb9.jpg
date: '2024-09-30T16:42:22.924184+08:00'
excerpt: Prologue I decided to write this to help myself to better understand the attacks in RSA or other crypto system. And if this can help you, that would be my honor! Also, all the code in this note will i...
tags: []
title: Intro to Extended Euclidean Algorithm
updated: '2024-09-30T20:24:21.845+08:00'
---
# Prologue

I decided to write this to help myself to better understand the attacks in RSA or other crypto system. And if this can help you, that would be my honor! Also, all the code in this note will in Python since it's the most used exploit script language in CTFs.

Let's start!

# Euclidean Algorithm

## Intro

It's an algorithm to calculate the GCD (Greatest Common Divisor) between 2 numbers, and in Chinese, it's called 輾轉相除法 BTW.

## Principles

It's an **recursive** algorithm, so every step's output is the input of the next step. Here we set $k$ is the count of the steps, starting from 0.

The inputs of every step are non-negative remainders $r_{k-1}, r_{k-2}$. And since the remainders obtained by each round are smaller than those calculated in the former round, $r_{k-1}<r_{k-2}$. In the $k^{th}$ step, the algorithm calculates the quotient $q_k$ and remainder $r_k$ that satisfy the following equations.

$$
r_{k-2} = q_{k} r_{k-1} + r_{k} \quad \text{where } 0 \leq r_{k} \leq r_{k-1}
$$

That is, $r_{k-2}$ should recursively minus $r_{k-1}$ until it's less than $r_{k-1}$.

In the first step ($k=0$), we set $r_{-2}$ and $r_{-1}$ are equal to $a$ and $b$. In the second step ($k=1$), we calculate the quotient and the remainder by dividing $r_{-1}$ (which is $b$) by $r_0$ (the remainder we obtained in the first step), and so on. The whole algorithm can be represented by the following equations.

$$
\begin{align*}
a&= q_0 b+r_0 \\
b&=q_1 r_0+r_1 \\
r_0&=q_2 r_1+r_2\\
r_1&=q_3 r_2+r_3\\
&\,\,\, \vdots \\
r_n&=0
\end{align*}
$$

If $a<b$, the first step is actually switching those, since $a\div{b}=q_0=0\dots r_0=a$.

Because the remainder calculate in each step is always decreasing and never gonna be negative, there must be an $n$ such that $r_n=0$ in the $n^{th}$ step. Then $r_{n-1}$ is the GCD of $a$ and $b$. Also, $n$ is impossible to be infinite so there must be finite natural numbers between $r_0$ and $0$.

## Code

```python
def euclidean_algorithm(a, b) -> int:
    if (b == 0):
        return a
    return euclidean_algorithm(b, a%b)
```

This function will return the GCD of $a, b$.

# Extended Euclidean Algorithm

## Intro

Extended Euclidean Algorithm, obviously is the extension of Euclidean Algorithm. For known $a, b$, the Extended Euclidean Algorithm can find the $x, y$ that satisfy the Bézout's identity $ax+by=\gcd(a, b)$ while obtaining $\gcd(a, b)$. If $a<0$, we can change the problem into $|a|(-x)+by=\gcd(|a|, b)$, and let $x'=(-x)$.

Bézout's identity is an important result in Number Theory, describing the relationship between the GCD of 2 numbers & their linear combinations. The equation is

$$
ax+by=\gcd(a, b)
$$

For arbitrary 2 integers $a, b$, there must be integers $x, y$ that satisfy this equation.

By the way, the Extended Euclidean Algorithm is an _self-verifying algorithm_. We can simply use the $s_{i+1}$ and $t_{i+1}$ obtained in the last step to times $\gcd(a, b)$, and see if they're equal to $a$ and $b$ to verify the calculation is correct.

And the most important thing for us (CTFers, or cybersecurity enthusiasts) is that this algorithm can be used to calculate the modular multiplicative inverse, which is necessary in RSA to obtain the keys.

## Principles

In an standard Euclidean Algorithm, we mark the 2 numbers for which we want to calculate the GCD as $a$ and $b$, and the quotient we get in the $i^{th}$ step to be $q_i$, remainder to be $r_{i+1}$. Then we can write the Eulidean Algorithm as following.

$$
\begin{align*}
r_0&=a \\
r_1&=b \\
&\,\,\,\vdots \\
r_{i+1}&=r_{i-1}-q_i r_i\quad\text{and}\quad0\leq{r_{i+1}}\leq|r_i| \\
&\,\,\,\vdots
\end{align*}
$$

When some step the $r_{i+1}=0$, the algorithm breaks. And the $r_i$ obtained in the last step is $\gcd(a, b)$.

The Extended Euclidean Algorithm adds 2 additional sequences $s_i$ and $t_i$ based on $q_i$ and $r_i$, and lets $s_0=1$, $s_1=0$, $t_0=0$ and $t_1=1$. In the Extended Euclidean Algorithm, each step calculates $r_{i+1}=r_{i-1}-q_i r_i$, and furthermore calculates $s_{i+1}=s_{i-1}-q_i s_i$ and $t_{i+1}=t_{i-1}-q_i t_i$, which is

$$
{\displaystyle {\begin{aligned}r_{0}&=a&r_{1}&=b\\s_{0}&=1&s_{1}&=0\\t_{0}&=0&t_{1}&=1\\&\,\,\,\vdots &&\,\,\,\vdots \\r_{i+1}&=r_{i-1}-q_{i}r_{i}&{\text{and }}0&\leq r_{i+1}<|r_{i}|\\s_{i+1}&=s_{i-1}-q_{i}s_{i}\\t_{i+1}&=t_{i-1}-q_{i}t_{i}\\&\,\,\,\vdots \end{aligned}}}
$$

And the breaking condition is the same with the Euclidean Algorithm, which is $r_{i+1}=0$, and the $s_i$ and $t_i$ at this time is the solution for $\gcd(a, b)=r_i=as_i+bt_i$.

To find the modular multiplicative inverse $a^{-1}$, we can use the following steps.

1. Confirm that $a$ and $b$ are coprime, which means $\gcd(a, b)=1$, if it's not, then the $a^{-1}$ doesn't exist.
2. Use the Extended Euclidean Algorithm to solve $ax+by=1$, then the $x$ is what we want.

For example, if we want to find the modular multiplicative inverse of 3 modulo 11.

$$
\begin{align*}
&\text{Extended Euclidean Part} \nonumber \\\\
&11 = 3 \cdot 3 + 2 \nonumber \\
&3 = 2 \cdot 1 + 1 \nonumber \\
&2 = 1 \cdot 2 + 0 \nonumber \\\\
&\text{Inverse Part} \nonumber \\\\
&1 = 3 - 1 \cdot 2 \nonumber \\
&1 = 3 - 1 \cdot (11 - 3 \cdot 3) \nonumber \\
&1 = 4 \cdot 3 - 1 \cdot 11 \nonumber \\\\
&\text{So } x = 4 \text{ is the modular multiplicative inverse of } 3.
\end{align*}
$$

To learn more about how the Extended Euclidean Algorithm is used in attacking RSA, I will put some challenge here ASAP.

## Code

```python
def extended_euclidean(a: int, b: int) -> tuple[int, int, int]:
    if a == 0:
	    return (b, 0, 1)
    g, y, x = extended_euclidean(b % a, a)
    return (g, x - (b // a) * y, y)

def inverse(a: int, b: int) -> int:
	g, x, y = extended_euclidean(a, b) # ax + by = gcd
	if g == 1:
		return x % b
	raise ValueError("base is not invertible for the given modulus.")
```
