import { Page } from "playwright";
import { expect } from "@playwright/test";
import * as path from "path";

export class CreateRequestFormPage {
  constructor(private page: Page) {}

  /**
   * Điền họ và tên
   * @param name Họ và tên
   */
  async fillFullName(name: string) {
    // Tìm input field bằng label "Họ và tên"
    const fullNameInput = this.page.locator('input[placeholder*="Nhập họ và tên"], input[placeholder*="họ và tên"]').first();
    await fullNameInput.waitFor({ state: "visible" });
    await fullNameInput.fill(name);
  }

  /**
   * Điền số định danh cá nhân
   * @param id Số định danh cá nhân
   */
  async fillPersonalId(id: string) {
    // Tìm input field bằng label "Số định danh cá nhân"
    const personalIdInput = this.page.locator('input[placeholder*="Nhập số định danh cá nhân"], input[placeholder*="số định danh"]').first();
    await personalIdInput.waitFor({ state: "visible" });
    await personalIdInput.fill(id);
  }

  /**
   * Điền ngày sinh vào input field
   * @param dateString Ngày sinh theo format "dd/mm/yyyy"
   */
  async selectDateOfBirth(dateString: string) {
    // Tìm input field ngày sinh
    const dateInput = this.page.locator('input[placeholder*="dd/mm/yyyy"], input[placeholder*="Ngày sinh"]').first();
    await dateInput.waitFor({ state: "visible" });
    
    // Nhập trực tiếp ngày sinh vào input field với format "dd/mm/yyyy"
    await dateInput.fill(dateString);
    
    // Đợi một chút để đảm bảo giá trị đã được nhập
    await this.page.waitForTimeout(300);
  }

  /**
   * Chọn giới tính từ dropdown
   * @param gender Giới tính (ví dụ: "Nam")
   */
  async selectGender(gender: string) {
    // Tìm dropdown giới tính
    const genderDropdown = this.page.locator('input[placeholder*="Chọn giới tính"], input[placeholder*="giới tính"]').first();
    await genderDropdown.waitFor({ state: "visible" });
    await genderDropdown.click();
    await this.page.waitForTimeout(300);
    
    // Tìm và click option
    const option = this.page.locator(`text=${gender}`).first();
    await option.waitFor({ state: "visible", timeout: 5000 });
    await option.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Chọn đơn vị từ dropdown (chọn option theo index)
   * @param optionIndex Index của option (1-based, option đầu tiên = 1)
   */
  async selectUnit(optionIndex: number) {
    // Tìm dropdown đơn vị
    const unitDropdown = this.page.locator('input[placeholder*="Chọn đơn vị"], input[placeholder*="đơn vị"]').first();
    await unitDropdown.waitFor({ state: "visible" });
    await unitDropdown.click();
    await this.page.waitForTimeout(300);
    // Đợi dropdown menu mở ra
    // Sử dụng selector chính xác dựa trên HTML: menuable_content_active (một dấu gạch dưới)
    const dropdownMenu = this.page.locator('.menuable__content__active').first();
    await dropdownMenu.waitFor({ state: "visible", timeout: 5000 });
    console.log('listbox-listbox')
    // Tìm listbox container bên trong dropdown menu
    const listbox = dropdownMenu.locator('[role="listbox"]').first();
    await listbox.waitFor({ state: "visible", timeout: 5000 });
    // Chọn option theo index (0-based trong code, nhưng user truyền vào 1-based)
    // Option có role="option" và class v-list-item
    const option = listbox.locator('div[role="option"]').nth(optionIndex - 1);
    await option.waitFor({ state: "visible", timeout: 5000 });
    await option.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Upload file
   * @param filePath Đường dẫn đến file (relative từ project root)
   */
  async uploadFile(filePath: string) {
    // Click button "Tải tệp lên"
    const uploadButton = this.page.locator('button:has-text("Tải tệp lên"), button:has-text("tải tệp")').first();
    await uploadButton.waitFor({ state: "visible" });
    await uploadButton.click();
    await this.page.waitForTimeout(500);
    
    // Tìm input[type="file"] (có thể ẩn)
    const fileInput = this.page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: "attached", timeout: 5000 });
    
    // Resolve file path (từ project root)
    const projectRoot = process.cwd();
    const absolutePath = path.resolve(projectRoot, filePath);
    
    // Upload file
    await fileInput.setInputFiles(absolutePath);
    
    // Đợi file upload xong
    await this.page.waitForTimeout(1000);
  }

  /**
   * Click button "Hoàn tất"
   */
  async clickComplete() {
    const completeButton = this.page.locator('button:has-text("Hoàn tất"), button:has-text("hoàn tất")').first();
    await completeButton.waitFor({ state: "visible" });
    await completeButton.click();
    
    // Đợi action hoàn thành
    await this.page.waitForTimeout(1000);
  }

  /**
   * Kiểm tra thông báo thành công
   * @param message Text của thông báo (optional, nếu không có sẽ tìm bất kỳ thông báo thành công nào)
   */
  async assertSuccessMessage(message?: string) {
    // Đợi thông báo xuất hiện
    await this.page.waitForTimeout(2000);
    
    if (message) {
      // Kiểm tra thông báo cụ thể
      const messageLocator = this.page.locator(`text=${message}`).first();
      await expect(messageLocator).toBeVisible({ timeout: 10000 });
    } else {
      // Tìm bất kỳ thông báo thành công nào (có thể là toast, alert, hoặc text)
      const successIndicators = [
        'text=thành công',
        'text=Thành công',
        '.v-snack--success',
        '.success-message',
        '[role="alert"]'
      ];
      
      let found = false;
      for (const selector of successIndicators) {
        try {
          const locator = this.page.locator(selector).first();
          await locator.waitFor({ state: "visible", timeout: 2000 });
          found = true;
          break;
        } catch {
          // Tiếp tục thử selector tiếp theo
        }
      }
      
      if (!found) {
        throw new Error('Không tìm thấy thông báo thành công');
      }
    }
  }
}
