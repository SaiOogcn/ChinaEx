/**
 * ChinaEx - 制省等级
 * 记录你走过的中国每一个省份
 */
(function() {
    'use strict';

    // 存储键名
    var STORAGE_KEY = "chinaex-levels";
    
    // 等级颜色列表（从低到高）
    var LEVEL_COLORS = ["white", "blue", "green", "yellow", "orange", "red"];
    
    // 颜色对应分数
    var COLOR_SCORE = {
        white: 0,
        blue: 1,
        green: 2,
        yellow: 3,
        orange: 4,
        red: 5
    };
    
    // 颜色对应的中文描述
    var COLOR_DESC = {
        white: "未踏",
        blue: "经过",
        green: "到达",
        yellow: "访问",
        orange: "住宿",
        red: "居住"
    };
    
    // 当前选中的省份
    var currentProvince = null;
    
    // 省份等级数据
    var provinceLevels = {};
    
    // DOM 元素引用
    var form, formTitle, svg;

    /**
     * 初始化应用
     */
    function init() {
        form = document.querySelector(".form");
        formTitle = form.querySelector(".title .name");
        svg = document.getElementById("svg");
        
        loadLevels();
        loadAuthorFromQuery();
        bindEvents();
        renderAllLevels();
        calculate();
    }

    /**
     * 从 URL hash 或 localStorage 加载等级数据
     */
    function loadLevels() {
        // 优先从 URL hash 加载
        if (window.location.hash && window.location.hash.length > 1) {
            var hash = window.location.hash.substring(1);
            var provinces = document.querySelectorAll(".province");
            var i = 0;
            provinces.forEach(function(p) {
                if (hash[i] !== undefined) {
                    var level = parseInt(hash[i]) || 0;
                    provinceLevels[p.id] = levelToColor(level);
                }
                i++;
            });
            return;
        }
        
        // 从 localStorage 加载
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                provinceLevels = JSON.parse(saved);
            }
        } catch (e) {
            provinceLevels = {};
        }
    }

    /**
     * 保存等级数据到 localStorage 和 URL hash
     */
    function saveLevels() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(provinceLevels));
        } catch (e) {
            console.warn("无法保存到 localStorage");
        }
        updateHash();
    }

    /**
     * 更新 URL hash
     */
    function updateHash() {
        var provinces = document.querySelectorAll(".province");
        var hash = "";
        provinces.forEach(function(p) {
            var color = provinceLevels[p.id] || "white";
            hash += COLOR_SCORE[color] || 0;
        });
        history.replaceState(null, "", "#" + hash);
    }

    /**
     * 将等级数字转换为颜色名称
     */
    function levelToColor(level) {
        var idx = Math.min(Math.max(0, level), 5);
        return LEVEL_COLORS[idx];
    }

    /**
     * 渲染所有省份的等级颜色
     */
    function renderAllLevels() {
        var provinces = document.querySelectorAll(".province");
        provinces.forEach(function(province) {
            var color = provinceLevels[province.id] || "white";
            LEVEL_COLORS.forEach(function(c) {
                province.classList.remove(c);
            });
            province.classList.add(color);
        });
    }

    /**
     * 设置省份等级
     */
    function setProvinceLevel(provinceName, color) {
        provinceLevels[provinceName] = color;
        saveLevels();
        
        var province = document.getElementById(provinceName);
        if (province) {
            LEVEL_COLORS.forEach(function(c) {
                province.classList.remove(c);
            });
            province.classList.add(color);
        }
        calculate();
    }

    /**
     * 绑定事件监听器
     */
    function bindEvents() {
        // 省份点击事件
        document.querySelectorAll(".province").forEach(function(province) {
            province.addEventListener("click", function(e) {
                e.stopPropagation();
                showForm(this.id, e.clientX, e.clientY);
            });
        });
        
        // 省份标签点击事件（可选）
        document.querySelectorAll("#label text").forEach(function(label) {
            label.addEventListener("click", function(e) {
                e.stopPropagation();
                var place = this.getAttribute("data-place");
                if (place) {
                    showForm(place, e.clientX, e.clientY);
                }
            });
        });
        
        // 等级选择事件
        form.querySelectorAll(".level").forEach(function(label) {
            label.addEventListener("click", function(e) {
                e.stopPropagation();
                var color = this.dataset.level;
                if (currentProvince && color) {
                    setProvinceLevel(currentProvince, color);
                    updateFormSelection(color);
                }
            });
        });
        
        // 关闭按钮事件
        var closeBtn = form.querySelector(".close-btn");
        if (closeBtn) {
            closeBtn.addEventListener("click", function(e) {
                e.stopPropagation();
                closeForm();
            });
        }
        
        // 点击其他区域关闭表单
        document.addEventListener("click", function(e) {
            if (!form.contains(e.target) && !e.target.classList.contains("province")) {
                closeForm();
            }
        });
        
        // 重置按钮
        var resetBtn = document.getElementById("btn-reset");
        if (resetBtn) {
            resetBtn.addEventListener("click", resetAll);
        }
        
        // 保存图片按钮
        var shareBtn = document.getElementById("btn-share");
        if (shareBtn) {
            shareBtn.addEventListener("click", saveAsImage);
        }
        
        // 设置名字按钮
        var nameBtn = document.getElementById("btn-name");
        if (nameBtn) {
            nameBtn.addEventListener("click", setAuthor);
        }
        
        // 作者区域点击
        var author = document.getElementById("author");
        if (author) {
            author.addEventListener("click", setAuthor);
        }
        
        // 键盘事件
        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape") {
                closeForm();
            }
        });
    }

    /**
     * 显示选择表单
     */
    function showForm(provinceName, x, y) {
        currentProvince = provinceName;
        formTitle.textContent = provinceName;
        
        // 更新搜索链接
        var searchLink = form.querySelector(".title .search");
        if (searchLink) {
            searchLink.href = "https://www.baidu.com/s?wd=" + encodeURIComponent(provinceName + " 旅游景点");
        }
        
        // 更新选中状态
        var currentColor = provinceLevels[provinceName] || "white";
        updateFormSelection(currentColor);
        
        // 计算位置
        var left = x + 15;
        var top = y + 15;
        
        // 边界检测
        if (left + 220 > window.innerWidth) {
            left = x - 235;
        }
        if (top + 320 > window.innerHeight) {
            top = y - 320;
        }
        left = Math.max(10, left);
        top = Math.max(10, top);
        
        form.style.left = left + "px";
        form.style.top = top + "px";
        form.classList.add("show");
    }

    /**
     * 更新表单中的选中状态
     */
    function updateFormSelection(color) {
        form.querySelectorAll(".level").forEach(function(label) {
            label.classList.remove("selected");
            if (label.dataset.level === color) {
                label.classList.add("selected");
            }
        });
    }

    /**
     * 关闭选择表单
     */
    function closeForm() {
        form.classList.remove("show");
        currentProvince = null;
    }

    /**
     * 计算总等级分数
     */
    function calculate() {
        var totalLevel = 0;
        var visitedCount = 0;
        
        for (var key in provinceLevels) {
            var score = COLOR_SCORE[provinceLevels[key]] || 0;
            totalLevel += score;
            if (score > 0) {
                visitedCount++;
            }
        }
        
        var levelEl = document.getElementById("level");
        if (levelEl) {
            levelEl.textContent = totalLevel;
        }
        
        // 更新页面标题
        document.title = "制省等级 - Level " + totalLevel;
        
        return totalLevel;
    }

    /**
     * 重置所有省份等级
     */
    function resetAll() {
        if (confirm("确定要重置所有省份的等级吗？此操作不可撤销。")) {
            provinceLevels = {};
            saveLevels();
            renderAllLevels();
            calculate();
            closeForm();
        }
    }

    /**
     * 从 URL 参数加载作者名
     */
    function loadAuthorFromQuery() {
        var params = new URLSearchParams(window.location.search);
        var name = params.get("t");
        if (name) {
            var authorEl = document.getElementById("author");
            if (authorEl) {
                authorEl.textContent = name;
            }
        }
    }

    /**
     * 设置作者名
     */
    function setAuthor() {
        var params = new URLSearchParams(window.location.search);
        var currentName = params.get("t") || "";
        var newName = prompt("请输入您想要显示的名字：", currentName);
        
        if (newName !== null) {
            if (newName.trim()) {
                params.set("t", newName.trim());
            } else {
                params.delete("t");
            }
            
            var newUrl = window.location.pathname;
            if (params.toString()) {
                newUrl += "?" + params.toString();
            }
            if (window.location.hash) {
                newUrl += window.location.hash;
            }
            window.history.replaceState(null, "", newUrl);
            
            var authorEl = document.getElementById("author");
            if (authorEl) {
                authorEl.textContent = newName.trim() || "点击设置名字";
            }
        }
    }

    /**
     * 保存为图片
     */
    function saveAsImage() {
        var svgElement = document.getElementById("svg");
        
        // 克隆 SVG
        var svgClone = svgElement.cloneNode(true);
        
        // 内联样式到 SVG（解决导出时样式丢失问题）
        var styleElement = document.createElementNS("http://www.w3.org/2000/svg", "style");
        styleElement.textContent = `
            .province { stroke: #666; stroke-width: 0.15; }
            .province.white { fill: #ffffff; }
            .province.blue { fill: #3598db; }
            .province.green { fill: #30cc70; }
            .province.yellow { fill: #f3c218; }
            .province.orange { fill: #d58337; }
            .province.red { fill: #e84c3d; }
            #label text, .labels text { font-size: 0.8px; fill: #333; font-family: sans-serif; font-weight: 700; text-anchor: middle; dominant-baseline: middle; }
            text { font-size: 0.8px; fill: #333; font-family: sans-serif; font-weight: 700; text-anchor: middle; dominant-baseline: middle; }
        `;
        svgClone.insertBefore(styleElement, svgClone.firstChild);
        
        // 设置 SVG 尺寸属性（确保正确渲染）
        svgClone.setAttribute("width", "800");
        svgClone.setAttribute("height", "700");
        
        // 获取 SVG 数据
        var svgData = new XMLSerializer().serializeToString(svgClone);
        var svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        var url = URL.createObjectURL(svgBlob);
        
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var img = new Image();
        
        img.onload = function() {
            // 设置画布尺寸（增加上下空间给标题和图例）
            var headerHeight = 70;
            var footerHeight = 50;
            var mapWidth = 800;
            var mapHeight = 700;
            canvas.width = mapWidth;
            canvas.height = headerHeight + mapHeight + footerHeight;
            
            // 绘制背景
            ctx.fillStyle = "#9dc3fb";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 绘制地图（偏移到标题下方）
            ctx.drawImage(img, 0, headerHeight, mapWidth, mapHeight);
            
            // 绘制顶部背景条（纯色，不透明）
            ctx.fillStyle = "#9dc3fb";
            ctx.fillRect(0, 0, canvas.width, headerHeight);
            
            // 绘制标题
            ctx.fillStyle = "#333";
            ctx.font = "bold 34px 'Noto Sans SC', sans-serif";
            ctx.textAlign = "center";
            
            // 从 URL 参数获取名字
            var params = new URLSearchParams(window.location.search);
            var authorName = params.get("t") || "";
            var level = calculate();
            var title = authorName 
                ? authorName + " 的制省等级：" + level 
                : "制省等级：" + level;
            
            ctx.fillText(title, canvas.width / 2, 60);
            

            
            // 绘制底部背景条（纯色，不透明）
            ctx.fillStyle = "#9dc3fb";
            ctx.fillRect(0, canvas.height - footerHeight, canvas.width, footerHeight);
            
            // 绘制图例（使用你的注释）
            var legendY = canvas.height - 28;
            var legendColors = [
                { color: "#e84c3d", name: "常驻(曾居住) +5" },
                { color: "#d58337", name: "宿泊(曾过夜) +4" },
                { color: "#f3c218", name: "访问(曾游玩) +3" },
                { color: "#30cc70", name: "歇脚(曾换乘) +2" },
                { color: "#3598db", name: "行径(曾路过) +1" },
                { color: "#ffffff", name: "未履(从未涉足)" }
            ];
            
            ctx.font = "13px 'Noto Sans SC', sans-serif";
            ctx.textAlign = "left";
            
            var legendX = 35;
            var spacing = 125;
            
            legendColors.forEach(function(item, index) {
                var x = legendX + index * spacing;
                
                // 绘制颜色圆点
                ctx.beginPath();
                ctx.arc(x, legendY, 8, 0, Math.PI * 2);
                ctx.fillStyle = item.color;
                ctx.fill();
                ctx.strokeStyle = "#666";
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // 绘制文字
                ctx.fillStyle = "#333";
                ctx.fillText(item.name, x + 14, legendY + 4);
            });
            
            // 绘制水印
            ctx.fillStyle = "#666";
            ctx.font = "11px sans-serif";
            ctx.textAlign = "right";
            ctx.fillText("ChinaEx · Made by SaiOogcn", canvas.width - 10, canvas.height - 8);
            
            // 下载图片
            var link = document.createElement("a");
            link.download = "ChinaEx_Level_" + level + ".png";
            link.href = canvas.toDataURL("image/png");
            link.click();
            
            URL.revokeObjectURL(url);
        };
        
        img.onerror = function() {
            alert("生成图片失败，请稍后重试");
            URL.revokeObjectURL(url);
        };
        
        img.src = url;
    }

    // 初始化
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();