## Mục tiêu
Thay phân trang Prev/Next ở `/search` bằng **infinite scroll** — tự động tải thêm khi cuộn xuống đáy.

## Thay đổi chính trong `src/pages/SearchPage.tsx`

1. **Đổi data layer**: thay `useQuery` bằng `useInfiniteQuery` của react-query.
   - `queryFn({ pageParam })` gọi `advertisementService.getListPaged({ ...filters, page: pageParam, pageSize: PAGE_SIZE })`.
   - `initialPageParam: 1`.
   - `getNextPageParam(lastPage, allPages)`: trả `allPages.length + 1` nếu `lastPage.items.length >= PAGE_SIZE`, ngược lại `undefined` (vì `totalCount` không tin được — theo memory).
   - Flatten: `advertisements = data.pages.flatMap(p => p.items ?? [])`.

2. **Bỏ state/UI phân trang cũ**:
   - Xoá `const [page, setPage] = useState(1)`, `goToPage`, `pageItems`, `totalPages`, và toàn bộ block JSX `<Pagination>...`.
   - Bỏ import `Pagination*` từ `@/components/ui/pagination`.
   - Bỏ `keepPreviousData` import.

3. **Reset khi filter đổi**: react-query tự reset vì `queryKey` thay đổi → không cần effect riêng.

4. **Sentinel + IntersectionObserver**:
   - Thêm `loadMoreRef = useRef<HTMLDivElement>(null)` đặt ngay sau grid kết quả.
   - `useEffect` tạo `IntersectionObserver` với `rootMargin: "400px 0px"` (preload sớm trước khi chạm đáy) — khi `isIntersecting && hasNextPage && !isFetchingNextPage` thì gọi `fetchNextPage()`.
   - Cleanup observer khi unmount/queryKey đổi.

5. **UI trạng thái**:
   - Lần load đầu (`isLoading`): giữ skeleton grid như hiện tại (PAGE_SIZE ô).
   - Đang fetch trang tiếp theo (`isFetchingNextPage`): hiện 1 hàng skeleton nhỏ (3 ô) + spinner `Loader2` ở giữa dưới grid.
   - Hết dữ liệu (`!hasNextPage && advertisements.length > 0`): hiện text mờ "Đã hiển thị tất cả kết quả" (i18n key mới `search.endOfResults`).
   - `EmptyState` giữ nguyên cho trường hợp 0 kết quả.

6. **i18n**: thêm key `search.endOfResults` vào cả 5 file locale (vi/en/ja/ko/zh).

## Lưu ý kỹ thuật
- Dùng `useCallback` ref pattern cho sentinel hoặc `useEffect` cũng được — chọn `useEffect` cho đơn giản, dependency theo `hasNextPage`, `isFetchingNextPage`, `fetchNextPage`.
- Vì `totalCount` không ổn định, **không** hiển thị "X / Y kết quả" khi infinite — chỉ hiện số đã load (nếu hiện tại có).
- Giữ `listRef` (đã có) để khi bộ lọc đổi không cần scroll thủ công — react-query auto reset về trang 1.

## File ảnh hưởng
- `src/pages/SearchPage.tsx`
- `src/i18n/locales/{vi,en,ja,ko,zh}.json`