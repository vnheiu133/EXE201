export interface Country {
    iso2: string;
    name: string;
}

export interface State {
    iso2: string;
    name: string;
}

const VIETNAM_COUNTRIES: Country[] = [
    { iso2: "VN", name: "Việt Nam" },
];

const VIETNAM_STATES: State[] = [
    { iso2: "AG", name: "An Giang" },
    { iso2: "BRVT", name: "Bà Rịa - Vũng Tàu" },
    { iso2: "BG", name: "Bắc Giang" },
    { iso2: "BK", name: "Bắc Kạn" },
    { iso2: "BL", name: "Bạc Liêu" },
    { iso2: "BN", name: "Bắc Ninh" },
    { iso2: "BT", name: "Bến Tre" },
    { iso2: "BD", name: "Bình Dương" },
    { iso2: "BDI", name: "Bình Định" },
    { iso2: "BP", name: "Bình Phước" },
    { iso2: "BTH", name: "Bình Thuận" },
    { iso2: "CM", name: "Cà Mau" },
    { iso2: "CT", name: "Cần Thơ" },
    { iso2: "CB", name: "Cao Bằng" },
    { iso2: "DN", name: "Đà Nẵng" },
    { iso2: "DL", name: "Đắk Lắk" },
    { iso2: "DNO", name: "Đắk Nông" },
    { iso2: "DB", name: "Điện Biên" },
    { iso2: "DNA", name: "Đồng Nai" },
    { iso2: "DT", name: "Đồng Tháp" },
    { iso2: "GL", name: "Gia Lai" },
    { iso2: "HG", name: "Hà Giang" },
    { iso2: "HNA", name: "Hà Nam" },
    { iso2: "HN", name: "Hà Nội" },
    { iso2: "HT", name: "Hà Tĩnh" },
    { iso2: "HD", name: "Hải Dương" },
    { iso2: "HP", name: "Hải Phòng" },
    { iso2: "HGI", name: "Hậu Giang" },
    { iso2: "HCM", name: "TP. Hồ Chí Minh" },
    { iso2: "HB", name: "Hòa Bình" },
    { iso2: "HY", name: "Hưng Yên" },
    { iso2: "KH", name: "Khánh Hòa" },
    { iso2: "KG", name: "Kiên Giang" },
    { iso2: "KT", name: "Kon Tum" },
    { iso2: "LC", name: "Lai Châu" },
    { iso2: "LD", name: "Lâm Đồng" },
    { iso2: "LS", name: "Lạng Sơn" },
    { iso2: "LCA", name: "Lào Cai" },
    { iso2: "LA", name: "Long An" },
    { iso2: "ND", name: "Nam Định" },
    { iso2: "NA", name: "Nghệ An" },
    { iso2: "NB", name: "Ninh Bình" },
    { iso2: "NT", name: "Ninh Thuận" },
    { iso2: "PT", name: "Phú Thọ" },
    { iso2: "PY", name: "Phú Yên" },
    { iso2: "QB", name: "Quảng Bình" },
    { iso2: "QNA", name: "Quảng Nam" },
    { iso2: "QNG", name: "Quảng Ngãi" },
    { iso2: "QN", name: "Quảng Ninh" },
    { iso2: "QT", name: "Quảng Trị" },
    { iso2: "ST", name: "Sóc Trăng" },
    { iso2: "SL", name: "Sơn La" },
    { iso2: "TN", name: "Tây Ninh" },
    { iso2: "TB", name: "Thái Bình" },
    { iso2: "TNG", name: "Thái Nguyên" },
    { iso2: "TH", name: "Thanh Hóa" },
    { iso2: "TTH", name: "Thừa Thiên Huế" },
    { iso2: "TG", name: "Tiền Giang" },
    { iso2: "TV", name: "Trà Vinh" },
    { iso2: "TQ", name: "Tuyên Quang" },
    { iso2: "VL", name: "Vĩnh Long" },
    { iso2: "VP", name: "Vĩnh Phúc" },
    { iso2: "YB", name: "Yên Bái" },
];

export const useCountries = () => {
    return { countries: VIETNAM_COUNTRIES, error: null };
};

export const useStates = (countryCode: string) => {
    return { states: countryCode === "VN" ? VIETNAM_STATES : [], error: null };
};
