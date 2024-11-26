---
title: Discrete Mathematics for Muggles
categories: StudyNotes
tags: Math
abbrlink: 6c0b3eb8
date: 2024-09-19 09:09:44
cover: https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/discrete_math.jpg
---

# Fundamentals of  Logic

## Statements

- Statements (or propositions)
  - Declarative sentences that are either **true** or **false** but not both
- Primitive statements
  - There is really no way to  break them down into anything simpler

New statements can be obtained from existing ones in two ways

- Negation
  - We do not consider the negation of a primitive statement to be a primitive statement
  - The negation statement of $p$ is $\neg{p}$
  - NOT
- Compound statements, using the following *logical connectives*
  - Conjunction $\wedge$
    - AND
  - Disjunction $\vee$
    - OR
    - $p\vee{q}$ means inclusive disjunction. True if one or the other of $p, q$ is true or if **both** of the statements $p, q$ are true
    - $p\veebar{q}$ maens exclusive disjunction. True if one or the other of $p, q$ is  true but **not both** of the statements $p, q$ are true
  - Implication $\to$
    - THEN
    - $p\to{q}$
    - If $p$, then $q$
    - $p$ is sufficient for $q$
    - $p$ is a sufficient condition for $q$
    - $q$ is necessary condition for $p$
    - $q$ is a necessary condition for $p$
    - $p$ only if $q$
    - The statement $p$ is called the *hypothesis* of the implication; $q$ is called the *conclusion*.
  - Biconditional $\leftrightarrow\text{or}\Leftrightarrow$
    - IF AND ONLY IF
    - IFF
    - $p\leftrightarrow{q}$ means $p$ is necessary and sufficient for $q$.

The following is the graph of the truth table.

![Truth Table](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240921161747620.png)

## Tautology and Contradiction

- Tautology
  - A compound statement is called  a tautology if it is true for all truth value  assignments for its component statement.
- Contradiction
  - If a compound statement is false for all such assignments, then it is called a contradiction.

## Logical Equivalence

Two statements $s1, s2$ are said to be logically equivalent, and we write $s1\Leftrightarrow s2$ ,  when the statement $s1$ is true (respectively, false) if and only if the statement $s2$ is true (respectively,  false).

## The Laws of Logic

For any primitive statements $p, q, r$, any tautology $T_0$ , and any contradiction $F_0$,

$\text{Law of Double Negation}$

- $\neg\neg{p}\Leftrightarrow{p}$

