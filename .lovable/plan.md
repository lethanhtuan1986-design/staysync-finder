## Vấn đề

Khi API đã trả dữ liệu, người dùng vẫn thấy danh sách "xuất hiện chậm" do 3 nguyên nhân chính trong `AdvertisementCard.tsx` và `SearchPage.tsx`:

1. **Framer-motion stagger lớn**: `delay: index * 0.05s` → card thứ 20 phải đợi **1 giây** sau khi data về mới fade in. Card thứ 30 đợi 1.5s. Đây là nguyên nhân chính gây cảm giác "API về rồi mà chưa hiện".
2. **Ảnh chặn cảm nhận render**: `loading="lazy"` cộng với việc ảnh chiếm 60% diện tích card khiến card "trông như chưa load" cho đến khi ảnh xong, dù text đã sẵn sàng.
3. **Không có placeholder cho ảnh**: Trong khi ảnh đang tải, vùng ảnh là nền `bg-muted` xám đứng yên — không có dấu hiệu progressive loading.
4. **Re-animation khi load thêm trang**: Mỗi lần `fetchNextPage` xong, mảng `advertisements` đổi tham chiếu — các card mới có `index` cao tiếp tục bị delay lớn (vd page 2 card đầu có `index=20` → delay 1s).

## Phương án

### 1. Bỏ stagger animation theo index (quan trọng nhất)
Trong `AdvertisementCard.tsx`:
- Xoá `delay: index * 0.05` — animation chỉ còn fade-in 0.25s đồng loạt.
- Giảm `duration` xuống `0.25s` cho cảm giác nhanh hơn.
- Bỏ `y: 20` translate (chỉ giữ `opacity`) → đỡ layout work, mượt hơn trên mobile.

Kết quả: toàn bộ card hiện ra **gần như tức thì** sau khi React commit, thay vì lần lượt trong 1-2 giây.

### 2. Tách "render text trước, ảnh sau" (progressive rendering)

Trong `AdvertisementCard.tsx`, thay khối ảnh hiện tại bằng:
- **Skeleton overlay** trên vùng ảnh khi ảnh chưa load xong: dùng state `imgLoaded` (default `false`), set `true` trong `onLoad`.
- Trong lúc chờ: hiển thị `<Skeleton>` chiếm trọn vùng ảnh (giữ aspect-ratio 3:2 — không layout shift).
- Ảnh dùng `decoding="async"` để decode song song trên thread riêng, không chặn main thread.
- Thêm class `transition-opacity` để ảnh fade vào khi đã load.

Kết quả: text (tiêu đề, giá, vị trí, nút) hiện **ngay lập tức** khi data về; ảnh "trượt vào" sau đó. Người dùng có thể đọc/click ngay.

### 3. Eager-load ảnh trên màn hình đầu (above the fold)

Trong `SearchPage.tsx`, truyền prop `priority` cho card thuộc N item đầu (vd 6 item đầu — đủ cho desktop 3 cột × 2 hàng):

```tsx
<AdvertisementCard data={ad} index={i} priority={i < 6} />
```

Trong `AdvertisementCard`:
- `loading={priority ? "eager" : "lazy"}`
- `fetchPriority={priority ? "high" : "auto"}`

Kết quả: ảnh trên màn hình đầu được trình duyệt ưu tiên download song song ngay khi HTML render, không phải đợi lazy observer.

### 4. Tối ưu re-render khi load thêm trang

Trong `SearchPage.tsx`:
- Bọc `<AdvertisementCard>` bằng `React.memo` (export memoized version) để các card cũ không re-render khi mảng `advertisements` thay đổi tham chiếu sau `fetchNextPage`.
- Loại bỏ wrapper `<div key={ad.uuid}>` thừa — đặt `key` trực tiếp trên `AdvertisementCard` (giảm 1 cấp DOM × N item).

### 5. (Tuỳ chọn nhỏ) Ảnh srcset

Nếu API hỗ trợ resize qua query param (cần kiểm tra `getImageUrl`), thêm `srcSet` với 2 size (vd 400w, 800w) và `sizes="(min-width:1280px) 33vw, (min-width:640px) 50vw, 100vw"` để mobile không tải ảnh full-res. Nếu API không hỗ trợ → bỏ qua bước này.

## Files thay đổi

- `src/components/AdvertisementCard.tsx`
  - Bỏ stagger delay, đơn giản hoá animation
  - Thêm state `imgLoaded` + Skeleton overlay vùng ảnh
  - Thêm prop `priority` (eager/lazy + fetchPriority)
  - Thêm `decoding="async"`
  - Wrap export với `React.memo`
- `src/pages/SearchPage.tsx`
  - Truyền `priority={i < 6}` cho 6 card đầu
  - Bỏ `<div key>` wrapper thừa, key đặt trên `AdvertisementCard`

## Kết quả mong đợi

- Text card hiện **ngay** khi API trả về (< 50ms thay vì 1-2s).
- Ảnh 6 card đầu load song song với render, không bị lazy chặn.
- Card đang chờ ảnh có skeleton thay vì khoảng trống xám tĩnh — cảm giác đang "tải tiếp" rõ ràng.
- Load thêm trang không re-animation các card cũ → mượt hơn rõ rệt.
