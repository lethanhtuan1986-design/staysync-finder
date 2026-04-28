## Mục tiêu

Khi user gõ vào ô tìm kiếm:
- **Không** tự động tìm theo từ khóa (như hiện tại đang debounce gửi `keyword` lên API).
- Dropdown hiển thị **2 phần**:
  1. Mục đầu tiên: chính từ khóa user vừa gõ → click sẽ tìm theo **keyword** (text search).
  2. Bên dưới: danh sách địa điểm gợi ý từ Nominatim → click sẽ tìm theo **bbox** quanh điểm đó (như hiện tại).
- Chỉ gọi API danh sách phòng khi user **chọn** một mục trong dropdown (hoặc Enter).

## Thay đổi UI/UX trong LocationAutocomplete

Dropdown bố cục mới:
```text
┌──────────────────────────────────┐
│ 🔍  Tìm "bach khoa"              │  ← submit theo keyword
├──────────────────────────────────┤
│ 📍 Đại học Bách khoa Hà Nội      │  ← submit theo bbox
│    1, Đường Đại Cồ Việt, ...     │
│ 📍 Khu tập thể Bách Khoa         │
│    Phường Bạch Mai, Hà Nội       │
└──────────────────────────────────┘
```

- Mục "Tìm …" luôn hiện ở đầu khi `value` không rỗng (kể cả khi đang loading hoặc Nominatim trả về 0 kết quả).
- Phím Enter trong input = chọn mục "Tìm …" (keyword search).
- Click ra ngoài: đóng dropdown, **không** trigger search (text trong ô vẫn còn nhưng không áp dụng).

## Thay đổi API contract của LocationAutocomplete

Thêm 1 callback mới để phân biệt 2 loại submit:

```ts
interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;                                // chỉ cập nhật text trong ô
  onSelectLocation: (result: NominatimResult, bounds: GeoBounds) => void; // chọn gợi ý địa điểm
  onSubmitKeyword: (keyword: string) => void;                       // chọn mục "Tìm …" / Enter
  // ... các props cũ
}
```

Bỏ hành vi "gõ là cập nhật keyword cho query". `onChange` chỉ cập nhật state local của ô input ở SearchPage, không trigger fetch.

## Thay đổi trong SearchPage

1. **Xoá debounce keyword**: bỏ `debouncedKeyword` + effect setTimeout. Thay bằng `appliedKeyword` chỉ cập nhật khi user submit.
2. **State mới**:
   - `keyword` (text trong ô, không vào query).
   - `appliedKeyword` (đã submit, đi vào query).
3. **Handlers**:
   - `handleSubmitKeyword(text)`: `setAppliedKeyword(text)` + `setGeoCenter(null)` (tìm text → bỏ điểm cũ).
   - `handleSelectLocation(result, bounds)`: `setGeoCenter({lat, lng})` + `setAppliedKeyword("")` (tìm địa điểm → bỏ keyword cũ). Vẫn hiển thị tên địa điểm trong ô qua `onChange(item.main)`.
4. Bỏ `justSelectedRef` + logic reset `geoCenter` trong `handleKeywordChange` cũ — không còn cần thiết vì `onChange` giờ chỉ là cập nhật text thuần.
5. URL sync (`?q=...`) dùng `appliedKeyword` thay vì `debouncedKeyword`.
6. queryKey của `useInfiniteQuery` thay `debouncedKeyword` → `appliedKeyword`.

## Kết quả mong đợi

- Gõ "bach khoa" → dropdown hiện "Tìm bach khoa" + 4 gợi ý địa điểm. Danh sách phòng **không** đổi.
- Click "Tìm bach khoa" → fetch với `keyword="bach khoa"`, không bbox.
- Click "Đại học Bách khoa Hà Nội" → fetch với bbox quanh điểm, không keyword. Đổi bán kính sau đó tự refetch như hiện tại.
- Enter trong ô = click mục đầu tiên (keyword search).

## Phạm vi file

- `src/components/LocationAutocomplete.tsx` — thêm mục "Tìm …", thêm `onSubmitKeyword`, hỗ trợ Enter.
- `src/pages/SearchPage.tsx` — tách `keyword` / `appliedKeyword`, xoá debounce, dùng 2 handlers mới ở 2 chỗ render `LocationAutocomplete` (desktop + mobile).
