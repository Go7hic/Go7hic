---
layout: post
title: 动手写一个简单的 Virtual Dom（3）
datePublished: '2016-06-06 11:21:04'
tags: React
---


前一篇文章介绍了 Virtual Dom 的属性设置等，现在再讲一下  Virtual Dom 怎么绑定事件。
平常我们给 DOM 绑定事件的写法可能是这样：`querySelector('xx').addEventListener(..)`
但是在 React 里面我们不这样写，我们直接在 DOM 上通过属性来绑定：

```
<button onClick={() => alert(‘hi!’)}></button>
```

上面我们有一个专门监听事件的属性，并且都以 'on' 开头，下面我们写一个函数来判断该属性是不是绑定事件的：

```js
function isEventProp(name) {
  return /^on/.test(name);
}
```

下面我们还需要一个方法来从属性里面把 事件属性名给提出来：

```js
function extractEventName(name) {
  return name.slice(2).toLowerCase();
}
```
现在还有个问题就是我们这个监听事件的属性其实和其他的正常属性是不一样的，所以我们需要在 isCustomProp 里面
处理这个属性：

```js
function isCustomProp(name) {
  return isEventProp(name);
}
```

接下来就是真正的给 Dom 监听事件的属性添加监听函数了：

```js
function addEventListeners($target, props) {
  Object.keys(props).forEach(name => {
    if (isEventProp(name)) {
      $target.addEventListener(
        extractEventName(name),
        props[name]
      );
    }
  });
}
```
然后把上面这个放到 `createElement` 里面去：

```js
function createElement(node) {
  if (typeof node === ‘string’) {
    return document.createTextNode(node);
  }
  const $el = document.createElement(node.type);
  setProps($el, node.props);
  addEventListeners($el, node.props);
  node.children
    .map(createElement)
    .forEach($el.appendChild.bind($el));
  return $el;
}
```
到这里监听事件的功能基本上就好了，但是还有一个小问题，就是重复添加事件的问题，虽然这个需求很少，但是还是不可避免的会有，
所以我们可以添加一个强制更新的属性 'forceUpdate'，然后修改之前的那个 change 函数：

```js
function changed(node1, node2) {
  return typeof node1 !== typeof node2 ||
         typeof node1 === ‘string’ && node1 !== node2 ||
         node1.type !== node2.type ||
         node.props.forceUpdate;
}
```

当 'forceUpdate' 为 true 时，这个 Dom 节点会完全重新重新创建并且把事件监听加上，这里就还需要修改下之前的 isCustomProp 函数：

```js 
function isCustomProp(name) {
  return isEventProp(name) || name === ‘forceUpdate’;
}
```

下面是完整的 DEMO：https://jsfiddle.net/gothic/as87qdyc/3/