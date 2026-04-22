// Static lookup of Vietnamese province centers + coverage radius (km).
// Used to bias Google Places autocomplete toward the user-selected province.
// Codes follow GSO 2-digit codes (string with leading zero) used by the backend.

export interface ProvinceBias {
  lat: number;
  lng: number;
  radiusKm: number;
}

// Major cities get larger radius; other provinces ~25km.
export const PROVINCE_GEO: Record<string, ProvinceBias> = {
  // 5 thành phố trực thuộc TƯ
  "01": { lat: 21.0285, lng: 105.8542, radiusKm: 35 }, // Hà Nội
  "79": { lat: 10.7769, lng: 106.7009, radiusKm: 35 }, // TP. Hồ Chí Minh
  "48": { lat: 16.0544, lng: 108.2022, radiusKm: 25 }, // Đà Nẵng
  "31": { lat: 20.8449, lng: 106.6881, radiusKm: 25 }, // Hải Phòng
  "92": { lat: 10.0452, lng: 105.7469, radiusKm: 25 }, // Cần Thơ

  // Miền Bắc
  "02": { lat: 22.3380, lng: 103.8442, radiusKm: 30 }, // Hà Giang
  "04": { lat: 22.6666, lng: 106.2639, radiusKm: 30 }, // Cao Bằng
  "06": { lat: 22.7470, lng: 104.9784, radiusKm: 30 }, // Bắc Kạn
  "08": { lat: 21.7639, lng: 105.2280, radiusKm: 30 }, // Tuyên Quang
  "10": { lat: 22.4856, lng: 103.9707, radiusKm: 30 }, // Lào Cai
  "11": { lat: 22.3964, lng: 103.4585, radiusKm: 30 }, // Điện Biên
  "12": { lat: 22.3964, lng: 103.4585, radiusKm: 30 }, // Lai Châu
  "14": { lat: 21.3267, lng: 103.9188, radiusKm: 30 }, // Sơn La
  "15": { lat: 21.5942, lng: 105.8482, radiusKm: 25 }, // Yên Bái
  "17": { lat: 20.8525, lng: 106.6131, radiusKm: 25 }, // Hoà Bình
  "19": { lat: 21.5928, lng: 105.8442, radiusKm: 25 }, // Thái Nguyên
  "20": { lat: 21.8526, lng: 106.7615, radiusKm: 25 }, // Lạng Sơn
  "22": { lat: 20.9595, lng: 107.0428, radiusKm: 30 }, // Quảng Ninh
  "24": { lat: 21.2731, lng: 106.1946, radiusKm: 25 }, // Bắc Giang
  "25": { lat: 21.2988, lng: 105.6373, radiusKm: 25 }, // Phú Thọ
  "26": { lat: 21.3979, lng: 105.6063, radiusKm: 25 }, // Vĩnh Phúc
  "27": { lat: 21.1861, lng: 106.0763, radiusKm: 25 }, // Bắc Ninh
  "30": { lat: 20.9373, lng: 106.3331, radiusKm: 25 }, // Hải Dương
  "33": { lat: 20.9386, lng: 106.0511, radiusKm: 25 }, // Hưng Yên
  "34": { lat: 20.4474, lng: 106.3420, radiusKm: 25 }, // Thái Bình
  "35": { lat: 20.5835, lng: 105.9230, radiusKm: 25 }, // Hà Nam
  "36": { lat: 20.4388, lng: 106.1621, radiusKm: 25 }, // Nam Định
  "37": { lat: 20.2506, lng: 105.9745, radiusKm: 25 }, // Ninh Bình

  // Miền Trung
  "38": { lat: 19.8067, lng: 105.7851, radiusKm: 30 }, // Thanh Hoá
  "40": { lat: 18.6790, lng: 105.6813, radiusKm: 30 }, // Nghệ An
  "42": { lat: 18.3559, lng: 105.8877, radiusKm: 25 }, // Hà Tĩnh
  "44": { lat: 17.4684, lng: 106.6223, radiusKm: 25 }, // Quảng Bình
  "45": { lat: 16.7943, lng: 107.0857, radiusKm: 25 }, // Quảng Trị
  "46": { lat: 16.4637, lng: 107.5909, radiusKm: 25 }, // Thừa Thiên Huế
  "49": { lat: 15.5394, lng: 108.0191, radiusKm: 25 }, // Quảng Nam
  "51": { lat: 15.1213, lng: 108.8044, radiusKm: 25 }, // Quảng Ngãi
  "52": { lat: 13.7829, lng: 109.2196, radiusKm: 25 }, // Bình Định
  "54": { lat: 13.0959, lng: 109.2911, radiusKm: 25 }, // Phú Yên
  "56": { lat: 12.2388, lng: 109.1967, radiusKm: 25 }, // Khánh Hoà
  "58": { lat: 11.5753, lng: 108.9886, radiusKm: 25 }, // Ninh Thuận
  "60": { lat: 10.9333, lng: 108.1000, radiusKm: 25 }, // Bình Thuận

  // Tây Nguyên
  "62": { lat: 14.0583, lng: 108.2772, radiusKm: 30 }, // Kon Tum
  "64": { lat: 13.9833, lng: 108.0000, radiusKm: 30 }, // Gia Lai
  "66": { lat: 12.6700, lng: 108.0500, radiusKm: 30 }, // Đắk Lắk
  "67": { lat: 12.2646, lng: 107.6098, radiusKm: 30 }, // Đắk Nông
  "68": { lat: 11.9404, lng: 108.4583, radiusKm: 30 }, // Lâm Đồng

  // Đông Nam Bộ
  "70": { lat: 11.5378, lng: 106.7935, radiusKm: 25 }, // Bình Phước
  "72": { lat: 11.3100, lng: 106.0980, radiusKm: 25 }, // Tây Ninh
  "74": { lat: 11.3254, lng: 106.4770, radiusKm: 25 }, // Bình Dương
  "75": { lat: 10.9447, lng: 106.8243, radiusKm: 25 }, // Đồng Nai
  "77": { lat: 10.5417, lng: 107.2429, radiusKm: 25 }, // Bà Rịa - Vũng Tàu

  // Đồng bằng sông Cửu Long
  "80": { lat: 10.5439, lng: 106.4108, radiusKm: 25 }, // Long An
  "82": { lat: 10.3500, lng: 106.3600, radiusKm: 25 }, // Tiền Giang
  "83": { lat: 10.2433, lng: 106.3722, radiusKm: 25 }, // Bến Tre
  "84": { lat: 9.9347, lng: 106.3422, radiusKm: 25 }, // Trà Vinh
  "86": { lat: 9.9952, lng: 105.7720, radiusKm: 25 }, // Vĩnh Long
  "87": { lat: 10.4938, lng: 105.6882, radiusKm: 25 }, // Đồng Tháp
  "89": { lat: 10.3868, lng: 105.4351, radiusKm: 25 }, // An Giang
  "91": { lat: 10.2200, lng: 104.7896, radiusKm: 30 }, // Kiên Giang
  "93": { lat: 9.7836, lng: 105.6260, radiusKm: 25 }, // Hậu Giang
  "94": { lat: 9.6000, lng: 105.9700, radiusKm: 25 }, // Sóc Trăng
  "95": { lat: 9.2870, lng: 105.7244, radiusKm: 25 }, // Bạc Liêu
  "96": { lat: 9.1769, lng: 105.1524, radiusKm: 25 }, // Cà Mau
};

export function getProvinceBias(code: string | null | undefined): ProvinceBias | null {
  if (!code) return null;
  return PROVINCE_GEO[code] || null;
}

// Default fallback when nothing selected — Hà Nội.
export const DEFAULT_PROVINCE_CODE = "01";
export const DEFAULT_PROVINCE_NAME = "Hà Nội";
