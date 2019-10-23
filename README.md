# 原生小程序状态管理: mpsm

**具备vue+react开发体验**

将[dva](https://dvajs.com/ "dva")的models状态管理模式，react数据批量更新的特点，以及vue的watch和computed特性，全部封装为一个小程序的状态管理库，不仅实现了小程序的**全局状态管理**，解决跨页通信，还引入了**圈子**概念，来实现组件间的数据传递，弥补原生小程序组件系统的先天缺陷，摆脱各种父子、兄弟、姐妹、街坊邻居、七大姑八大姨、远方表兄弟等等组件间的通信浆糊困扰。


## 数据流
不管是页面间，还是组件间，嵌套组件内部，都可以通过简单的dispach来管理全局状态或圈子状态（局部）。
![数据流](https://user-gold-cdn.xitu.io/2019/10/24/16df9a1edd38f465?imageView2/2/w/480/h/480/q/85/interlace/1 "数据流")


## 使用介绍
完全兼容原生代码，已有的业务逻辑代码，即便不适配也可使用此库，不影响已有业务逻辑。
### 小尾巴
**小**：即只需将Page、Component首字母小写。
**尾巴**：即尾部多调用一次：
```javascript
page({ //component
	// ...
})()

```

#### 页面注册、组件注册示例
```javascript
import {dispatch, page, component} from '../../mpsm/index

page({ // 或者 component
	watch: {
		isLogin(newState, oldState) {
			console.log(newState, oldState)
		}
	},
	computed: {
		countComputed(data) {
			return data.count * 2
		}
	}
	data:{
		count: 0
	},
	onLoad(){},
	login() {
		dispatch({
			type: 'userInfo/save',
			payload: {
				isLogin: true
			}
		})
	}，
	localState() {
		this.dispatch({
			type: 'group/nameA',
			payload: {
				name: 'A_component'
			}
		})
	}
})(({userInfo}) => {//订阅全局状态
	return {
		isLogin: userInfo.isLogin
	}
}, (groups) => {//订阅局部状态
	return {
		nameA: groups.nameA && groups.nameA.name || '--'
	}
})
```

##### tips:
1. dispatch用于分发全局状态，风格与dva保持一致；
2. Page和Component实例内置this.dispatch方法，用于分发局部状态。


### 绘制表格 Tables

| 项目        | 价格   |  数量  |
| --------   | -----:  | :----:  |
| 计算机      | $1600   |   5     |
| 手机        |   $12   |   12   |
| 管线        |    $1    |  234  |

