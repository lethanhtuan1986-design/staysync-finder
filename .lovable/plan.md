

## Chọn Tỉnh/Thành phố trước khi vào trang & dùng nó để bias kết quả tìm kiếm địa chỉ

### Mục tiêu
1. Lần đầu vào web → hiện modal "Bạn muốn tìm nhà ở đâu?" để chọn Tỉnh/Thành phố (mặc định **Hà Nội**).
2. Lựa chọn được lưu LocalStorage, áp dụng toàn site.
3. Mọi ô nhập địa chỉ (HeroSearch, SearchPage, MapSearchPage) sẽ ưu tiên gợi ý địa điểm **nằm trong tỉnh đã chọn**.

---

### 1. Global province context

**File mới: `src/hooks/useSelectedProvince.ts`**
- Custom hook + `useSyncExternalStore` (giống `useSavedRooms`) để sync LocalStorage key `xanhstay:selected-province` đa tab.
- API: `{ provinceCode, provinceName, setProvince(code, name), isReady }`.
- Giá trị mặc định khi chưa có gì trong LocalStorage: **không set sẵn** → hook trả `provinceCode = null` → trigger modal hiển thị. Modal mặc định highlight Hà Nội.

**File mới: `src/lib/province-geo.ts`**
- Bảng tra cứu tĩnh `PROVINCE_GEO: Record<provinceCode, { lat, lng, radiusKm }>` cho 63 tỉnh (center + bán kính bao phủ ước lượng, vd Hà Nội ~30km, TP.HCM ~30km, các tỉnh nhỏ ~25km).
- Helper `getProvinceBias(code) → { lat, lng, radiusKm } | null`.

> Vì API `province.service` chỉ trả `code` + `fullName` (không có toạ độ), bảng tĩnh là cách rẻ + chắc chắn nhất để bias Google Places (không cần thêm Geocoding call).

---

### 2. Modal chọn tỉnh — `src/components/ProvincePickerModal.tsx` (mới)

- Hiển thị tự động khi `provinceCode === null`.
- UI:
  - Tiêu đề: **"Bạn muốn tìm nhà ở đâu?"**
  - Mô tả ngắn: "Chọn tỉnh/thành phố để chúng tôi gợi ý địa điểm chính xác hơn."
  - **Search input** lọc danh sách tỉnh theo keyword.
  - **Grid quick-pick** 4 thành phố lớn (Hà Nội, TP.HCM, Đà Nẵng, Hải Phòng) — Hà Nội highlight mặc định.
  - **Danh sách scroll** đầy đủ 63 tỉnh (lấy từ `provinceService.listProvince`).
  - Nút **"Xác nhận"** disabled cho đến khi có lựa chọn (preselect Hà Nội ngay khi mở).
  - Không có nút đóng `X` (bắt buộc chọn) — nhưng cho phép đóng bằng "Bỏ qua" → set Hà Nội ngầm.
- Sau khi chọn → gọi `setProvince(code, name)` → modal đóng.
- Có thể mở lại modal sau bằng cách click vào chip tỉnh hiện tại trên Navbar (xem mục 4).

**Tích hợp:** Mount 1 lần ở `src/App.tsx` (cùng cấp với `<Toaster>`, `<ScrollToTop>`) để xuất hiện trên mọi route.

---

### 3. Áp dụng bias vào Google Places

**Sửa `src/hooks/useGooglePlaces.ts`**
- Thêm tham số tùy chọn cho `search()`:
  ```ts
  search(input: string, opts?: { lat: number; lng: number; radiusKm: number })
  ```
- Khi có `opts`, truyền vào request:
  ```ts
  location: new google.maps.LatLng(opts.lat, opts.lng),
  radius: opts.radiusKm * 1000, // mét
  // KHÔNG dùng strictBounds để vẫn cho gõ địa chỉ ngoài tỉnh nếu user muốn
  ```
- Giữ `componentRestrictions: { country: 'vn' }`.

**Sửa `src/components/LocationAutocomplete.tsx`**
- Thêm props mới (optional, không phá caller cũ):
  ```ts
  biasLat?: number; biasLng?: number; biasRadiusKm?: number;
  ```
- Truyền vào `google.search(value, { lat, lng, radiusKm })` khi có.
- Với fallback Nominatim: nếu có `provinceName`, append vào `enrichSuffix` (logic đã sẵn).

**Sửa các caller:**
- `HeroSearch.tsx`, `SearchPage.tsx`, `MapSearchPage.tsx`:
  - Lấy `provinceCode` từ `useSelectedProvince()`.
  - Lookup `getProvinceBias(provinceCode)` → truyền `biasLat/biasLng/biasRadiusKm` vào `<LocationAutocomplete>`.
  - `enrichSuffix` thêm tên tỉnh đã chọn (cho fallback Nominatim & cho Google khi keyword là tên đường ngắn).

---

### 4. Hiển thị tỉnh đang chọn trên Navbar

**Sửa `src/components/Navbar.tsx`**
- Bên cạnh logo (desktop) / phía trên hero (mobile), thêm 1 chip nhỏ:
  ```
  📍 Hà Nội  ▼
  ```
- Click chip → mở lại `ProvincePickerModal` để đổi tỉnh.
- Trên mobile: chip nằm ở góc phải header bên cạnh icon chuông/saved.

---

### 5. Flow tổng thể

```text
User mở web lần đầu
   │
   ├─ LocalStorage không có province
   │      │
   │      ▼
   │  ProvincePickerModal hiện (mặc định highlight Hà Nội)
   │      │
   │      ▼
   │  User chọn → lưu LocalStorage
   │
   ├─ HeroSearch / SearchPage / MapSearchPage
   │      │
   │      ▼
   │  LocationAutocomplete nhận biasLat/Lng/Radius từ tỉnh
   │      │
   │      ▼
   │  Google Places trả gợi ý ưu tiên TRONG tỉnh đó
   │
   └─ Click chip "📍 Hà Nội" trên Navbar → đổi tỉnh bất cứ lúc nào
```

---

### Phạm vi file
- **Mới:** `src/hooks/useSelectedProvince.ts`, `src/lib/province-geo.ts`, `src/components/ProvincePickerModal.tsx`.
- **Sửa:** `src/App.tsx` (mount modal), `src/hooks/useGooglePlaces.ts` (location bias), `src/components/LocationAutocomplete.tsx` (props bias), `src/components/HeroSearch.tsx`, `src/pages/SearchPage.tsx`, `src/pages/MapSearchPage.tsx` (truyền bias), `src/components/Navbar.tsx` (chip tỉnh).
- **i18n:** thêm key `provincePicker.title`, `provincePicker.desc`, `provincePicker.confirm`, `provincePicker.searchPlaceholder`, `navbar.changeProvince` vào 5 file `src/i18n/locales/*.json`.

### Ghi chú
- Không động vào tile map, marker phòng, bounds search hiện tại.
- Bảng `PROVINCE_GEO` tĩnh, có thể bổ sung sau; thiếu code nào → không bias (vẫn chạy bình thường).
- Modal chỉ chặn lần đầu; sau khi đã có giá trị (kể cả "Bỏ qua" → Hà Nội), không hiện lại tự động.

