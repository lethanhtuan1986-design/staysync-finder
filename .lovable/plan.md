# Giới hạn mức zoom-out theo Bán kính tìm kiếm

## Mục tiêu
Trên `/search/map`, khi người dùng chọn "Bán kính tìm kiếm" (vd 5km), bản đồ **không được phép zoom out** quá mức cho thấy vùng rộng hơn vòng tròn bán kính đó. Người dùng vẫn **pan (kéo) tự do** không bị chặn.

## Hành vi mong muốn
- Có điểm tâm (do user chọn địa điểm hoặc dùng vị trí hiện tại) + có `radiusKm`:
  - Tính bounding box của vòng tròn bán kính.
  - Tính `minZoom = map.getBoundsZoom(bounds)` — đây là mức zoom vừa khít vòng tròn trong viewport hiện tại.
  - `map.setMinZoom(minZoom)` → khi zoom hiện tại < minZoom, tự nâng lên.
  - **Không** set `maxBounds` → pan vẫn tự do.
- Khi đổi `radiusKm` (1km/3km/5km/10km) → tính lại `minZoom` tương ứng (bán kính nhỏ → minZoom lớn).
- Khi đổi điểm tâm → re-fit vòng tròn rồi cập nhật minZoom.
- Khi resize viewport → tính lại minZoom (vì kích thước hiển thị thay đổi).
- Không có điểm tâm → reset `minZoom` về mặc định (vd 2), không giới hạn.

## Thay đổi kỹ thuật

### `src/components/MapView.tsx`
- Thêm prop `lockToRadius?: { centerLat: number; centerLng: number; radiusKm: number } | null`.
- useEffect theo `lockToRadius`:
  - Tính bounding box từ `centerLat/centerLng/radiusKm` (công thức bên dưới).
  - `const z = map.getBoundsZoom(bounds, false)` → `map.setMinZoom(z)`.
  - Nếu `map.getZoom() < z` → `map.setZoom(z)` (animate).
  - Lần đầu áp dụng (hoặc khi đổi tâm): `map.flyToBounds(bounds, { padding: [20,20] })`.
- Khi `lockToRadius = null`: `map.setMinZoom(2)` (mặc định).
- Lắng nghe `map.on('resize')` để recompute minZoom (kích thước container đổi → boundsZoom đổi).
- **Không** đụng `maxBounds` — pan giữ nguyên tự do.
- Vẫn dùng overlay vòng tròn hiện tại (`searchOverlay`) để vẽ ranh giới trực quan.

### `src/pages/MapSearchPage.tsx`
- Thêm state `centerPoint: { lat: number; lng: number } | null`:
  - Set khi `handleLocationSelect` chọn địa điểm.
  - Hoặc init từ `getUserLocation()` lần đầu (nếu user cho phép).
- Truyền xuống `MapView`:
  - `lockToRadius = centerPoint ? { centerLat, centerLng, radiusKm } : null`
  - `searchOverlay = lockToRadius` (để vẽ vòng tròn).
- Khi `radiusKm` thay đổi → `MapView` tự cập nhật minZoom qua dependency.

## Công thức bounding box
```text
latDelta = radiusKm / 111.32
lngDelta = radiusKm / (111.32 * cos(centerLat * π/180))
SW = [centerLat - latDelta, centerLng - lngDelta]
NE = [centerLat + latDelta, centerLng + lngDelta]
```

## Kết quả
- Bán kính 5km, tâm Hà Nội → minZoom ~ 13. User không zoom out xuống 12 được, nhưng kéo bản đồ sang quận khác vẫn thoải mái.
- Đổi sang 1km → minZoom ~ 15 (zoom sâu hơn). Đổi sang 10km → minZoom ~ 12.
- Bỏ tâm → map tự do hoàn toàn.
