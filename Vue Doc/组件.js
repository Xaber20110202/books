全局组件注册：

Vue.component('my-component', {
  // 选项
})

自定义标签名，不强制要求遵循 W3C规则 （小写，并且包含一个短杠），尽管遵循这个规则比较好。

组件在注册之后，便可以在父实例的模块中以自定义元素 <my-component></my-component> 的形式使用。

要确保在初始化根实例 之前 注册了组件：


<div id="example">
  <my-component></my-component>
</div>

// 注册
Vue.component('my-component', {
  template: '<div>A custom component!</div>'
})
// 创建根实例
new Vue({
  el: '#example'
})


局部注册：
不必在全局注册每个组件。通过使用组件实例选项注册，可以使组件仅在另一个实例/组件的作用域中可用：

var Child = {
  template: '<div>A custom component!</div>'
}
new Vue({
  // ...
  components: {
    // <my-component> 将只在父模板可用
    'my-component': Child
  }
})

data 必须是函数
为了避免组件间互相影响（组件根据具体情况，也可设计成单例的形式）

var data = { counter: 0 }
Vue.component('simple-counter', {
  template: '<button v-on:click="counter += 1">{{ counter }}</button>',
  // 技术上 data 的确是一个函数了，因此 Vue 不会警告，
  // 但是我们返回给每个组件的实例的却引用了同一个data对象
  data: function () {
    return data
  }
})
new Vue({
  el: '#example-2'
})


构成组件
在 Vue.js 中，父子组件的关系可以总结为 props down, events up 。父组件通过 props 向下传递数据给子组件，子组件通过 events 给父组件发送消息。看看它们是怎么工作的。


使用 Prop 传递数据

组件实例的作用域是孤立的。这意味着不能(也不应该)在子组件的模板内直接引用父组件的数据。要让子组件使用父组件的数据，我们需要通过子组件的props选项。

属性
camelCase vs. kebab-case
因为HTML 特性是不区分大小写的，所以会变成 kebab-case

动态 Prop
跟 data 的使用方式基本一致


单向数据流
prop 是单向绑定的：当父组件的属性变化时，将传导给子组件，但是不会反过来。这是为了防止子组件无意修改了父组件的状态——这会让应用的数据流难以理解。
另外，每次父组件更新时，子组件的所有 prop 都会更新为最新值。这意味着你不应该在子组件内部改变 prop 。如果你这么做了，Vue 会在控制台给出警告。

为什么我们会有修改prop中数据的冲动呢？通常是这两种原因：
1. 定义一个局部变量，并用 prop 的值初始化它：
props: ['initialCounter'],
data: function () {
  return { counter: this.initialCounter }
}

2. 定义一个计算属性，处理 prop 的值并返回。
props: ['size'],
computed: {
  normalizedSize: function () {
    return this.size.trim().toLowerCase()
  }
}

注意：在 JavaScript 中对象和数组是引用类型，指向同一个内存空间，如果 prop 是一个对象或数组，在子组件内部改变它会影响父组件的状态。

Prop 验证


自定义事件
我们知道，父组件是使用 props 传递数据给子组件，但如果子组件要把数据传递回去，应该怎样做？那就是自定义事件！

使用 $on(eventName) 监听事件
使用 $emit(eventName) 触发事件

父组件可以在使用子组件的地方直接用 v-on 来监听子组件触发的事件。

不能用$on侦听子组件抛出的事件，而必须在模板里直接用v-on绑定，就像以下的例子：
<div id="counter-event-example">
  <p>{{ total }}</p>
  <button-counter v-on:increment="incrementTotal"></button-counter>
  <button-counter v-on:increment="incrementTotal"></button-counter>
</div>
Vue.component('button-counter', {
  template: '<button v-on:click="increment">{{ counter }}</button>',
  data: function () {
    return {
      counter: 0
    }
  },
  methods: {
    increment: function () {
      this.counter += 1
      this.$emit('increment')
    }
  },
})
new Vue({
  el: '#counter-event-example',
  data: {
    total: 0
  },
  methods: {
    incrementTotal: function () {
      this.total += 1
    }
  }
})



给组件绑定原生事件
可以使用 .native 修饰 v-on 
<my-component v-on:click.native="doTheThing"></my-component>

自定义事件可以用来创建自定义的表单输入组件，使用 v-model 来进行数据双向绑定。看看这个：
<input v-model="something">
等于
<input v-bind:value="something" v-on:input="something = $event.target.value">
同样的
<custom-input v-bind:value="something" v-on:input="something = arguments[0]"></custom-input>

所以要让组件的 v-model 生效，它必须：
1. 接受一个 value 属性
2. 在有新的 value 时触发 input 事件

<currency-input v-model="price"></currency-input>
Vue.component('currency-input', {
  template: '\
    <span>\
      $\
      <input\
        ref="input"\
        v-bind:value="value"\
        v-on:input="updateValue($event.target.value)"\
      >\
    </span>\
  ',
  props: ['value'],
  methods: {
    // 不是直接更新值，而是使用此方法来对输入值进行格式化和位数限制
    updateValue: function (value) {
      var formattedValue = value
        // 删除两侧的空格符
        .trim()
        // 保留 2 小数位
        .slice(0, value.indexOf('.') + 3)
      // 如果值不统一，手动覆盖以保持一致
      if (formattedValue !== value) {
        this.$refs.input.value = formattedValue
      }
      // 通过 input 事件发出数值
      this.$emit('input', Number(formattedValue))
    }
  }
})


非父子组件通信

有时候两个组件也需要通信(非父子关系)。在简单的场景下，可以使用一个空的 Vue 实例作为中央事件总线：
var bus = new Vue()
// 触发组件 A 中的事件
bus.$emit('id-selected', 1)
// 在组件 B 创建的钩子中监听事件
bus.$on('id-selected', function (id) {
  // ...
})


