## Mục tiêu

1. Tạo hằng số `PAGE_SIZE_DEFAULT = 30` dùng chung toàn dự án.
2. Áp dụng vào tất cả các nơi đang truyền `pageSize` (trừ những chỗ có giá trị đặc thù — sẽ giữ nguyên, xem ghi chú).
3. Thêm phân trang (pagination) cho `SearchPage.tsx` thay vì chỉ load 1 trang.

---

## 1. Tạo hằng số chung

Tạo file mới `src/lib/pagination.ts`:
```ts
export const PAGE_SIZE_DEFAULT = 30;
```

## 2. Áp dụng vào các nơi dùng `pageSize`

Phân loại theo ngữ cảnh (vì không phải mọi `pageSize` đều có cùng ý nghĩa):

**Nhóm A — Dùng `PAGE_SIZE_DEFAULT` (danh sách phòng chính, mục đích phân trang chuẩn):**
- `src/pages/SearchPage.tsx` — bỏ `const PAGE_SIZE = 30` cục bộ, dùng `PAGE_SIZE_DEFAULT`.
- `src/pages/SavedRooms.tsx` (đang `20`) → `PAGE_SIZE_DEFAULT`.
- `src/pages/Index.tsx` các nơi `pageSize: 30` → `PAGE_SIZE_DEFAULT`.
- `src/components/CustomerReviews.tsx` (đang `20`) → `PAGE_SIZE_DEFAULT`.

**Nhóm B — Giữ nguyên (có lý do nghiệp vụ riêng), KHÔNG đổi:**
- `src/pages/Index.tsx` chỗ `pageSize: 100` (load catalog/banner đặc biệt).
- `src/pages/MapSearchPage.tsx` `pageSize: 100` — bản đồ cần load nhiều marker theo viewport.
- `src/components/HeroSearch.tsx` `pageSize: 100` — load catalog province cho autocomplete.
- `src/pages/SearchPage.tsx` dòng 101 `pageSize: 100` — load apartmentTypes (catalog dropdown).
- `src/components/PropertyReviews.tsx` `PAGE_SIZE = 5` — UX riêng cho khối review (load more từng 5).
- `src/components/SimilarRooms.tsx` `pageSize: 10` — slot phòng tương tự.

> Nếu bạn muốn ép cả nhóm B về `PAGE_SIZE_DEFAULT`, hãy nói rõ — mặc định plan này chỉ chuẩn hoá những nơi mang ý nghĩa "phân trang danh sách chính".

## 3. Phân trang cho SearchPage

Triển khai client-driven pagination dùng API có sẵn (`page`, `pageSize`, `pagination.totalCount`):

- Thêm state `page` (default 1), reset về 1 khi bất kỳ filter nào thay đổi (keyword, provinceId, wardId, apartmentTypeUuid, price, size, typeOrder, geoBounds).
- `buildListRequest()` truyền `page` hiện tại và `pageSize: PAGE_SIZE_DEFAULT`.
- React-query: thêm `page` vào `queryKey`, bật `placeholderData: keepPreviousData` để tránh nhảy UI khi đổi trang.
- Tính `totalPages = Math.ceil(totalCount / PAGE_SIZE_DEFAULT)`. Lưu ý theo memory: `totalCount` từ API không ổn định — fallback: nếu trang hiện tại trả về < `PAGE_SIZE_DEFAULT` items thì coi đây là trang cuối (ẩn nút Next), nếu ≥ thì cho phép Next.
- UI: dùng `src/components/ui/pagination.tsx` (đã có sẵn), hiển thị Previous / số trang (rút gọn với ellipsis: 1 … current-1 current current+1 … last) / Next, đặt bên dưới grid danh sách.
- Khi đổi trang: `setPage(n)` rồi `listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })`.
- Skeleton vẫn giữ `PAGE_SIZE_DEFAULT` ô khi đang load lần đầu (`!listData`).

### Wireframe khu vực kết quả
```text
[ Grid kết quả 1 / 2 / 3 cột ]
[ ────────────────────────── ]
[ « Prev   1 … 4 [5] 6 … 12   Next » ]
```

## 4. Memory

Cập nhật `mem://technical/api-integration` thêm dòng: "Default pageSize cho danh sách = `PAGE_SIZE_DEFAULT` (30) ở `src/lib/pagination.ts`."

---

## File sẽ chỉnh sửa

- `src/lib/pagination.ts` (tạo mới)
- `src/pages/SearchPage.tsx` (dùng hằng + thêm pagination state/UI)
- `src/pages/SavedRooms.tsx`
- `src/pages/Index.tsx`
- `src/components/CustomerReviews.tsx`
- `mem://technical/api-integration` + `mem://index.md`