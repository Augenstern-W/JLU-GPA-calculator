export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/guide/index',
    'pages/mine/index'
  ],
  tabBar: {
    color: '#999999',
    selectedColor: '#003f95',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '计算',
        iconPath: 'assets/tabbar/calc.png',
        selectedIconPath: 'assets/tabbar/calc-selected.png'
      },
      {
        pagePath: 'pages/guide/index',
        text: '指南',
        iconPath: 'assets/tabbar/guide.png',
        selectedIconPath: 'assets/tabbar/guide-selected.png'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: 'assets/tabbar/mine.png',
        selectedIconPath: 'assets/tabbar/mine-selected.png'
      }
    ]
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#003f95',
    navigationBarTitleText: '吉大绩点计算器',
    navigationBarTextStyle: 'white'
  },
  lazyCodeLoading: 'requiredComponents'
})
