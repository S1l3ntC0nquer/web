var posts=["posts/1bd6c34a/","posts/6431e3b0/","posts/b40c06ed/","posts/f9245dd2/","posts/41c83dfb/","posts/4c6f99b3/","posts/a4b22abb/","posts/7c095067/","posts/a9158ef3/","posts/94d4e36f/","posts/5ed8ca9a/","posts/b5f171c7/","posts/98fc7fc6/","posts/11af25ee/","posts/e58d0fa3/","posts/9071560f/","posts/86a224b6/","posts/db00a960/","posts/dfbc9f18/","posts/ab8b10a3/","posts/289c779a/","posts/4e5b6228/","posts/26c65734/","posts/6c120880/","posts/51f13f41/","posts/726c0654/","posts/1759791/","posts/4640530a/","posts/d01f5ccf/","posts/9deb0a60/","posts/be8e46ca/","posts/23950b86/","posts/67b7db12/","posts/81070fa0/","posts/3df19469/","posts/60102f54/","posts/e18c2f54/","posts/37bd2e1d/","posts/bd7b2870/","posts/a42f8edc/","posts/331a6b46/","posts/acba6120/","posts/b372fa96/","posts/ca279614/","posts/5ed2c20/","posts/e6118152/","posts/4f98706e/","posts/f9317c8b/","posts/cab519b8/","posts/4376026b/","posts/6526bdbd/","posts/461e0005/","posts/83db1007/","posts/624b1c44/","posts/7f04b563/","posts/61fb2d5c/","posts/6c0b3eb8/","posts/517a12d7/","posts/e5109b78/","posts/97052569/","posts/1d65dc6/","posts/83b7f1b/","posts/72a59deb/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };var friend_link_list=[{"name":"HackTricks","link":"https://book.hacktricks.xyz/","avatar":"https://raw.githubusercontent.com/S1l3ntC0nquer/MyBlogPhotos/main/image/ezgif-6-cbf671e7b0.gif","descr":"HackTricks is a educational Wiki that compiles knowledge about cyber-security"},{"name":"ExploitDB","link":"https://exploit-db.com/","avatar":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiah3EnrFp3i9fkkhJSJ0X256cbvZbUb_OIQ&s","descr":"Exploit Database is a community-sourced database of exploits and vulnerabilities."},{"name":"CVE","link":"https://cve.org/","avatar":"https://raw.githubusercontent.com/S1l3ntC0nquer/MyBlogPhotos/main/image/cve.jpg","descr":"The official website of the Common Vulnerabilities and Exposures (CVE) project."}];
    var refreshNum = 1;
    function friendChainRandomTransmission() {
      const randomIndex = Math.floor(Math.random() * friend_link_list.length);
      const { name, link } = friend_link_list.splice(randomIndex, 1)[0];
      Snackbar.show({
        text:
          "點擊前往按鈕進入隨機一個友鏈，不保證跳轉網站的安全性和可用性。本次隨機到的是本站友鏈：「" + name + "」",
        duration: 8000,
        pos: "top-center",
        actionText: "前往",
        onActionClick: function (element) {
          element.style.opacity = 0;
          window.open(link, "_blank");
        },
      });
    }
    function addFriendLinksInFooter() {
      var footerRandomFriendsBtn = document.getElementById("footer-random-friends-btn");
      if(!footerRandomFriendsBtn) return;
      footerRandomFriendsBtn.style.opacity = "0.2";
      footerRandomFriendsBtn.style.transitionDuration = "0.3s";
      footerRandomFriendsBtn.style.transform = "rotate(" + 360 * refreshNum++ + "deg)";
      const finalLinkList = [];
  
      let count = 0;

      while (friend_link_list.length && count < 3) {
        const randomIndex = Math.floor(Math.random() * friend_link_list.length);
        const { name, link, avatar } = friend_link_list.splice(randomIndex, 1)[0];
  
        finalLinkList.push({
          name,
          link,
          avatar,
        });
        count++;
      }
  
      let html = finalLinkList
        .map(({ name, link }) => {
          const returnInfo = "<a class='footer-item' href='" + link + "' target='_blank' rel='noopener nofollow'>" + name + "</a>"
          return returnInfo;
        })
        .join("");
  
      html += "<a class='footer-item' href='/link/'>More...</a>";

      document.getElementById("friend-links-in-footer").innerHTML = html;

      setTimeout(()=>{
        footerRandomFriendsBtn.style.opacity = "1";
      }, 300)
    };