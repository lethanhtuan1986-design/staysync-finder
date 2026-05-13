import { formatVNPhone } from "@/services";

/** Số hotline chính thức của XanhStay (chỉ chứa chữ số) */
export const HOTLINE_RAW = "0962150785";

/** Hotline hiển thị: 096 215 0785 */
export const HOTLINE_DISPLAY = formatVNPhone(HOTLINE_RAW);

/** Link tel: */
export const HOTLINE_TEL = `tel:${HOTLINE_RAW}`;

/** Link mở Zalo chat trực tiếp */
export const ZALO_LINK = `https://zalo.me/${HOTLINE_RAW}`;
