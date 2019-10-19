---
title: 动手写一个简单的 Virtual Dom（2）
category: React
author: Go7hic
authorURL: http://github.com/go7hic
---
上一篇文章其实就是介绍了怎么创建虚拟 DOM，真的只是创建 DOM 元素而已，因为没有设置属性的功能，事件绑定的功能也没有。
现在慢慢的一个个来实现吧。
<!--truncate-->
## 设置属性

设置属性很简单的，还记得前面我们怎么表达 DOM 的吗? 我们把属性用纯 JS 对象存起来，比如：

```html
<ul className=”list” style=”list-style: none;”></ul>
```

用 JS 对象来表达这个 DOM，就会是下面这个样子：

```js
{ 
  type: ‘ul’, 
  props: { className: ‘list’, style: ’list-style: none;’ } 
  children: []
}
```

上面对象的每个字段就是属性名称，字段的值就是属性的值了。我们只要把这个对象映射到 DOM节点上去就可以啦。
可以利用 `setAttribute()` 方法来写一个设置属性的函数：

```js
function setProp($target, name, value) {
  $target.setAttribute(name, value);
}
```

我们既然知道在 JS 里设置一个属性，那么可以通过遍历把对象里的每个字段设置成属性：

```js
function setProps($target, props) {
  Object.keys(props).forEach(name => {
    setProp($target, name, props[name]);
  });
}
```

接下来我们要用到上篇文章提到的 `createElement()` 函数。在创建 DOM 后引用 `setProps()` 函数


```js
function createElement(node) {
  if (typeof node === ‘string’) {
    return document.createTextNode(node)
  }
  const $el = document.createElement(node.type)
  setProps($el, node.props)
  node.children
    .map(createElement)
    .forEach($el.appendChild.bind($el))
  return $el
}
```

到这里还没完，还有几个需要注意的小地方。首先 class 在 JS 关键字，需要用 'className' 代替：

```html
<nav className=”navbar light”>
  <ul></ul>
</nav>
```

但是因为 DOM 里面是没有 `className` 这个属性的，所以需要我们自己利用 `setProp()` 函数去设置。

还有一个注意的地方就是，我们经常在 DOM 里面要用到一些布尔属性，比如：

```
<input type=”checkbox” checked={false} />
```

前面写了一个设置元素标签属性的 `setProp` 函数，现在需要再写一个设置元素标签属性布尔值的函数：

```js
function setBooleanProp($target, name, value) {
  if (value) {
    $target.setAttribute(name, value);
    $target[name] = true;
  } else {
    $target[name] = false;
  }
}
```

还有一个需要注意的就是我们有的时候可能会自己定义一个属性在 DOM 元素上，像这种情况我们需要检查如果是自定义的不存在的属性，我们
返回 false：

```js
function isCustomProp(name) {
  return false;
}
```
现在我们把 `setBooleanProp`，`isCustomProp`添加到 `setProp` 实现一个完整的设置属性的功能函数

```
function setProp($target, name, value) {
  if (isCustomProp(name)) {
    return;
  } else if (name === ‘className’) {
    $target.setAttribute(‘class’, value);
  } else if (typeof value === ‘boolean’) {
    setBooleanProp($target, name, value)
  } else {
    $target.setAttribute(name, value)
  }
}
```

上一篇讲创建 DOM 的时候有写到进行 DOM diff，其实现在这个属性也要进行 props diff。当然 diff
无非几种情况，删除属性，添加属性，更新属性这几种。


下面是删除属性的具体的函数：

```js
function removeBooleanProp($target, name) {
  $target.removeAttribute(name);
  $target[name] = false;
}
function removeProp($target, name, value) {
  if (isCustomProp(name)) {
    return;
  } else if (name === ‘className’) {
    $target.removeAttribute(‘class’);
  } else if (typeof value === ‘boolean’) {
    removeBooleanProp($target, name);
  } else {
    $target.removeAttribute(name);
  }
}
```

我们还需要一个 updateProp 的函数来比较DOM标签上新旧属性的区别并且更新最后的 DOM。细想一下应该主要就是
下面几种情况：
- 添加属性，指的是本来 DOM 标签上一个属性都没有，添加了一个属性
- 把属性删除了，和上面想反
- 删除属性值，可能一个属性里面本来有多个值，现在删了一个，比如本来 DOM class 属性有两个值的，现在删了一个
- 添加属性值，和上面相反

对于一个属性的更新可以这么写：
```js
function updateProp($target, name, newVal, oldVal) {
  if (!newVal) {
    removeProp($target, name, oldVal);
  } else if (!oldVal || newVal !== oldVal) {
    setProp($target, name, newVal);
  }
}
```

对于所有的属性则可以和前面设置属性一样通过遍历来实现：

```js
function updateProps($target, newProps, oldProps = {}) {
  const props = Object.assign({}, newProps, oldProps);
  Object.keys(props).forEach(name => {
    updateProp($target, name, newProps[name], oldProps[name]);
  });
}
```

好了，属性也更新了，最后就是更新DOM元素了，在第一篇文章里我们写了一个 updateElement函数，现在我们来更新一下这个函数：

```js
function updateElement($parent, newNode, oldNode, index = 0) {
  if (!oldNode) {
    $parent.appendChild(
      createElement(newNode)
    );
  } else if (!newNode) {
    $parent.removeChild(
      $parent.childNodes[index]
    );
  } else if (changed(newNode, oldNode)) {
    $parent.replaceChild(
      createElement(newNode),
      $parent.childNodes[index]
    );
  } else if (newNode.type) {
    // 新添加的代码
    updateProps(
      $parent.childNodes[index],
      newNode.props,
      oldNode.props
    ); //

    const newLength = newNode.children.length;
    const oldLength = oldNode.children.length;
    for (let i = 0; i < newLength || i < oldLength; i++) {
      updateElement(
        $parent.childNodes[index],
        newNode.children[i],
        oldNode.children[i],
        i
      );
    }
  }
}
```

最后我把上面的代码整理一下在 jsfiddle 上： https://jsfiddle.net/gothic/a1c4qky5/