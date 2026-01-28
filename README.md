# automation-voice

Dự án E2E (Cucumber + Playwright)

## Công nghệ sử dụng

- Cucumber 12
- Playwright 1.58
- TypeScript 5
- Chai
- dotenv

## Yêu cầu hệ thống

- Node.js (phiên bản tương thích với project)
- Playwright browsers: chạy `npx playwright install` nếu chưa cài

## Cài đặt

```bash
npm install
```

(Tùy chọn) Cài browser cho Playwright:

```bash
npx playwright install
```

## Biến môi trường

| Biến | Mô tả | Mặc định |
|------|--------|-----------|
| `BASE_URL` | URL ứng dụng cần test | `http://localhost:3000` |
| `HEADLESS` | `false` để chạy browser có giao diện (headed) | — |

Gợi ý: tạo file `.env` ở thư mục gốc và khai báo `BASE_URL` (và `HEADLESS` nếu cần).

## Chạy test

- **Headless** (chạy nền, không mở cửa sổ browser):

```bash
npm run test:bdd
```

- **Headed** (mở browser để xem thao tác):

```bash
npm run test:bdd:headed
```

## Cấu trúc thư mục

- `src/features/` — file Gherkin
- `src/pages/` — Page Objects
- `src/steps/` — Step definitions
- `src/support/` — World (Playwright), hooks
- `src/utils/` — env helper
- `src/data/` — dữ liệu test (ví dụ file WAV)
- `reports/` — báo cáo Cucumber (HTML, JSON)

## Báo cáo

Sau khi chạy test:

- `reports/cucumber-report.html` — báo cáo HTML
- `reports/cucumber-report.json` — báo cáo JSON

## Ghi chú

- File mẫu dùng cho bước upload: `src/data/data-training-Dataset 1-1767668223166.wav`.
