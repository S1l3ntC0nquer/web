---
title: "[Bug Bounty] The First Bug Bounty in My Hacker Career"
cover: >-
    https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/bug-bounty-min.jpg
categories: Hacking
tags: Bug-Bounty
abbrlink: 28a0bb21
date: 2024-08-26 16:00:10
---

# Bug Info

-   ZDID：ZD-2024-00990
-   Risk：Medium
-   Type：Reflected Cross-Site Scripting (Reflected XSS)

# Target

The official website of [WorldGymTaiwan](https://www.worldgymtaiwan.com/).

# Vulnerability Description

- [OWASP - Cross-site Scripting (XSS)](https://www.owasp.org/index.php/Cross-site_Scripting_(XSS))

# Vulnerability Discovery

I found that there's a XSS in the search bar in the website. It didn't sanitize the input by user, even the `<script>` tag, so it's easy to inject any javascript to it.

# Proof of Concept (PoC)

Following is the PoC of the vulnerability.

![PoC](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/91b4fe881226156239fd6e66314f3a731.jpg)

# Reproduce

Access [this page](https://www.worldgymtaiwan.com/search?searchKeyword=<script>alert(1)</script>) or type `<script>alert(1)</script>` in the search bar (It's just an alert, no any malicious payload). 

# Impact

- [Impact of reflected XSS attacks](https://portswigger.net/web-security/cross-site-scripting/reflected#impact-of-reflected-xss-attacks)

# Remediation

- [OWASP - XSS (Cross Site Scripting) Prevention Cheat Sheet](https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet)

# References

None
