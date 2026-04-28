# Fix Duplicate Key trong Sidebar MapSearchPage

## Vấn đề
Cùng một quảng cáo (`ad.uuid`) có thể thuộc nhiều `MapLocationGroup` khác nhau khi API trả về clusters theo vị trí. Khi flatten thành `allAds` để hiển thị infinite scroll bên sidebar, các bản ghi trùng `uuid` gây ra warning "duplicate key" của React và hiển thị lặp phòng.

## Giải pháp
Cập nhật `useMemo` của `allAds` trong `src/pages/MapSearchPage.tsx` để dedupe theo `uuid` bằng `Set`, giữ thứ tự xuất hiện đầu tiên.

```ts
const allAds = useMemo(() => {
  const seen = new Set<string>();
  const result: Advertisement[] = [];
  for (const loc of mapLocations) {
    for (const ad of loc.ads) {
      if (!seen.has(ad.uuid)) {
        seen.add(ad.uuid);
        result.push(ad);
      }
    }
  }
  return result;
}, [mapLocations]);
```

## Phạm vi
- Chỉ sửa 1 file: `src/pages/MapSearchPage.tsx`
- Không thay đổi cơ chế gọi API, không ảnh hưởng markers trên bản đồ
- Sidebar list sẽ không còn phòng trùng và hết warning React
