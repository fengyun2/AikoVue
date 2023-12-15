# @aikovue/reactivity


## 调试

- 1. 进入 `packages/reactivity` 目录
```bash
cd packages/reactivity
```
- 2. 在 `packages/reactivity/src/reactive.ts` 第 10 行添加 `debugger`
- 3. 执行 `pnpm debug:reactive`
- 4. 打开控制台，可以看到 `debugger` 断点

## 参考资料

- 1. [超详细Vue3响应式原理介绍+源码阅读](https://juejin.cn/post/7060428402431361032)
- 2. [Vue3相关原理梳理](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/02/04Vue3%E7%9B%B8%E5%85%B3%E5%8E%9F%E7%90%86%E6%A2%B3%E7%90%86.html)
- 3. [Debugging method 1: Run tsx directly from VSCode](https://www.npmjs.com/package/tsx)