"""
生成完整的省份数据，包括边界框和中心点，用于精确点击检测
"""

import json

# SVG 坐标系参数
LON_MIN = 77.0
LON_MAX = 133.8
LAT_MIN = 17.0
LAT_MAX = 54.0

SVG_MIN_X = -11.1
SVG_MIN_Y = -3.1
SVG_WIDTH = 47.2
SVG_HEIGHT = 39.2

def lon_to_svg_x(lon):
    return (lon - LON_MIN) / (LON_MAX - LON_MIN) * SVG_WIDTH + SVG_MIN_X

def lat_to_svg_y(lat):
    return (LAT_MAX - lat) / (LAT_MAX - LAT_MIN) * SVG_HEIGHT + SVG_MIN_Y

# 名称映射：GeoJSON 名称 -> 简短名称
name_map = {
    '上海市': '上海',
    '云南省': '云南',
    '内蒙古自治区': '内蒙古',
    '北京市': '北京',
    '台湾省': '台湾',
    '吉林省': '吉林',
    '四川省': '四川',
    '天津市': '天津',
    '宁夏回族自治区': '宁夏',
    '安徽省': '安徽',
    '山东省': '山东',
    '山西省': '山西',
    '广东省': '广东',
    '广西壮族自治区': '广西',
    '新疆维吾尔自治区': '新疆',
    '江苏省': '江苏',
    '江西省': '江西',
    '河北省': '河北',
    '河南省': '河南',
    '浙江省': '浙江',
    '海南省': '海南',
    '湖北省': '湖北',
    '湖南省': '湖南',
    '澳门特别行政区': '澳门',
    '甘肃省': '甘肃',
    '福建省': '福建',
    '西藏自治区': '西藏',
    '贵州省': '贵州',
    '辽宁省': '辽宁',
    '重庆市': '重庆',
    '陕西省': '陕西',
    '青海省': '青海',
    '香港特别行政区': '香港',
    '黑龙江省': '黑龙江',
}

def get_bounds(coords):
    """计算坐标的边界框"""
    min_x, min_y = float('inf'), float('inf')
    max_x, max_y = float('-inf'), float('-inf')
    
    def process_coords(c):
        nonlocal min_x, min_y, max_x, max_y
        if isinstance(c[0], (int, float)):
            min_x = min(min_x, c[0])
            max_x = max(max_x, c[0])
            min_y = min(min_y, c[1])
            max_y = max(max_y, c[1])
        else:
            for item in c:
                process_coords(item)
    
    process_coords(coords)
    return [min_x, min_y, max_x, max_y]

def main():
    with open('中华人民共和国.geojson', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    provinces = {}
    
    for feature in data['features']:
        full_name = feature['properties'].get('name', '')
        if not full_name or full_name not in name_map:
            continue
        
        name = name_map[full_name]
        coords = feature['geometry']['coordinates']
        bounds = get_bounds(coords)
        
        # 特殊处理海南（只取本岛，不含南海岛屿）
        if name == '海南':
            bounds = [108.59, 18.15, 111.10, 20.16]
        
        # 转换为 SVG 坐标
        svg_min_x = lon_to_svg_x(bounds[0])
        svg_max_x = lon_to_svg_x(bounds[2])
        svg_min_y = lat_to_svg_y(bounds[3])  # 注意 Y 轴反转
        svg_max_y = lat_to_svg_y(bounds[1])
        
        center_lon = (bounds[0] + bounds[2]) / 2
        center_lat = (bounds[1] + bounds[3]) / 2
        center_x = lon_to_svg_x(center_lon)
        center_y = lat_to_svg_y(center_lat)
        
        provinces[name] = {
            'center': [round(center_x, 1), round(center_y, 1)],
            'bounds': [round(svg_min_x, 1), round(svg_min_y, 1), round(svg_max_x, 1), round(svg_max_y, 1)]
        }
    
    # 输出 JavaScript 代码
    print("    // 省份中心点和边界框 (SVG 坐标)")
    print("    // bounds: [minX, minY, maxX, maxY]")
    print("    const provinceData = {")
    
    # 按固定顺序输出
    order = ['新疆', '西藏', '青海', '甘肃', '内蒙古', '黑龙江', '吉林', '辽宁',
             '宁夏', '陕西', '山西', '河北', '北京', '天津', '山东', '河南',
             '江苏', '安徽', '上海', '浙江', '福建', '江西', '湖北', '湖南',
             '广东', '广西', '海南', '四川', '重庆', '贵州', '云南', '台湾',
             '香港', '澳门']
    
    for name in order:
        if name in provinces:
            info = provinces[name]
            center = info['center']
            bounds = info['bounds']
            print(f"        '{name}': {{ center: [{center[0]}, {center[1]}], bounds: [{bounds[0]}, {bounds[1]}, {bounds[2]}, {bounds[3]}] }},")
    
    print("    };")

if __name__ == '__main__':
    main()
