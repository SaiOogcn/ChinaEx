"""
从 GeoJSON 中提取各省的边界框和中心点
用于改进点击检测算法
"""

import json

def get_bounds(coords):
    """计算坐标的边界框"""
    min_x, min_y = float('inf'), float('inf')
    max_x, max_y = float('-inf'), float('-inf')
    
    def process_coords(c):
        nonlocal min_x, min_y, max_x, max_y
        if isinstance(c[0], (int, float)):
            # 这是一个点 [lon, lat]
            min_x = min(min_x, c[0])
            max_x = max(max_x, c[0])
            min_y = min(min_y, c[1])
            max_y = max(max_y, c[1])
        else:
            # 这是嵌套数组
            for item in c:
                process_coords(item)
    
    process_coords(coords)
    return [min_x, min_y, max_x, max_y]

def main():
    with open('中华人民共和国.geojson', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    provinces = {}
    
    for feature in data['features']:
        name = feature['properties'].get('name', '')
        if not name:
            continue
        
        coords = feature['geometry']['coordinates']
        bounds = get_bounds(coords)
        
        # 计算中心点
        center_x = (bounds[0] + bounds[2]) / 2
        center_y = (bounds[1] + bounds[3]) / 2
        
        provinces[name] = {
            'bounds': bounds,  # [min_lon, min_lat, max_lon, max_lat]
            'center': [center_x, center_y],
            'width': bounds[2] - bounds[0],
            'height': bounds[3] - bounds[1]
        }
    
    print("// 各省边界数据 (经纬度)")
    print("// bounds: [min_lon, min_lat, max_lon, max_lat]")
    print("const provinceBounds = {")
    for name, info in sorted(provinces.items()):
        bounds = info['bounds']
        center = info['center']
        print(f"    '{name}': {{ bounds: [{bounds[0]:.2f}, {bounds[1]:.2f}, {bounds[2]:.2f}, {bounds[3]:.2f}], center: [{center[0]:.2f}, {center[1]:.2f}] }},")
    print("};")

if __name__ == '__main__':
    main()
