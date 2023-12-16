/**
 * # 一、实现一个响应式原理
1. effect 这个函数就是让 total 重新计算一次
2. track() 函数（追踪函数）会将 effect 添加到 dep 数组中。
3. trigger() 函数（触发函数）会遍历我们存储的每一个 effect，然后运行它们。

## 如何存储，让每个属性拥有自己的依赖
通常，我们的对象会有多个属性，每个属性都需要自己的 dep(依赖关系)，或者说 effect的 Set。

1. dep 就是一个 effect 集(Set)，这个 effect 集应该在值发生变化时重新运行。
2. 要把这些 dep 存储起来，且方便我们以后再找到它们，我们需要创建一个 depsMap，它是一张存储了每个属性其 dep 对象的图。
3. 使用对象的属性名作为键，比如数量和价格，值就是一个 dep(effects集)。

## 如果我们有多个响应对象呢？
我们需要对每个对象进行存储，其中每个对象包括了不同的属性，所以我们在这之上又用了一张表(Map)-targetMap，来存储每个对象。

需要注意的是这个数据结构是 WeakMap,就是键值为空时会被垃圾回收机制清除，就是响应式对象消失后，这里面存储的相关依赖也会被自动清除。

## 代理与反射
 */


// const product = {
//   price: 5,
//   quantity: 2
// }
// let total = 0
// const user = {
//   firstName: 'Joe',
//   lastName: 'Smith',
// }

// // effect 这个函数就是让 total 重新计算一次
// const effect = () => {
//   total = product.price * product.quantity
// }

const targetMap = new WeakMap() // 为每个响应式对象存储依赖关系
let activeEffect: Function | null = null
function effect(fn: Function) {
  activeEffect = fn
  fn()
  activeEffect = null
}
// const depsMap = new Map() // key 为对象属性名，value 为 dep(effects集)
// const dep = new Set() // 储藏 effect，保证不会添加重复项
function track(target: any, key: string) {
  if(activeEffect) {
    let depsMap = targetMap.get(target) // target 是响应式对象的名称（如 product），key 是对象中属性的名称(如 price)
    if(!depsMap) {
      // 若不存在该 depsMap，则为该对象创建一个新的 deps 图
      depsMap = new Map()
      targetMap.set(target, depsMap)
    }
    // key 值为 价格或数量
    let dep = depsMap.get(key) // 找到对应属性的依赖对象
    // 若没找到，则创建一个 dep(effects集)
    if (!dep) {
      dep = new Set() // 储藏 effect，保证不会添加重复项
      depsMap.set(key, dep) // 储存 dep
    }
    dep.add(activeEffect) // 添加 effect到 dep，注意 dep(Set)会去重
  }
}

// trigger() 函数（触发函数）会遍历我们存储的每一个 effect，然后运行它们。
function trigger(target: any, key: string) {
  const depsMap = targetMap.get(target) // 检查对象(如 product)是否有依赖的属性
  // 若没有则立即返回
  if (!depsMap) return
  const dep = depsMap.get(key) // 找到对应键值(属性)的依赖
  if (dep) {
    // 若存在，遍历并运行每个 effect
    // @ts-ignore
    dep.forEach(effect => effect())
  }
}

function reactive(target: any) {
  const handler = {
    get(target: any, key: string, receiver: any) {
      const result = Reflect.get(target, key, receiver)
      // 若访问的是 price 或 quantity，则需要触发 effect
      track(target, key)
      return result
    },
    set(target: any, key: string, value: any, receiver: any) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      if (oldValue!== value) {
        trigger(target, key)
      }
      return result
    }
  }

  return new Proxy(target, handler)
}

function ref(initialValue: any) {
  return reactive({
    value: initialValue
  })
}

const product = reactive({
  price: 5,
  quantity: 2
})
const salePrice = ref(0)
let total = 0

effect(() => {
  // total = product.price * product.quantity
  total = salePrice.value * product.quantity
})

effect(() => {
  salePrice.value = product.price * 0.9
})
console.log(`Before updated total (should be 10) = ${total} salePrice (should be 4.5) = ${salePrice.value}`)
product.quantity = 3
console.log(`After updated total (should be 15) = ${total} salePrice (should be 4.5) = ${salePrice.value}`)
product.price = 10
console.log(`After updated total (should be 27) = ${total} salePrice (should be 9) = ${salePrice.value}`)

// Save this code
// track(product, 'quantity')
// track(product, 'quantity')
// track(product, 'price')
// console.log(total)
// // Run this effect
// // effect()
// console.log(total)
// product.quantity = 3
// // Run all the code I've saved
// trigger(product, 'quantity')

// console.log(total)
