/**
 * ChinaEx 制省等级 - JavaScript 逻辑
 * 使用 flood fill 掩膜进行点击检测和颜色填充
 */

(function() {
    'use strict';

    // 颜色配置
    const colors = {
        'red': '#e84c3d',
        'orange': '#d58337', 
        'yellow': '#f3c218',
        'green': '#30cc70',
        'blue': '#3598db',
        'white': '#ffffff'
    };

    // 地区数据 - 所有省份
    const areas = {
        '新疆': { level: 0, name: '新疆' },
        '西藏': { level: 0, name: '西藏' },
        '青海': { level: 0, name: '青海' },
        '甘肃': { level: 0, name: '甘肃' },
        '内蒙古': { level: 0, name: '内蒙古' },
        '黑龙江': { level: 0, name: '黑龙江' },
        '吉林': { level: 0, name: '吉林' },
        '辽宁': { level: 0, name: '辽宁' },
        '宁夏': { level: 0, name: '宁夏' },
        '陕西': { level: 0, name: '陕西' },
        '山西': { level: 0, name: '山西' },
        '河北': { level: 0, name: '河北' },
        '山东': { level: 0, name: '山东' },
        '河南': { level: 0, name: '河南' },
        '江苏': { level: 0, name: '江苏' },
        '安徽': { level: 0, name: '安徽' },
        '湖北': { level: 0, name: '湖北' },
        '四川': { level: 0, name: '四川' },
        '重庆': { level: 0, name: '重庆' },
        '湖南': { level: 0, name: '湖南' },
        '江西': { level: 0, name: '江西' },
        '浙江': { level: 0, name: '浙江' },
        '福建': { level: 0, name: '福建' },
        '贵州': { level: 0, name: '贵州' },
        '云南': { level: 0, name: '云南' },
        '广西': { level: 0, name: '广西' },
        '广东': { level: 0, name: '广东' },
        '台湾': { level: 0, name: '台湾' },
        '海南': { level: 0, name: '海南' },
        '香港': { level: 0, name: '香港' },
        '澳门': { level: 0, name: '澳门' },
        '北京': { level: 0, name: '北京' },
        '天津': { level: 0, name: '天津' },
        '上海': { level: 0, name: '上海' }
    };

    // 掩膜与填充
    const viewBox = { minX: -11.1, minY: -3.1, width: 47.2, height: 39.2 };
    let maskCanvas, maskCtx, colorCanvas, colorCtx, maskData, maskStrokeWidth = 3;
    
    // 种子点 - 每个省份内部的一个点，用于 flood fill
    const seeds = {
        '新疆': [-4.5, 7.5],
        '西藏': [-2.5, 18.5],
        '青海': [6.0, 15.5],
        '甘肃': [10.0, 10.5],
        '宁夏': [20.5, 15.5],
        '内蒙古': [18.0, 6.0],
        '黑龙江': [31.5, 3.0],
        '吉林': [30.0, 8.5],
        '辽宁': [28.5, 14.0],
        '河北': [23.5, 15.0],
        '北京': [24.5, 12.5],
        '天津': [25.5, 11.5],
        '山西': [18.5, 18.0],
        '陕西': [15.0, 18.5],
        '山东': [26.5, 19.0],
        '河南': [21.5, 20.0],
        '江苏': [25.0, 22.0],
        '安徽': [21.0, 23.0],
        '上海': [26.8, 24.5],
        '浙江': [25.0, 27.0],
        '福建': [24.0, 30.0],
        '江西': [20.0, 27.5],
        '湖北': [17.5, 23.5],
        '湖南': [16.5, 27.0],
        '广东': [23.0, 30.0],
        '广西': [10.0, 30.0],
        '海南': [18.5, 35.0],
        '四川': [10.5, 22.0],
        '重庆': [17.5, 22.5],
        '贵州': [16.0, 27.5],
        '云南': [2.0, 22.0],
        '台湾': [30.0, 30.0],
        '香港': [23.5, 31.5],
        '澳门': [21.5, 32.5]
    };

    // 网站标题
    const siteTitle = document.title;
    let currentTarget = null;

    /**
     * 初始化
     */
    function init() {
        // 准备画布
        setupCanvas();

        // 从URL hash恢复状态
        loadStateFromHash();
        
        // 从URL参数获取作者名
        loadAuthorFromQuery();
        
        // 绑定事件
        bindEvents();
        
        // 计算等级并渲染颜色
        calculate();
        renderColors();
    }

    /**
     * 画布初始化与掩膜构建
     */
    function setupCanvas() {
        colorCanvas = document.getElementById('colorCanvas');
        maskCanvas = document.getElementById('maskCanvas');
        colorCtx = colorCanvas.getContext('2d');
        maskCtx = maskCanvas.getContext('2d');

        // 依据父容器大小设置
        const wrapper = document.querySelector('.map-wrapper');
        const width = wrapper.clientWidth;
        const height = wrapper.clientHeight;
        colorCanvas.width = width;
        colorCanvas.height = height;
        maskCanvas.width = width;
        maskCanvas.height = height;

        // 绘制边界到掩膜
        maskCtx.clearRect(0, 0, width, height);
        maskCtx.strokeStyle = '#000';
        // 线宽随分辨率放大，尽量封闭缝隙，防止一个种子淹没全图
        const lineWidth = Math.max(width, height) * 0.012;
        maskStrokeWidth = lineWidth;
        maskCtx.lineWidth = lineWidth;
        maskCtx.lineJoin = 'round';
        maskCtx.lineCap = 'round';
        
        const pathD = document.getElementById('main-path').getAttribute('d');
        const p = new Path2D(pathD);
        
        // 将 viewBox 坐标映射到 canvas
        maskCtx.save();
        const scaleX = width / viewBox.width;
        const scaleY = height / viewBox.height;
        maskCtx.scale(scaleX, scaleY);
        maskCtx.translate(-viewBox.minX, -viewBox.minY);
        // 画两遍，进一步加粗闭合
        maskCtx.stroke(p);
        maskCtx.stroke(p);
        maskCtx.restore();

        // 区域填充标签
        buildMaskLabels();
    }

    /**
     * 为每个省通过 flood fill 打标签
     */
    function buildMaskLabels() {
        const width = maskCanvas.width;
        const height = maskCanvas.height;
        const img = maskCtx.getImageData(0, 0, width, height);
        const data = img.data;

        // 辅助函数：像素索引
        const idx = (x, y) => (y * width + x) * 4;

        // 获取颜色，使用唯一R值编码
        let currentId = 1;
        const areaIdMap = {};
        const searchRadius = Math.max(4, Math.ceil(maskStrokeWidth * 2));
        
        for (const key in seeds) {
            const [sx, sy] = worldToCanvas(seeds[key][0], seeds[key][1], width, height);
            const seedX = Math.round(sx);
            const seedY = Math.round(sy);
            let placed = false;
            
            // 尝试在种子点附近找到一个空白像素
            for (let r = 0; r <= searchRadius && !placed; r++) {
                for (let dx = -r; dx <= r && !placed; dx++) {
                    const dyList = [r, -r];
                    for (const dy of dyList) {
                        const px = seedX + dx;
                        const py = seedY + dy;
                        if (px < 0 || py < 0 || px >= width || py >= height) continue;
                        const targetIndex = idx(px, py);
                        if (data[targetIndex] !== 0) continue;
                        floodFill(data, width, height, px, py, [0, 0, 0, 0], [currentId, 0, 0, 255]);
                        areaIdMap[currentId] = key;
                        currentId++;
                        placed = true;
                        break;
                    }
                }
                for (let dy = -r; dy <= r && !placed; dy++) {
                    const dxList = [r, -r];
                    for (const dx of dxList) {
                        const px = seedX + dx;
                        const py = seedY + dy;
                        if (px < 0 || py < 0 || px >= width || py >= height) continue;
                        const targetIndex = idx(px, py);
                        if (data[targetIndex] !== 0) continue;
                        floodFill(data, width, height, px, py, [0, 0, 0, 0], [currentId, 0, 0, 255]);
                        areaIdMap[currentId] = key;
                        currentId++;
                        placed = true;
                        break;
                    }
                }
            }
            if (!placed) {
                console.warn('seed failed for', key);
            }
        }
        maskCtx.putImageData(img, 0, 0);
        maskData = { img, areaIdMap };
    }

    /**
     * 简易 flood fill
     */
    function floodFill(data, width, height, x, y, target, replace) {
        const idx = (x, y) => (y * width + x) * 4;
        const match = (i) => data[i] === target[0] && data[i + 1] === target[1] && data[i + 2] === target[2] && data[i + 3] === target[3];
        const set = (i) => {
            data[i] = replace[0];
            data[i + 1] = replace[1];
            data[i + 2] = replace[2];
            data[i + 3] = replace[3];
        };
        const stack = [[x, y]];
        while (stack.length) {
            const [cx, cy] = stack.pop();
            if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue;
            const i = idx(cx, cy);
            if (!match(i)) continue;
            set(i);
            stack.push([cx + 1, cy]);
            stack.push([cx - 1, cy]);
            stack.push([cx, cy + 1]);
            stack.push([cx, cy - 1]);
        }
    }

    /**
     * 世界坐标 -> 画布像素
     */
    function worldToCanvas(x, y, width, height) {
        const sx = (x - viewBox.minX) / viewBox.width * width;
        const sy = (y - viewBox.minY) / viewBox.height * height;
        return [sx, sy];
    }

    /**
     * 根据 mask 重绘颜色层
     */
    function renderColors() {
        if (!maskData) return;
        const width = colorCanvas.width;
        const height = colorCanvas.height;
        const out = colorCtx.createImageData(width, height);
        const src = maskData.img.data;
        const dst = out.data;
        const idToArea = maskData.areaIdMap;

        for (let i = 0; i < src.length; i += 4) {
            const id = src[i];
            if (!id) continue;
            const name = idToArea[id];
            const level = areas[name]?.level ?? 0;
            const color = colors[getColor(level)];
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            dst[i] = r;
            dst[i + 1] = g;
            dst[i + 2] = b;
            dst[i + 3] = 200; // 半透明
        }
        colorCtx.putImageData(out, 0, 0);
    }

    /**
     * 从URL hash加载状态
     */
    function loadStateFromHash() {
        if (window.location.hash) {
            const hash = window.location.hash.substring(1);
            let i = 0;
            for (const id in areas) {
                if (hash[i] !== undefined) {
                    areas[id].level = parseInt(hash[i]) || 0;
                }
                i++;
            }
        }
    }

    /**
     * 从URL参数加载作者名
     */
    function loadAuthorFromQuery() {
        const params = parseQuery();
        if (params.t) {
            const authorElem = document.getElementById('author');
            if (authorElem) {
                authorElem.textContent = params.t;
            }
        }
    }

    /**
     * 绑定事件
     */
    function bindEvents() {
        // 点击地区 - 通过透明点击层
        const clickLayer = document.getElementById('clickLayer');
        clickLayer.addEventListener('click', function(e) {
            const pt = getRelativePosition(e);
            const areaName = pickArea(pt.x, pt.y);
            if (areaName) {
                currentTarget = { id: areaName };
                showForm({ id: areaName });
            }
        });

        document.addEventListener('click', function(e) {
            const target = e.target;
            
            // 点击等级标签
            if (target.classList.contains('level')) {
                const value = parseInt(target.dataset.value) || 0;
                if (currentTarget) {
                    setLevel(currentTarget, value);
                    calculate();
                }
                closeForm();
                return;
            }
            
            // 点击关闭按钮
            if (target.id === 'close' || target.closest('#close')) {
                closeForm();
                return;
            }
            
            // 点击保存图片按钮
            if (target.id === 'saveAsImage' || target.closest('#saveAsImage')) {
                saveAsImage();
                return;
            }
            
            // 点击设置名字按钮
            if (target.id === 'setName' || target.closest('#setName')) {
                setAuthor();
                return;
            }
            
            // 点击作者名
            if (target.id === 'author') {
                setAuthor();
                return;
            }
            
            // 点击其他地方关闭表单
            if (!target.closest('#form')) {
                closeForm();
            }
        });
    }

    /**
     * 将鼠标位置转换为画布像素
     */
    function getRelativePosition(e) {
        const rect = colorCanvas.getBoundingClientRect();
        const x = Math.round((e.clientX - rect.left) * (colorCanvas.width / rect.width));
        const y = Math.round((e.clientY - rect.top) * (colorCanvas.height / rect.height));
        return { x, y };
    }

    /**
     * 读取掩膜像素确定省份
     */
    function pickArea(x, y) {
        if (!maskData) return null;
        const { img, areaIdMap } = maskData;
        const idx = (y * img.width + x) * 4;
        if (idx < 0 || idx >= img.data.length) return null;
        const id = img.data[idx];
        return areaIdMap[id] || null;
    }

    /**
     * 显示等级选择表单
     */
    function showForm(elem) {
        const form = document.getElementById('form');
        const svgRect = document.getElementById('svg').getBoundingClientRect();
        const rect = elem.getBoundingClientRect ? elem.getBoundingClientRect() : svgRect;
        
        // 设置标题
        const titleLang = form.querySelector('.title .lang');
        titleLang.textContent = areas[elem.id].name || elem.id;
        
        // 设置搜索链接
        const searchLink = form.querySelector('.title .search');
        const searchQuery = '中国 ' + (areas[elem.id].name || elem.id) + ' 旅游景点';
        searchLink.href = 'https://www.baidu.com/s?wd=' + encodeURIComponent(searchQuery);
        
        // 计算位置
        let left = rect.left + rect.width / 2;
        let top = rect.top + rect.height / 2;
        
        // 确保表单不超出屏幕
        const formWidth = 180;
        const formHeight = 250;
        
        if (left + formWidth > window.innerWidth) {
            left = window.innerWidth - formWidth - 10;
        }
        if (top + formHeight > window.innerHeight) {
            top = window.innerHeight - formHeight - 10;
        }
        if (left < 10) left = 10;
        if (top < 10) top = 10;
        
        form.style.left = left + 'px';
        form.style.top = top + 'px';
        
        // 标记当前选中的等级
        form.querySelectorAll('.level').forEach(label => {
            label.classList.remove('selected');
        });
        
        const currentLevel = areas[elem.id].level || 0;
        const currentColor = getColor(currentLevel);
        const selectedLabel = form.querySelector('.level.' + currentColor);
        if (selectedLabel) {
            selectedLabel.classList.add('selected');
        }
        
        form.classList.add('show');
    }

    /**
     * 关闭表单
     */
    function closeForm() {
        const form = document.getElementById('form');
        form.classList.remove('show');
        form.querySelectorAll('.level').forEach(label => {
            label.classList.remove('selected');
        });
    }

    /**
     * 设置区域等级
     */
    function setLevel(elem, level) {
        if (!elem || !areas[elem.id]) return;

        areas[elem.id].level = level;
        renderColors();
    }

    /**
     * 根据等级获取颜色名称
     */
    function getColor(level) {
        switch (parseInt(level)) {
            case 5: return 'red';
            case 4: return 'orange';
            case 3: return 'yellow';
            case 2: return 'green';
            case 1: return 'blue';
            default: return 'white';
        }
    }

    /**
     * 计算总等级
     */
    function calculate() {
        let totalLevel = 0;
        let hash = '';
        
        for (const id in areas) {
            totalLevel += parseInt(areas[id].level) || 0;
            hash += areas[id].level || 0;
        }
        
        // 更新显示
        const levelText = document.getElementById('level-text');
        if (levelText) {
            levelText.textContent = totalLevel;
        }
        
        const svgLevel = document.getElementById('level');
        if (svgLevel) {
            svgLevel.textContent = 'Level: ' + totalLevel;
        }
        
        // 更新URL hash
        const title = totalLevel ? siteTitle + ' - Level ' + totalLevel : siteTitle;
        history.replaceState(undefined, title, '#' + hash);

        renderColors();
        
        return totalLevel;
    }

    /**
     * 保存为图片
     */
    function saveAsImage() {
        const svg = document.getElementById('svg');

        // 统一尺寸
        const width = colorCanvas.width;
        const height = colorCanvas.height;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        // 先绘制背景
        ctx.fillStyle = '#9dc3fb';
        ctx.fillRect(0, 0, width, height);

        // 绘制彩色层
        ctx.drawImage(colorCanvas, 0, 0, width, height);

        // 绘制边界 SVG
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0, width, height);

            const link = document.createElement('a');
            link.download = 'ChinaEx_Level_' + calculate() + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            URL.revokeObjectURL(url);
        };
        img.src = url;
    }

    /**
     * 设置作者名
     */
    function setAuthor() {
        const params = parseQuery();
        const currentName = params.t || '';
        const newName = prompt('请输入您想要显示的名字：', currentName);
        
        if (newName !== null) {
            if (newName) {
                window.location.search = 't=' + encodeURIComponent(newName);
            } else {
                window.location.search = '';
            }
        }
    }

    /**
     * 解析URL查询参数
     */
    function parseQuery() {
        const params = {};
        const search = window.location.search.substring(1).split('&');
        
        search.forEach(function(val) {
            const query = val.split('=');
            if (query.length === 2) {
                params[query[0]] = decodeURIComponent(query[1]);
            }
        });
        
        return params;
    }

    // 页面加载完成后初始化
    window.onload = init;
    window.onresize = () => {
        setupCanvas();
        renderColors();
    };

})();
