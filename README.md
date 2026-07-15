# 语言选择 / Language

- [中文版](#chinese-version)
- [English Version](#english-version)

---

## <a id="chinese-version"></a>中文版

# 🗺️ ChinaEx - 制省等级

> 记录你走过的中国每一个省份

一个简洁优雅的中国省份足迹记录工具，灵感来源于 [JapanEx](https://github.com/ukyouz/JapanEx)。

![preview](https://img.shields.io/badge/省份-34个-blue) ![license](https://img.shields.io/badge/license-MIT-green)

## ✨ 功能特性

- 🎨 **交互式地图** - 点击省份即可设置等级
- 💾 **自动保存** - 数据存储在本地，刷新不丢失
- 🔗 **分享链接** - 通过 URL 分享你的足迹给朋友
- 📸 **导出图片** - 一键生成精美的足迹图片
- 📱 **响应式设计** - 支持桌面和移动设备
- 🏷️ **自定义名字** - 在图片上显示你的名字

## 🎯 等级说明

| 颜色 | 等级 | 说明 |
|:---:|:---:|:---|
| 🔴 | 常驻 | 曾居住（3个月以上） |
| 🟠 | 宿泊 | 曾过夜（3个月以下） |
| 🟡 | 访问 | 曾游玩（未住宿） |
| 🟢 | 歇脚 | 曾换乘、休息 |
| 🔵 | 行径 | 曾路过 |
| ⚪ | 未履 | 从未涉足 |

## 🚀 快速开始

### 在线使用

直接打开 `index.html` 文件即可使用。

### 本地部署

```bash
# 克隆仓库
git clone https://github.com/SaiOogcn/ChinaEx.git

# 进入目录
cd ChinaEx

# 使用 Python 启动本地服务器
python -m http.server 8080

# 或使用 Node.js
npx serve
```

然后在浏览器中访问 `http://localhost:8080`

## 📖 使用方法

1. **设置等级** - 点击地图上的任意省份，在弹出菜单中选择对应等级
2. **设置名字** - 点击左上角 "点击设置名字" 输入你的名字
3. **保存图片** - 点击右上角 "保存图片" 按钮导出足迹图
4. **分享链接** - 直接复制浏览器地址栏的 URL 分享给朋友
5. **重置数据** - 点击 "重置" 按钮清空所有记录

## 📁 项目结构

```
ChinaEx/
├── index.html      # 主页面
├── main.css        # 样式文件
├── main.js         # 交互逻辑
├── path.txt        # 省份地图路径数据
└── README.md       # 说明文档
```

## 🛠️ 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式与动画
- **Vanilla JavaScript** - 无框架依赖
- **SVG** - 矢量地图渲染
- **LocalStorage** - 本地数据持久化
- **Canvas API** - 图片导出

## 📝 自定义

### 修改颜色

编辑 `main.css` 中的等级颜色：

```css
.province.red { fill: #e84c3d; }    /* 常驻 */
.province.orange { fill: #d58337; } /* 宿泊 */
.province.yellow { fill: #f3c218; } /* 访问 */
.province.green { fill: #30cc70; }  /* 歇脚 */
.province.blue { fill: #3598db; }   /* 行径 */
.province.white { fill: #ffffff; }  /* 未履 */
```

### 修改背景色

编辑 `main.css` 中的 `body` 背景：

```css
html, body {
    background: #9dc3fb; /* 修改这里 */
}
```

## 🙏 致谢

- [JapanEx](https://github.com/ukyouz/JapanEx) - 项目灵感来源
- 地图数据来源于公开资源

## 📄 License

MIT License © 2024

<p align="center">
  <b>用脚步丈量中国 🇨🇳</b>
</p>

---

## <a id="english-version"></a>English Version

# 🗺️ ChinaEx - Province Tracker

> Track every province you have visited in China.

A clean and elegant China province travel-footprint tracker, inspired by [JapanEx](https://github.com/ukyouz/JapanEx).

![preview](https://img.shields.io/badge/Provinces-34-blue) ![license](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🎨 **Interactive Map** - Click a province to set its level
- 💾 **Auto Save** - Data is stored locally and persists after refresh
- 🔗 **Shareable Link** - Share your footprint with friends via URL
- 📸 **Image Export** - Generate a beautiful footprint image in one click
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🏷️ **Custom Name** - Display your name on the exported image

## 🎯 Level Definitions

| Color | Level | Description |
|:---:|:---:|:---|
| 🔴 | Resident | Lived there (more than 3 months) |
| 🟠 | Stayed | Stayed overnight (up to 3 months) |
| 🟡 | Visited | Traveled there without staying overnight |
| 🟢 | Stopover | Transferred or took a short rest there |
| 🔵 | Passed Through | Passed through only |
| ⚪ | Not Visited | Never been there |

## 🚀 Quick Start

### Use Online

Open `index.html` directly to use the app.

### Run Locally

```bash
# Clone repository
git clone https://github.com/SaiOogcn/ChinaEx.git

# Enter directory
cd ChinaEx

# Start a local server with Python
python -m http.server 8080

# Or use Node.js
npx serve
```

Then open `http://localhost:8080` in your browser.

## 📖 How to Use

1. **Set Level** - Click any province on the map and choose a level from the popup
2. **Set Name** - Click the name button in the top-left corner to enter your name
3. **Save Image** - Click the "Save Image" button in the top-right corner to export
4. **Share Link** - Copy the URL in the browser address bar and send it to friends
5. **Reset Data** - Click "Reset" to clear all records

## 📁 Project Structure

```
ChinaEx/
├── index.html      # Main page
├── main.css        # Styles
├── main.js         # Interaction logic
├── path.txt        # Province map path data
└── README.md       # Documentation
```

## 🛠️ Tech Stack

- **HTML5** - Page structure
- **CSS3** - Styling and animations
- **Vanilla JavaScript** - No framework dependency
- **SVG** - Vector map rendering
- **LocalStorage** - Local data persistence
- **Canvas API** - Image export

## 📝 Customization

### Change Colors

Edit the level colors in `main.css`:

```css
.province.red { fill: #e84c3d; }    /* Resident */
.province.orange { fill: #d58337; } /* Stayed */
.province.yellow { fill: #f3c218; } /* Visited */
.province.green { fill: #30cc70; }  /* Stopover */
.province.blue { fill: #3598db; }   /* Passed Through */
.province.white { fill: #ffffff; }  /* Not Visited */
```

### Change Background Color

Edit the `body` background in `main.css`:

```css
html, body {
    background: #9dc3fb; /* Change here */
}
```

## 🙏 Acknowledgements

- [JapanEx](https://github.com/ukyouz/JapanEx) - Project inspiration
- Map data comes from public resources

## 📄 License

MIT License © 2024

<p align="center">
  <b>Measure China with your footsteps 🇨🇳</b>
</p>