$\text{DeMorgan's Laws}$

- $\neg{(p\vee{q})}\Leftrightarrow\neg p \wedge\neg q$
- $\neg{(p\wedge{q})}\Leftrightarrow\neg p \vee\neg q$

$\text{Commutative Laws}$

- $p\vee{q}\Leftrightarrow q\vee{p}$
- $p\wedge{q}\Leftrightarrow q\wedge{p}$

$\text{Associative Laws}$

- $p\vee(q\vee r)\Leftrightarrow(p\vee q)\vee r$
- $p\wedge(q\wedge r)\Leftrightarrow(p\wedge q)\wedge r$

$\text{Distributive Laws}$

- $p\vee(q\wedge r)\Leftrightarrow(p\vee q)\wedge(p\vee r)$
- $p\wedge(q\vee r)\Leftrightarrow(p\wedge q)\vee(p\wedge r)$

$\text{Idempotent Laws}$

- $p\vee p\Leftrightarrow p$
- $p\wedge p\Leftrightarrow p$

$\text{Identity Laws}$

- $p\vee F_0\Leftrightarrow p$
- $p\wedge T_0\Leftrightarrow p$

$\text{Inverse Laws}$

- $p\vee\neg p\Leftrightarrow T_0$
- $p\wedge\neg p\Leftrightarrow F_0$

$\text{Domination Laws}$

- $p\vee T_0\Leftrightarrow T_0$
- $p\wedge F_0\Leftrightarrow F_0$

$\text{Absorption Laws}$

- $p\vee(p\wedge q)\Leftrightarrow p$
- $p\wedge(p\vee q)\Leftrightarrow p$

## Dual of Statement

- Let's say $s$ is a statement. If $s$ contains no logical connectives other than $\wedge$ and $\vee$, then the dual of $s$, denoted $s^d$, is the statement obtained from $s$ by replacing each occorrence of $\wedge$ with $\vee$, $T_0$ with $F_0$ and vice versa.

Here's an example, if $p$ is any primitive statement, then

- $p^d\equiv p$
- $(\neg{p})^d\equiv\neg{p}$
- $p\vee T_0$ and $p\wedge F_0$ are duals of each other

### Duality Principle

Let $s$ and $t$ be statements that contain no logical connectives other than $\wedge$ and $\vee$. If $s\Leftrightarrow t$, then $s^d\Leftrightarrow t^d$.

## Substitution Rules

1. Suppose that the **compound statement $P$ is a tautology**. If $p$ is a **primitive** statement that appears in $P$ and we replace each occurrence of $p$ by the same statement $q$, then the resulting compound statement $P_1$ is also a tautology.
2. Let $P$ be a compound statement where $p$ is an arbitrary statement that appears in $P$, and let $q$ be a statement such that $q\Leftrightarrow p$. Suppose that in $P$ we replace one or more occurence of $p$ by $q$. Then this replacement yields the compound statement $P_1$. Under these circumstances $P_1\Leftrightarrow P$.

For example
$$
\begin{aligned}
P&:\neg(p\vee q)\Leftrightarrow(\neg p\wedge\neg q)\quad\text{is a tautology}\\
P_1&:\neg[(r\wedge s)\vee q]\Leftrightarrow[\neg(r\wedge s )\wedge\neg q]\quad\text{is also a tautology}\\
P_2&:\neg[(r\wedge s)\vee(t\to u)]\leftrightarrow[\neg(r\wedge s)\wedge\neg(t\to u)]\quad\text{is also a tautology}
\end{aligned}
$$

## Modus Ponens (Rule of Detachment)

- Statement
    - If $p$ is true, and $p\to q$ is true, then the conclusion $q$ must also be true

## Law of The Syllogism

- Statement
    - If $p$ then $q$
    - If $q$ then $r$
    - 2 of the aboves imply if $p$ then $r$
- Math Expression
    - $[(p\to q)\wedge(q\to r)]\to(p\to r)$

## Modus Tollens

- Statement
    - If $p$ then $q$, then not $q$ impies not $p$
- Math Expression
    - $[(p\to q)\wedge\neg q]\to\neg p$

## Rule of Conjunction

- If $p, q$ are true statement, then $p\wedge q$ is also a true statement

# Set Theory

## Terms Definitions

- Set
  - A well-defined collection of objects. Neither order nor repetition is relevant for a  general set

- Element
  - Objects inside the set is called elements. They are said to be members of the set

- Universe
  - The set that contains all possible elements relevant to a particular discussion or problem

- Subset
  - If every element of $C$ is an element of  $D$, then $C$ is a subset of $D$, which will be denoted by $C \subseteq D$

- Proper subset
  - If, in addition, $D$ contains an element that is not in $C$, then $C$ is called a proper subset of $D$. It will be denoted by $C \subset D$

- Cardinality
  - Also called size, the number of elements in a set, denoted by $|A|$

- Equal
  - $C$ & $D$ are said to be equal when $C \subseteq D$ and $D \subseteq C$


## Subset Relations

Let $A, B, C \subseteq U$.

1. If $A \subseteq B$ and $B \subseteq C$, then $A \subseteq C$.
2. If $A \subset B$ and $B \subseteq C$, then $A \subset C$.
3. If $A \subseteq B$ and $B \subset C$, then $A \subset C$.
4. If $A\subset B$ and $B\subset C$, then $A\subset C$.

## Null Set

- The null set, or empty set, is the (unique) set containing no elements. It is  denoted by $\phi$ or $\{\}$.
- $|\phi| = 0$, but $\{0\}\neq\phi$.
- $\phi\neq\{\phi\}$.

### Theorem 3.2

For any universe $U$, let $A \subseteq U$. Then $\phi \subseteq A$, and if $A\neq\phi$, then $\phi\subset A$.

## Power Set

- If $A$ is a set from universe $U$, the  power set of $A$, denoted $P(A)$, is the collection (or set) of all subsets of $A$.

For the set $C=\{1, 2, 3, 4\}$
$$
P(C)=\{\varnothing,\{1\},\{2\},\{3\},\{4\},\{1,2\},\{1,3\},\{1,4\},\{2,3\},\{2, 4\},\{3,4\},\{1,2,3\},\{1,2,4\}\{1,3,4\}\{2,3,4\}, C\}
$$
For any finite set $A$ with $|A|=n \geq 0$, we find that $A$ has $2^n$ subsets and that $|P(A)|=2^n$. For any $0 \leq k \leq n$, there are $\binom{n}{k}$ subsets of size $k$. Counting the subsets of $A$ according to the number, $k$, of elements in a subset, we have the combinatorial identity $\binom{n}{0}+\binom{n}{1}+\binom{n}{2}+\cdots+\binom{n}{n}=\sum_{k=0}^n\binom{n}{k}=2^n$, for $n \geq 0$.

## Gray Code

- A systematic way to represent the subsets of a  given nonempty set can be accomplished by  using a coding scheme known as a Gray code.

![Gray Code](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240919095457692.png)

## Pascal's Triangle

![Pascal's Triangle](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240919095606249.png)

## Set of Numbers

1. $\mathbf{Z}=$ the set of integers $=\{0,1,-1,2,-2,3,-3, \ldots\}$
2. $\mathbf{N}=$ the set of nonnegative integers or natural numbers $=\{0,1,2,3, \ldots\}$
3. $\mathbf{Z}^{+}=$the set of positive integers $=\{1,2,3, \ldots\}=\{x \in \mathbf{Z} \mid x>0\}$
4. $\mathbf{Q}=$ the set of rational numbers $=\{a / b \mid a, b \in \mathbf{Z}, b \neq 0\}$
5. $\mathbf{Q}^{+}=$the set of positive rational numbers $=\{r \in \mathbf{Q} \mid r>0\}$
6. $\mathbf{Q}^*=$ the set of nonzero rational numbers
7. $\mathbf{R}=$ the set of real numbers
8. $\mathbf{R}^{+}=$the set of positive real numbers
9. $\mathbf{R}^*=$ the set of nonzero real numbers
10. $\mathbf{C}=$ the set of complex numbers $=\left\{x+y i \mid x, y \in \mathbf{R}, i^2=-1\right\}$
11. $\mathbf{C}^*=$ the set of nonzero complex numbers
12. For each $n \in \mathbf{Z}^{+}, \mathbf{Z}_n=\{0,1,2, \ldots, n-1\}$
13. For real numbers $a, b$ with $a<b,[a, b]=\{x \in \mathbf{R} \mid a \leq x \leq b\}$, $(a, b)=\{x \in \mathbf{R} \mid a<x<b\},[a, b)=\{x \in \mathbf{R} \mid a \leq x<b\}$, $(a, b]=\{x \in \mathbf{R} \mid a<x \leq b\}$. The first set is called a closed interval, the second set an open interval, and the other two sets half-open intervals.

## Closed Binary Operations

- The addition and multiplication of positive  integers are said to be closed binary operations on $\mathbf{Z}^{+}$.
- Two operands, hence the operation is called binary.
- Since $a+b \in \mathbf{Z}^{+}$when $a, b \in \mathbf{Z}^{+}$, we say that the binary operation of addition (on $\mathbf{Z}^{+}$) is closed.

## Binary Operations for Sets

For $A, B \subseteq U$, we define the following

- Union
  - $A \cup B = \{x\mid x\in A\vee x \in B\}$

- Intersection

  - $A \cap B = \{x\mid x\in A\wedge x \in B \}$

  - Symmetric Difference (like XOR)
    - $A \triangle B=\{x\mid(x\in A\vee \in B)\wedge x\notin A\cap B\}=\{x\mid x \in A\cup B \wedge x \notin A \cap B\}$

## Disjoint

Let $S, T \subseteq U$. The sets $S$ and $T$ are called disjoint, or mutually disjoint, when $S \cap T = \phi$.

### Theorem 3.3

If $S, T \subseteq U$, then $S, T \subseteq U$ are disjoint if and only if $S \cup T = S \triangle T$.

## Complement

- For a set $A \subseteq U$, the complement of $A$, denoted $U - A$, or $A$, is given by $\{x \mid x \in U \wedge x \notin A\}$.

- For $A, B \subseteq U$, the (relative) complement of $A$ in $B$, denoted $B - A$, is given by $\{x \mid x \in B \wedge x \notin A\}$.

## Subset, Union, Intersection, and  Complement

### Theorem 3.4

For any universe $U$ and any sets $A, B \subseteq U$, the following statements are equivalent:

1. $A \subseteq B$
2. $A \cup B = B$
3. $A\cap B = A$
4. $\overline{B}\subseteq\overline{A}$

## The Laws of Set Theory

For any sets $A, B$ and $C$ taken from a universe $U$.

$\text{Law of Double Complement}$

- $\overline{\overline{A}}=A$

$\text{DeMorgan's Laws}$

- $\overline{A\cup B}=\overline{A}\cap\overline{B}$
- $\overline{A\cap B}=\overline{A}\cup\overline{B}$

$\text{Commutative Laws}$

- $A\cup B=B\cup A$
- $A\cap B=B\cap A$

$\text{Associative Laws}$

- $A\cup(B\cup C)=(A\cup B)\cup C$
- $A\cap(B\cap C)=(A\cap B)\cap C$

$\text{Distributive Laws}$

- $A\cup(B\cap C)=(A\cup B)\cap (A\cup C)$
- $A\cap(B\cup C)=(A\cap B)\cup(A\cap C)$

$\text{Idempotent Laws}$

- $A\cup A=A$
- $A\cap A=A$

$\text{Identity Laws}$

- $A\cup\phi=A$
- $A \cap U = A$

$\text{Inverse Laws}$

- $A\cup\overline{A}=U$
- $A\cap\overline{A}=\phi$

$\text{Domination Laws}$

- $A\cup U=U$
- $A\cap\phi=\phi$

$\text{Absorption Laws}$

- $A\cup(A\cap B)=A$
- $A\cap(A\cup B)=A$

## Dual

Let $s$ be a (general) statement dealing with the equality of two set expressions.  Each such expression may involve one or more  occurrences of sets (such as $A$, $\overline{A}$, $B$, $\overline{B}$, etc.),  one or more occurrences of $\phi$ and $U$, and only  the set operation symbols $\cap$ and $\cup$. The dual of $s$, denoted $s^d$ , is obtained from $s$ by replacing (1)  each occurrence of $\phi$ and $U$ (in $s$) by $U$ and $\phi$, respectively; and (2) each occurrence of $\cap$ and $\cup$ (in $s$) by $\cup$ and $\cap$, respectively.

### Theorem 3.5

- Let $s$ denote a theorem dealing with the equality of two set expressions. Then $s^d$ , the dual of $s$, is also a theorem.
- This result cannot be applied to particular situations but only to results (theorems) about  sets in general

## Index Set

Let $I$ be a nonempty set and $U$ a universe. For each $i\in I$ let $A_i \subseteq U$. Then $I$ is called an index set (or set of indices), and each $i \in I$ is called an **index**. Under these conditions, 

$\displaystyle\bigcup_{i\in I}A_{i}=\{x\mid x\in A_{i}\quad \text{for at least one } i\in{I}\}$, 

$\displaystyle\bigcap_{i\in I}A_i=\{x\mid x\in A_i\quad\text{for every }i\in{I}\}$.

For example, let $I=\{3, 4, 5, 6, 7\}$, and for each $i\in{I}$ let $A_i=\{1, 2, 3, \dots, i\}\subseteq{U}=\mathbf{Z}^{+}$. Then $\bigcup_{i\in{I}}A_i=\bigcup^7_{i=3}A_i=\{1, 2, 3,\dots, 7\}=A_7$, whereas $\bigcap_{i\in{I}}A_i=\{1, 2, 3\}=A_3$.

## Generalized DeMorgan’s Laws

Let $I$ be an index set where for each $i \in I$, $A_i \subseteq U$. Then,

- $\displaystyle\overline{\bigcup_{i\in I}A_i}=\bigcap_{i\in I}\overline{A_i}$
-  $\displaystyle\overline{\bigcap_{i\in I}A_i}=\bigcup_{i\in I}\overline{A_i}$

## Definition for Probability

Under the assumption of equal likelihood, let $I$ be the sample space for an experiment $E$. Any subset $A$ of $I$, including the empty subset, is called an event. Each element of $I$ determines an outcome, so if $|I| = n$ and $a \in I, A \subseteq I$, then $Pr(\{a\})$ = The probability that $\{a\}$ (or, $a$) occurs = $\frac{|\{a\}|}{I} = \frac{1}{n}$, and $Pr(A)$ = The probability that $A$ occurs = $\frac{|A|}{|I|} = \frac{|A|}{n}$.

## Cross Product

For sets $A$, $B$, the **Cartesian product**, or **cross product**, of $A$ and $B$ is denoted by $A \times B$ and equals $\{(a, b)\mid a \in A, b \in B\}$.

# Properties of Integer

