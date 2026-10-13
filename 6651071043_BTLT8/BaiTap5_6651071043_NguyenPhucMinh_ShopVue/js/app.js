/* =====================================================================
   BÀI 5 – app.js  (Vue 3 qua CDN, KHÔNG cần Node.js/npm/Vite)
   File này phải được nhúng SAU vue.global.js để có biến toàn cục `Vue`.

   SO SÁNH NGẮN VỚI VANILLA JS:
   Nếu dùng Vanilla JS, mỗi lần thêm/xoá giỏ hàng phải tự querySelector
   + cập nhật DOM thủ công (đổi số ở header, dựng lại danh sách, tính lại
   tổng tiền...). Vue tự động làm điều này nhờ reactivity: ta chỉ cần đổi
   dữ liệu `cart`, giao diện (UI) tự cập nhật  →  "UI = function của data".
   ===================================================================== */

// Khoá lưu giỏ hàng trong localStorage (giữ giỏ hàng khi tải lại trang)
const CART_KEY = 'techgear_cart_v1';

// Biến giữ bộ đếm giờ của thông báo nhỏ (toast) – không cần reactive
let toastTimer = null;

Vue.createApp({
  /* ---------------------------------------------------------------
     DATA – "nguồn sự thật" duy nhất. Mọi thứ trên màn hình đều suy ra từ đây.
     --------------------------------------------------------------- */
  data() {
    return {
      // Danh sách 8 sản phẩm phụ kiện (tên, ảnh, giá, mô tả ngắn, loại)
      products: [
        { id: 1, ten: 'Ốp lưng Electric Blue',   anh: '../images/op-lung-xanh.webp',   gia: 250000, loai: 'Ốp lưng',  moTa: 'Ốp silicon xanh điện, chống sốc 4 góc, viền camera nâng cao.' },
        { id: 2, ten: 'Ốp lưng trong Crystal',   anh: '../images/op-lung-trong.jpg',  gia: 180000, loai: 'Ốp lưng',  moTa: 'Ốp trong suốt không ố vàng, khoe trọn màu máy gốc.' },
        { id: 3, ten: 'Sạc không dây 15W',       anh: '../images/sac-khong-day.jpg',  gia: 390000, loai: 'Sạc',      moTa: 'Đế sạc không dây chuẩn Qi, sạc nhanh 15W, có đèn báo LED.' },
        { id: 4, ten: 'Tai nghe Active TWS',     anh: '../images/tai-nghe-tws.jpg',   gia: 690000, loai: 'Tai nghe', moTa: 'Bluetooth 5.3, chống ồn chủ động, pin 24 giờ cùng hộp sạc.' },
        { id: 5, ten: 'Ốp lưng Midnight Black',  anh: '../images/op-lung-den.webp',    gia: 220000, loai: 'Ốp lưng',  moTa: 'Ốp nhám đen chống bám vân tay, cầm chắc tay, mỏng nhẹ.' },
        { id: 6, ten: 'Cáp USB-C bện dù 1m',     anh: '../images/cap-usb-c.webp',      gia: 120000, loai: 'Cáp',      moTa: 'Cáp sạc nhanh 60W, dây bện dù siêu bền, chịu uốn 10.000 lần.' },
        { id: 7, ten: 'Pin dự phòng 10.000mAh',  anh: '../images/pin-du-phong.webp',   gia: 450000, loai: 'Sạc',      moTa: 'Pin dự phòng mỏng gọn, 2 cổng ra, sạc nhanh PD 20W.' },
        { id: 8, ten: 'Củ sạc nhanh 20W',        anh: '../images/cu-sac-20w.png',     gia: 290000, loai: 'Sạc',      moTa: 'Củ sạc USB-C PD 20W, an toàn nhiệt, tương thích đa thiết bị.' }
      ],

      // Giỏ hàng: mỗi phần tử là sản phẩm + soLuong (thêm trùng thì tăng số lượng)
      cart: [],

      tuKhoa: '',              // gắn với ô tìm kiếm bằng v-model (liên kết 2 chiều)
      loaiDangChon: 'Tất cả',  // bộ lọc theo loại sản phẩm
      menuOpen: false,         // đóng/mở menu trên điện thoại

      toast: '',               // nội dung thông báo nhỏ khi thêm vào giỏ
      hienDonHang: false,      // hiện hộp thoại "đặt hàng thành công"
      donHang: { soLuong: 0, tong: 0 }
    };
  },

  /* ---------------------------------------------------------------
     COMPUTED – giá trị TỰ TÍNH LẠI mỗi khi dữ liệu nó phụ thuộc thay đổi.
     --------------------------------------------------------------- */
  computed: {
    // Tổng số lượng sản phẩm trong giỏ → hiển thị ở header: Giỏ hàng ({{ cartCount }})
    cartCount() {
      return this.cart.reduce((tong, item) => tong + item.soLuong, 0);
    },

    // Tổng tiền = Σ (giá × số lượng). Thêm/xoá/đổi số lượng → tự cập nhật.
    tongTien() {
      return this.cart.reduce((tong, item) => tong + item.gia * item.soLuong, 0);
    },

    // Danh sách loại để tạo các nút lọc: ['Tất cả', 'Ốp lưng', 'Sạc', ...]
    categories() {
      return ['Tất cả', ...new Set(this.products.map(p => p.loai))];
    },

    // Danh sách đã lọc theo từ khoá (không phân biệt hoa/thường, bỏ qua dấu tiếng Việt)
    // và theo loại đang chọn. Template chỉ việc v-for trên danh sách này.
    danhSachLoc() {
      const tu = this.chuanHoa(this.tuKhoa.trim());
      return this.products.filter(p => {
        const dungLoai = this.loaiDangChon === 'Tất cả' || p.loai === this.loaiDangChon;
        const dungTu = tu === '' || this.chuanHoa(p.ten + ' ' + p.moTa + ' ' + p.loai).includes(tu);
        return dungLoai && dungTu;
      });
    }
  },

  /* ---------------------------------------------------------------
     METHODS – các hành động do người dùng kích hoạt (@click, ...).
     --------------------------------------------------------------- */
  methods: {
    // Chuyển về chữ thường + bỏ dấu để tìm "op lung" vẫn ra "Ốp lưng"
    chuanHoa(chuoi) {
      return chuoi
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'd');
    },

    // 250000 → "250.000 đ"
    dinhDangTien(so) {
      return so.toLocaleString('vi-VN') + ' đ';
    },

    // Số lượng của 1 sản phẩm đang có trong giỏ (để hiện nhãn "Trong giỏ: n" trên thẻ)
    soLuongTrongGio(id) {
      const item = this.cart.find(i => i.id === id);
      return item ? item.soLuong : 0;
    },

    // Thêm sản phẩm vào giỏ. Đã có thì tăng số lượng, chưa có thì push dòng mới.
    // (Vanilla JS: phải querySelector danh sách giỏ + số ở header rồi tự tạo/sửa phần tử DOM.
    //  Vue: chỉ đổi mảng `cart`, giao diện tự vẽ lại.)
    themVaoGio(sanPham) {
      const daCo = this.cart.find(i => i.id === sanPham.id);
      if (daCo) {
        if (daCo.soLuong < 99) daCo.soLuong++;
      } else {
        this.cart.push({ ...sanPham, soLuong: 1 });
      }
      this.hienToast('Đã thêm "' + sanPham.ten + '" vào giỏ');
    },

    // Xoá hẳn 1 dòng sản phẩm khỏi giỏ theo vị trí (index) trong mảng cart.
    xoaKhoiGio(index) {
      this.cart.splice(index, 1);
    },

    // Tăng số lượng của dòng thứ index
    tangSoLuong(index) {
      if (this.cart[index].soLuong < 99) this.cart[index].soLuong++;
    },

    // Giảm số lượng; về 0 thì xoá dòng đó khỏi giỏ
    giamSoLuong(index) {
      if (this.cart[index].soLuong > 1) {
        this.cart[index].soLuong--;
      } else {
        this.xoaKhoiGio(index);
      }
    },

    // Xoá toàn bộ giỏ hàng
    xoaTatCa() {
      this.cart = [];
    },

    // Đặt lại ô tìm kiếm + bộ lọc loại
    resetBoLoc() {
      this.tuKhoa = '';
      this.loaiDangChon = 'Tất cả';
    },

    // "Thanh toán" (demo): chụp lại thông tin đơn, làm trống giỏ, mở hộp thoại cảm ơn
    thanhToan() {
      if (this.cart.length === 0) return;
      this.donHang = { soLuong: this.cartCount, tong: this.tongTien };
      this.cart = [];
      this.hienDonHang = true;
    },

    // Hiện thông báo nhỏ 2 giây ở cuối màn hình
    hienToast(noiDung) {
      this.toast = noiDung;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { this.toast = ''; }, 2000);
    },

    // Lưu giỏ vào localStorage (chỉ lưu id + soLuong, giá luôn lấy lại từ products)
    luuGioHang() {
      try {
        const gon = this.cart.map(i => ({ id: i.id, soLuong: i.soLuong }));
        localStorage.setItem(CART_KEY, JSON.stringify(gon));
      } catch (e) { /* trình duyệt chặn lưu trữ → bỏ qua, giỏ vẫn chạy bình thường */ }
    },

    // Nạp lại giỏ đã lưu khi mở trang
    napGioHang() {
      try {
        const daLuu = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        if (!Array.isArray(daLuu)) return;
        this.cart = daLuu
          .map(s => {
            const p = this.products.find(x => x.id === s.id);
            const sl = Number(s.soLuong);
            return p && sl > 0 ? { ...p, soLuong: Math.min(sl, 99) } : null;
          })
          .filter(Boolean);
      } catch (e) { /* dữ liệu hỏng → bắt đầu với giỏ trống */ }
    }
  },

  /* ---------------------------------------------------------------
     WATCH – "theo dõi" cart: hễ thay đổi (kể cả sâu bên trong) thì lưu lại.
     --------------------------------------------------------------- */
  watch: {
    cart: {
      deep: true,
      handler() { this.luuGioHang(); }
    }
  },

  // created(): chạy một lần khi ứng dụng vừa khởi tạo, trước khi vẽ giao diện
  created() {
    this.napGioHang();
  }
}).mount('#app'); // gắn ứng dụng Vue vào <div id="app"> trong index.html
