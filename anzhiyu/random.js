var posts=["posts/5ed2c20/","posts/67b7db12/","posts/3df19469/","posts/e18c2f54/","posts/bd7b2870/","posts/cab519b8/","posts/f9317c8b/","posts/acba6120/","posts/a42f8edc/","posts/b372fa96/","posts/ca279614/","posts/83b7f1b/","posts/331a6b46/","posts/baaabc06/","posts/4f98706e/","posts/e6118152/","posts/4376026b/","posts/6526bdbd/","posts/461e0005/","posts/ad637ee9/","posts/83db1007/","posts/624b1c44/","posts/6c0b3eb8/","posts/61fb2d5c/","posts/517a12d7/","posts/97052569/","posts/7f04b563/","posts/e5109b78/","posts/1d65dc6/","posts/72a59deb/","posts/23950b86/","posts/81070fa0/","posts/d01f5ccf/","posts/9deb0a60/","posts/be8e46ca/","posts/1bd6c34a/","posts/b40c06ed/","posts/6431e3b0/","posts/4c6f99b3/","posts/f9245dd2/","posts/41c83dfb/","posts/a9158ef3/","posts/a4b22abb/","posts/b5f171c7/","posts/94d4e36f/","posts/7c095067/","posts/5ed8ca9a/","posts/11af25ee/","posts/e58d0fa3/","posts/db00a960/","posts/9071560f/","posts/86a224b6/","posts/dfbc9f18/","posts/289c779a/","posts/4e5b6228/","posts/ab8b10a3/","posts/98fc7fc6/","posts/26c65734/","posts/726c0654/","posts/6c120880/","posts/1759791/","posts/4640530a/","posts/51f13f41/","posts/37bd2e1d/","posts/60102f54/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };var friend_link_list=[];
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