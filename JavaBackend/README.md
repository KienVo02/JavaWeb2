# JavaWeb2 - StringBool Project

## Giới thiệu

Dự án **JavaWeb2** là một ứng dụng Spring Boot được xây dựng để hỗ trợ các tính năng liên quan đến xử lý **StringBool** - một cấu trúc dữ liệu mạnh mẽ trong Java.

## StringBool là gì?

**StringBool** là một khái niệm trong Java để xử lý các giá trị boolean dưới dạng chuỗi ký tự, cho phép:

- Chuyển đổi linh hoạt giữa các định dạng String và Boolean
- Hỗ trợ nhiều dạng biểu diễn (true/false, yes/no, 1/0, etc.)
- Xử lý lỗi và kiểm chứng dữ liệu an toàn
- Tích hợp dễ dàng vào các ứng dụng web

## Công nghệ sử dụng

- **Java 11+**
- **Spring Boot** - Framework web
- **Maven** - Build tool
- **Maven Wrapper** - Quản lý phiên bản Maven

## Cấu trúc dự án

```
kienweb2/
├── src/
│   ├── main/
│   │   ├── java/com/example/kienweb2/
│   │   │   └── Kienweb2Application.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── static/
│   │       └── templates/
│   └── test/
│       └── java/com/example/kienweb2/
│           └── Kienweb2ApplicationTests.java
├── pom.xml
├── mvnw
├── mvnw.cmd
└── README.md
```

## Cài đặt

### Yêu cầu
- Java 11 hoặc cao hơn
- Maven 3.6+

### Hướng dẫn cài đặt

1. **Clone repository:**
   ```bash
   git clone https://github.com/KienVo02/JavaWeb2.git
   cd JavaWeb2
   ```

2. **Build dự án:**
   ```bash
   ./mvnw clean install
   ```
   Hoặc trên Windows:
   ```bash
   mvnw.cmd clean install
   ```

3. **Chạy ứng dụng:**
   ```bash
   ./mvnw spring-boot:run
   ```
   Hoặc trên Windows:
   ```bash
   mvnw.cmd spring-boot:run
   ```

## Sử dụng StringBool

### Ví dụ cơ bản

```java
// Chuyển đổi String sang Boolean
String value = "true";
Boolean result = StringBool.parseBoolean(value);

// Hỗ trợ nhiều định dạng
StringBool.parseBoolean("yes");    // true
StringBool.parseBoolean("no");     // false
StringBool.parseBoolean("1");      // true
StringBool.parseBoolean("0");      // false

// Chuyển đổi ngược lại
String str = StringBool.toString(true);  // "true"
```

## API Endpoints

Ứng dụng cung cấp các endpoint RESTful để xử lý StringBool:

- `GET /api/stringbool/parse/{value}` - Parse một giá trị chuỗi sang boolean
- `POST /api/stringbool/convert` - Chuyển đổi batch các giá trị StringBool

## Phát triển

### Chạy test

```bash
./mvnw test
```

### Cấu hình ứng dụng

Chỉnh sửa `src/main/resources/application.properties`:

```properties
server.port=8080
spring.application.name=kienweb2
```

## Contributing

Để đóng góp cho dự án:

1. Fork repository
2. Tạo branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push đến branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## License

Dự án này được cấp phép dưới giấy phép MIT. Xem file [LICENSE](LICENSE) để biết chi tiết.

## Liên hệ

- **Tác giả:** KienVo02
- **GitHub:** https://github.com/KienVo02/JavaWeb2
- **Issues:** https://github.com/KienVo02/JavaWeb2/issues

## Tài liệu tham khảo

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Java Boolean Documentation](https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html)
- [Maven Guide](https://maven.apache.org/guides/getting-started/)

---

**Cập nhật lần cuối:** 5 tháng 6 năm 2026
