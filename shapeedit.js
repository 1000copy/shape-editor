// Simple Factory：把创建方法放到单独的类（工厂类），此方法根据传入的参数来决定实例化哪一个类。
class Shape{draw(){}}
class Rect extends Shape{draw(){}}
class Circle extends Shape{draw(){}}
class ShapeFactory{
	createShape(type){
		if (shape == "rect"){
			return new Rect()
		}else{
			return new Circle()
		}
	}
}
//  这样，当用户需要一个Rect对象时，就不必这样引用Rect

var rect = new Rect()

// 而是直接使用Factory来创建

var sf = new ShapeFactory()
var rect sf.createShape("rect")

// Factory method : 创建一个接口，但是由子类决定实例化哪一个类。接口：ShapeFactory.createShape,子类为：RectFactory，CircleFactory

class Shape{draw(){}}
class Rect extends Shape{draw(){}}
class Circle extends Shape{draw(){}}
class ShapeFactory{
	createShape(){}
}
class RectFactory extends ShapeFactory{
	createShape(){return new Rect()}
}
class CircleFactory extends ShapeFactory{
	createShape(){return new Circle()}
}

// 这样就可以使用对应的工厂，创建需要的类

var sf = new RectFactory()
var rect sf.createShape()

// AbstractFactory  : 提供一个接口a，此接口可以创建一系列相关或者相互依赖的对象b，使用用户不需要指定具体的类即可创建它们c。
// 接口a：AbstractFactory内的两个函数createShape，createColor
// 一系列相关或者相互依赖的对象b: Shape系列类，Color系列类
// 使用用户不需要指定具体的类即可创建它们c:实际上，用户只要使用FactoryProducer这一个类，不需要使用任何一个工厂，以及工厂创建的类。

class Shape{draw(){}}
class Rect extends Shape{draw(){}}
class Circle extends Shape{draw(){}}
class ShapeFactory{
	createShape(type){
		if (shape == "rect"){
			return new Rect()
		}else{
			return new Circle()
		}
	}
}
class Color{fill(){}}
class Red extends Color{fill(){}}
class Yellow extends Color{fill(){}}
class ColorFactory {
	creatColor(type){
		if (shape == "Red"){
			return new Red()
		}else if (shape == "Yellow"{
			return new Yellow()
		}
	}
}

// 如果希望客户可以一个单一接口来访问Color和Shape，可以引入一个抽象工厂：
class AbstractFactory{
	createShape(){}
	createColor(){}
}

// 要求两个工程实现此抽象工厂

class ShapeFactory extends AbstractFactory{
	createShape(type){
		if (shape == "rect"){
			return new Rect()
		}else{
			return new Circle()
		}
	}
	createColor(){
		return null
	}
}

class ColorFactory extends AbstractFactory{
	createShape(type){return null}
	creatColor(type){
		if (shape == "Red"){
			return new Red()
		}else if (shape == "Yellow"{
			return new Yellow()
		}
	}
}
// 自己不具备的能力，不实现即可，这里就是返回一个null。
// 需要一个创建工程的简单工厂
class FactoryProducer{
	getFactory(type){
		if (type == "color")return new ColorFactory()
			else return new ShapeFactory()
	}
}

// 没有抽象工厂，那么代码是这样的，所有的Factory类的创建都是硬编码的

var sf = new ShapeFactory()
var r = sf.createColor("Rect")
r.draw()
var cf = new ColorFactory()
var c = cf.createColor("Red")
c.fill()

// 有了抽象工厂，那么客户的使用就是这样

var fp = new FactoryProducer()
var sf = fp.getFactory("shape")
var r = sf.createColor("Rect")
r.draw()
var cf = fp.getFactory("color")
var c = cf.createColor("Red")
c.fill()

// 好处是，硬编码创建的类只有一个，就是FactoryProducer
