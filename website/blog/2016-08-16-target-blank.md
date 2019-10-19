---
title: 使用 target="_blank" 的一个漏洞
category: Node
author: Go7hic
authorURL: http://github.com/go7hic
---

这个问题前几个月在 HN 上有人讨论过，但是今天遇到了就再记录一下，毕竟国外有人说过这是一个最为低估的一个漏洞。

平常我们通过 a 标签新打开页面的时候会给 a 标签添加 target="_blank" 属性，表示新开一个窗口打开。但是在新页面的 window 对象中，存在一个 opener 属性，保存对父页面的引用，而且这个在不同域之间也是存在的。
<!--truncate-->
就意味着在父页面新窗口打开一个链接，跳到子页面后，子页面可以控制父页面的一些行为，比如让父页面重定向到一个逼真的钓鱼页面，因为此时用户的注意力在新开的窗口，很难注意到父页面发生的变化。

在很长的一段时间，浏览器厂商对这个 bug 并不 care( [
 Security: if window.opener exists, a page can trigger a navigation in the opener regardless of security origin - 
 Monorail](https://bugs.chromium.org/p/chromium/issues/detail?id=168988) )。按照他们的意思就是你不要在新窗口打开页面，直到前几个月才对这个bug 有了一个比较好的解决方案，那就是给 a 标签添加 `rel=noopener` 属性，可以在 [HTML Standard](https://html.spec.whatwg.org/#link-type-noopener)看到这个属性说明，在 ff 浏览器里面要再加上 `rel="noreferrer"`才能生效。所以如果你要通过 a 标签新打开个页面，你的正确写法应该是：
`<a href="" target="_blank" rel="noopener noreferrer"></a>`

在一些老浏览器里面不支持这个属性，就可以通过js 手动设置  opener 为 null 来解决：
```js
var newWnd = window.open('http://baidu.com);
newWnd.opener = null;
newWnd.location = url;
```
