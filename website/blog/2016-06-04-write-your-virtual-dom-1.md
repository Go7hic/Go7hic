---
title: 动手写一个简单的 Virtual Dom（1）
category: React
author: Go7hic
authorURL: http://github.com/go7hic
---

Virtual Dom 又叫虚拟 DOM，随着 React 一起火起来的一个概念。虚拟 DOM 做到极致能够极大的提升性能，据说 Vue2 的 Virtual DOM 实现性能提升了很高。不过这些我们暂时不管，我们只要知道大致原理就可以自己来试着实现一个类似的乞丐版 Virtual Dom。
<!--truncate-->
我们知道虚拟 DOM 最后也是要映射成真实DOM 的，所以我们可以用 JS 对象来表示真实的 DOM 树。比如：
 
比如有个这样的 DOM 树结构

```html
<ul class=”list”>
  <li>item 1</li>
  <li>item 2</li>
</ul>
```
用 JS 对象我们可以这样来描述

```js
{ type: ‘ul’, 
  props: { ‘class’: ‘list’ }, 
  children: [
    { type: ‘li’, props: {}, children: [‘item 1’] },
    { type: ‘li’, props: {}, children: [‘item 2’] }
  ] 
}
```

考虑到我们不可能每个 DOM 标签都写一串这么长的对象来描述，我们可以封装一个简单的函数：

```js
function h(type, props, …children) {
  return { type, props, children };
}
```
其中 type 表示元素标签，props 表示标签的属性，children 表示子元素，现在我们用上面的函数再表示一遍：

```js
h(‘ul’, { ‘class’: ‘list’ },
  h(‘li’, {}, ‘item 1’),
  h(‘li’, {}, ‘item 2’),
)
```
现在我们还差一个方法来把上面的 JS 对象映射成真实的 DOM。我们可以写一个简单的实现方法：

```js
function createElement(node) {
  if (typeof node === 'string') {
    return document.createTextNode(node)
  }
  const $el = document.createElement(node.type)
  node.children.map(createElement).forEach($el.appendChild.bind($el))
  return $el
}
```
到这里基本的创建真实 DOM 功能就实现了，但是如果这就完了不是有点坑爹啊。哈哈，的确，Virtual Dom 的精华之处应该在其 diff 和 patch 上面，所谓 diff 应该就是 计算 [ 新的虚拟DOM ] 和 [ 旧虚拟DOM ] 的差异，然后开始 patch（根据计算的 差异, 更新真实DOM）。我想要优化 Virtual Dom 实现应该也是在这两方面优化吧。

所以接下来我们可以来实现个简单的 diff 功能。在写代码之前我们可以先想一下一个 Dom 结构前后之间会有哪几种变化呢？
我列了几点：

-  添加 DOM 元素 ，appendChild
- 删除 Dom元素，removeChild
- 替换 Dom 元素标签，标签和内容都变了，replaceChild
- 元素标签变了，但是内容没变

好了，我们就先看着这几个 diff 的实现吧，我们可以创建一个函数 updateElement ，用前面的那个 ul DOM结构为例子。

```js
function updateElement($parent, newNode, oldNode, index = 0) {
  if (!oldNode) {
    // 直接插入新的标签
    $parent.appendChild(createElement(newNode));
  } else if (!newNode) {
    // 把原来的标签删除
    $parent.removeChild($parent.childNodes[index]);
  } else if (changed(newNode, oldNode)) {
    // 替换 Dom 元素标签
    $parent.replaceChild(createElement(newNode), $parent.childNodes[index]);
  } else if (newNode.type) {
    const newLength = newNode.children.length;
    const oldLength = oldNode.children.length;
    for (let i = 0; i < newLength || i < oldLength; i++) {
      updateElement($parent.childNodes[index], newNode.children[i], oldNode.children[i], i);
    }
  }
}

```

再解释一下上面的代码，其中 $parent 是DOM的最外层标签，newNode和oldNode是新老的虚拟DOM，其中 index 表示的是子元素 li 的位置。

到这就差不多了，毕竟是乞丐版。下面是一个完整的例子：

https://jsfiddle.net/gothic/ogc3mme4/3/