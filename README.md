# FashionHub

Website cửa hàng thời trang trực tuyến dùng HTML, CSS, JavaScript thuần, Bootstrap 5, jQuery và MockAPI.io.

## Cấu trúc

```text
shopEasy/
+-- index.html
+-- admin.html
+-- css/
|   +-- style.css
+-- js/
|   +-- api.js
|   +-- main.js
|   +-- admin.js
|   +-- utils.js
+-- img/
+-- README.md
```

## Cấu hình MockAPI

Tạo project trên MockAPI.io và tạo 2 resource:

- `products`: `id`, `name`, `price`, `category`, `image`, `description`, `stock`, `sizes`, `createdAt`
- `categories`: `id`, `name`

Sau đó mở `js/api.js` và thay:

```js
const API_BASE_URL = "https://YOUR_PROJECT_ID.mockapi.io/api/v1";
```

bằng endpoint MockAPI thật của bạn.

## Chức năng đạt yêu cầu

- JavaScript thuần: biến string/number/array/object, `if`, `for`, `while`, hàm có tham số và return, DOM event `click`, `submit`, `input`, thao tác `getElementById`, `querySelector` qua `closest`, `innerHTML`, `classList`.
- JSON & Fetch API: GET/POST/PUT/DELETE resource `products` bằng `fetch().then().catch()`, parse JSON, loading spinner, thông báo lỗi.
- Form Validation: required, giá > 0, tên không rỗng, URL ảnh hợp lệ, inline error, chặn submit sai, reset form khi lưu thành công.
- jQuery: selector, `.on()`, `.click()`, `.hide()`, `.fadeIn()`, `.slideDown()`, `$.ajax()` gọi resource `categories`, `.html()`.
- Bootstrap 5: Grid System, utility classes, Navbar, Card, Modal, Badge, Toast, Button, Table, Form, responsive mobile/tablet/desktop.

## Cách chạy

Mở trực tiếp `index.html` trong trình duyệt để xem cửa hàng, hoặc mở `admin.html` để quản lý sản phẩm. Khi chưa cấu hình MockAPI thật, trang sẽ hiện thông báo lỗi kết nối API.
