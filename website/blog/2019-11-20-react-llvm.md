---
title: 扯谈之 React 和 LLVM
category: React
author: Go7hic
authorURL: http://github.com/go7hic
---
> 这是一篇很久之前的瞎想的文章，最近修改一下拿出来给博客除除草

取这个标题并不是为了要写两者之间有啥关联，因为两者之前确实没啥联系可写，根本不是一个层级的东西。我这主要还是自己之前接触学习 LLVM 时的一些想法记录下来
<!--truncate-->
#### LLVM
先看下维基百科对LLVM 的介绍：
> LLVM是一个自由软件项目，它是一种编译器基础设施，以C++写成，包含一系列模块化的编译器组件和工具链，用来开发编译器前端和后端。它是为了任意一种编程语言而写成的程序，利用虚拟技术创造出编译时期、链接时期、运行时期以及“闲置时期”的最优化。它最早以C/C++为实现对象，而当前它已支持包括ActionScript、Ada、D语言、Fortran、GLSL、Haskell、Java字节码、Objective-C、Swift、Python、Ruby、Rust、Scala[1]以及C#[2]等语言。

更详细的介绍可以见：https://zh.wikipedia.org/wiki/LLVM

官方的介绍就比较简单精准一点：
> LLVM可以被看作是一系列的编译器和工具链技术的集合，而且它们是模块化并且是可重用的。

如果还不清楚他是用来干么的也不要紧，你只需要清楚 LLVM 这东西让创建编一个新程语言变得更容易就行了。是的，你没看错，不是框架，不是库，而是创建一门新的编程语言。像近年的 Swift，Rust，Kotlin 等强大优秀的语言都直接用到了 LLVM。而像之前的一些没用到 LLVM 的语言也都提供了相应的编译支持。

关于 LLVM 有兴趣的可以自己去学习和了解，这里就暂时介绍这些。

#### React

上面了解了 LLVM，这里回到 React，一个涉及语言编译相关的，一个是UI 相关的，理论上是没有关联的，但是在对应领域起到的作用可以看作是差不多的。LLVM 作为语言的中间层，让创建新语言变得更容易，而 React 作为一个 UI 库，让创建各种**声明式 UI 框架**变得更容易，不仅仅是 Web 平台的 UI 哦。

React 作为声明式 UI 的引领者，让我们从过去 jQuery 那种命令式写法获得了船新的体验。而其他iOS，安卓等移动原生平台 UI 也都基本还在是命令式的写法，直到 Flutter 和 SwiftUI 的出现，声明式 UI 的写法好像才在原生平台有流行的趋势。这也说明，声明式 UI 编程才是未来，不管啥平台。

那问题来了，这么多设备，这么多平台，我都想用声明式来写 UI，那是不是得学很多语言和框架，或者能不能用一种类似的语法来写呢。这个可以说是，也可是说不是，看你的选择。SwiftUI 毫无疑问是苹果设备上编写声明式 UI 的未来，还有 Flutter ，也是个声明式的 UI 框架，支持跨平台的，这两者都从React 里吸收了灵感。如果你选择这两个，意味着你要学习新语言 Swift 或 Dart，不过这两门语言确实比 JS 优秀，有时间还是值得学习了解一下。

但是在两者出现之前，React 官方已经有 ReactNative 这种移动端跨平台的框架，而在社区里 PC 桌面端也有对应的框架（proton-native），小程序（Remax），甚至电视，邮件端，文件系统，命令行终端都有对应的渲染框架。怎么说呢，基本上只有你想，我们可以使用相同的组件样式声明方式为所有这些不同平台构建 UI。这也是我刚接触 LLVM 时联想到 React 的原因，一个是可以用相同的方式为不同平台构建声明式UI，一个是可以用相同的编译工具创建不同的语言。

#### 为什么
迫于对 LLVM 了解的还不是很深，所以这里只讨论一下 React.
为什么 React 会有这么多平台的构建UI的框架，除了 React 流行，社区活跃以外，我认为还一个主要原因就是和 React 的架构设计有关。react 从一开始定义的就是一个 UI 库，没有限定的平台，官方支持的渲染平台有网页dom(reac-dom), native(react-native)，art(react-art)。而我们很多人用的最多的可能就是 react-dom 里面的功能。

React 整个架构看起来有三大块，如下图：

![3A7CvwksXu4ByIV](https://i.loli.net/2019/12/28/3A7CvwksXu4ByIV.png)

- React Component API：提供对应的组件和声明周期这些

- React-Reconciler：这是 react 的核心 diff 算法，把对界面的一些操作修改，经过算法后重新绘制到页面。react团队也一直在优化它，react16版本就重写了之前的算法，叫做 react fiber。有兴趣的可以看官方文档和代码实现：https://reactjs.org/docs/reconciliation.html，
https://github.com/facebook/react/tree/master/packages/react-reconciler
- React Renderer：就是我们说的的渲染器，把你写的 Component 渲染到对应的平台，如果你用的 react-dom api，那就是渲染到对应的网页，还有 react-native 以及一些开源的框架。基本上，任何支持绘图的系统都可以成为React的渲染目标，有些甚至不需要支持绘制啥东西。https://github.com/iamdustan/react-hardware 这位老哥就把 react 用到了硬件开发。

也是基于此架构设计， React 从一开始的口号就是「 Learn Once, Write Anywhere」,我觉得可以再加一句 Render AnyPlatform。

#### 最后

不管 LLVM，还是 React 都在各自的领域起到了推进作用，都有不小的生态，好的东西大家自然乐意用，乐意参加到社区里面来。最后，随笔之作，有啥问题，欢迎斧正。