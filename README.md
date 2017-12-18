# shape-editor

Javascript library based on Raphael.js for editing shapes

See demo at http://ome.github.io/shape-editor/

真实代码中使用的设计模式，也定义的很不相同，但是本质类似。

分享下我的看法，不一定对哈。

-----

涉及到模式的共有这些类：

1. 形状类 Ellipse，Line，Rect
2. 创建形状类： CreateLine ,CreateEllipse,CreateRect
3. 管理类： shapeManager

首先我认为工厂方法是存在的。其中CreateLine用来创建Line，CreateEllipse用来创建Ellipse，CreateRect用来创建Rect，它们其实是有一个接口的，但是这个接口是既可以分析出来的(在js语言中接口是隐含的)，就是三个方法
startDrag ,drag ,endDrag,它们一起构成了创建对象的工厂方法，并且它们都是“定义一个接口，并由子类决定创建哪个类”的定义，因此，这里的6个类的关系是factory method。

其次，在全部7个类中，部分的符合AbstractFactory的定义。shapeManager通过一个dict分支来创建CreateLine ,CreateEllipse,CreateRect，这三个类是对应的Line，Ellipse，Rect的工厂类。因此shapeManager是“创建工厂的工厂”，因此符合AbstractFactory的一条定义。但是这里没有一个“一系列彼此相关的对象”的系列，因此这条并不符合。如果这里除了shape还有color的话，就是抽象工厂类了。

这里面shapeManager是根据分支来创建 CreateLine ,CreateEllipse,CreateRect的，因此shapeManager相对于这三个类（ CreateLine ,CreateEllipse,CreateRect）是简单工厂。


分析下来，感觉挺有趣的。