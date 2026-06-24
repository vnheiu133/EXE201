// lib/variants.ts

export function getVariantOptions(prodName: string, catName: string): string[] {
  const name = (prodName || "").toLowerCase();
  const category = (catName || "").toLowerCase();

  // --- THỨ CĂN (Food) ---
  if (name.includes("royal canin club pro")) {
    return ["Túi 1kg", "Túi 4kg", "Túi 10kg"];
  }
  if (name.includes("whiskas vị cá ngừ")) {
    return ["Túi 1.2kg", "Túi 3kg", "Túi 7kg"];
  }
  if (name.includes("pedigree vị bò")) {
    return ["Túi 1.5kg", "Túi 3kg", "Túi 8kg"];
  }
  if (name.includes("chappi vị gà")) {
    return ["Lon 400g", "Khay 12 lon", "Combo dùng thử"];
  }
  if (name.includes("royal canin mother & babycat")) {
    return ["Túi 400g", "Túi 2kg", "Túi 4kg"];
  }
  if (name.includes("whiskas lon vị cá hồi")) {
    return ["Lon 80g", "Khay 24 lon", "Combo dùng thử"];
  }
  if (name.includes("smartheart gold")) {
    return ["Túi 1kg", "Túi 3kg", "Túi 9kg"];
  }
  if (name.includes("bio-milk")) {
    return ["Gói 100g", "Hộp 1kg", "Hộp 2kg"];
  }

  // --- ĐỒ CHƠI (Toys) ---
  if (name.includes("xương cao su")) {
    return ["Size Nhỏ", "Size Vừa", "Size Lớn"];
  }
  if (name.includes("cần câu lông vũ")) {
    return ["Cây ngắn 30cm", "Cây dài 50cm"];
  }
  if (name.includes("bóng cao su gai")) {
    return ["Đường kính 5cm", "Đường kính 7cm", "Đường kính 9cm"];
  }
  if (name.includes("dây thừng kéo co")) {
    return ["Dây đơn 20cm", "Dây đôi 40cm"];
  }
  if (name.includes("chuột đồ chơi bông")) {
    return ["Hộp 1 con", "Hộp 3 con", "Hộp 5 con"];
  }
  if (name.includes("đĩa bay huấn luyện")) {
    return ["Đường kính 18cm", "Đường kính 22cm"];
  }
  if (name.includes("tháp bóng 3 tầng")) {
    return ["Tháp 3 tầng", "Tháp 4 tầng"];
  }
  if (name.includes("cá nhồi bông")) {
    return ["Cá ngừ 20cm", "Cá hồi 30cm", "Cá chép 40cm"];
  }

  // --- PHỤ KIỆN (Accessories) ---
  if (name.includes("vòng cổ da bò")) {
    return ["Bản 1.5cm (Chó nhỏ)", "Bản 2.5cm (Chó vừa)", "Bản 3.5cm (Chó lớn)"];
  }
  if (name.includes("dây dắt") && name.includes("tự động")) {
    return ["Dây 3m (Dưới 10kg)", "Dây 5m (Dưới 20kg)", "Dây 8m (Dưới 40kg)"];
  }
  if (name.includes("nệm ngủ bông")) {
    return ["Size S (40x30cm)", "Size M (50x40cm)", "Size L (60x50cm)", "Size XL (75x60cm)"];
  }
  if (name.includes("bát ăn đôi inox")) {
    return ["Bát Nhỏ (2x150ml)", "Bát Vừa (2x350ml)", "Bát Lớn (2x650ml)"];
  }
  if (name.includes("khay vệ sinh")) {
    return ["Size Tiêu chuẩn (40x30cm)", "Size Lớn (50x40cm)"];
  }
  if (name.includes("chuồng quây sắt")) {
    return ["Bộ 6 tấm (35x35cm)", "Bộ 8 tấm (35x35cm)", "Bộ 12 tấm (35x35cm)"];
  }
  if (name.includes("balo phi hành gia")) {
    return ["Bản Tiêu chuẩn", "Bản Mở rộng lưng", "Bản Da PU cao cấp"];
  }
  if (name.includes("nhà cây cào móng")) {
    return ["Thấp 1 tầng (50cm)", "Trung bình 2 tầng (90cm)", "Cao 3 tầng (140cm)"];
  }

  // --- VỆ SINH & TẮM RỬA (Hygiene) ---
  if (name.includes("sos white")) {
    return ["Chai 530ml", "Combo 2 chai"];
  }
  if (name.includes("hantox")) {
    return ["Chai 100ml", "Chai 200ml", "Chai 500ml"];
  }
  if (name.includes("lược chải lông")) {
    return ["Màu Xanh", "Màu Hồng", "Màu Xám"];
  }
  if (name.includes("vệ sinh tai")) {
    return ["Lọ 50ml", "Lọ 100ml"];
  }
  if (name.includes("kìm cắt móng")) {
    return ["Size Nhỏ (mèo/chó nhỏ)", "Size Lớn (chó vừa/lớn)"];
  }
  if (name.includes("máy sấy lông")) {
    return ["Công suất 2200W", "Công suất 2800W (Siêu mạnh)"];
  }
  if (name.includes("nước hoa dưỡng lông")) {
    return ["Chai 50ml", "Chai 100ml"];
  }
  if (name.includes("cát vệ sinh")) {
    return ["Túi 5 Lít (khoảng 4kg)", "Túi 10 Lít (khoảng 8kg)"];
  }

  // Fallbacks
  if (category.includes("thức ăn") || category.includes("food")) {
    return ["Túi 1kg", "Túi 3kg", "Túi 5kg"];
  }
  if (category.includes("đồ chơi") || category.includes("toy")) {
    return ["Màu ngẫu nhiên", "Combo 2 cái"];
  }
  if (category.includes("phụ kiện") || category.includes("accessory") || category.includes("furniture")) {
    return ["Size S (Nhỏ)", "Size M (Vừa)", "Size L (Lớn)"];
  }
  if (category.includes("vệ sinh") || category.includes("tắm") || category.includes("hygiene") || category.includes("grooming")) {
    return ["Chai 250ml", "Chai 500ml", "Chai 1 Lít"];
  }

  return ["Tiêu chuẩn", "Cao cấp"];
}
