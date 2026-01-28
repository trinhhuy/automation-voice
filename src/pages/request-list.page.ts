import { Page } from "playwright";
import { expect } from "@playwright/test";
import { getEnv } from "../utils/env";

export class RequestListPage {
  constructor(private page: Page) {}

  /**
   * Kiểm tra xem đã ở đúng trang chưa
   * @param expectedText Text mong đợi hiển thị trên trang
   */
  private async isOnExpectedPage(expectedText: string): Promise<boolean> {
    try {
      const textLocator = this.page.locator(`text=${expectedText}`).first();
      await textLocator.waitFor({ state: "visible", timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Kiểm tra xem đã ở trang danh sách yêu cầu chưa
   * @returns true nếu đã ở đúng trang, false nếu chưa
   */
  async isOnRequestListPage(): Promise<boolean> {
    const expectedPageText = "Danh sách yêu cầu sinh trắc học giọng nói đơn lẻ";
    return await this.isOnExpectedPage(expectedPageText);
  }

  /**
   * Tìm menu item trong sidebar
   * @param menuText Text của menu item
   */
  private async findMenuItemInSidebar(menuText: string) {
    // Thử tìm trong sidebar container (có thể là nav, aside, hoặc div với class sidebar)
    const sidebarSelectors = [
      'nav',
      'aside',
      '[class*="sidebar"]',
      '[class*="menu"]',
      '[class*="navigation"]'
    ];

    for (const sidebarSelector of sidebarSelectors) {
      try {
        const sidebar = this.page.locator(sidebarSelector).first();
        const menuItem = sidebar.locator(`text=${menuText}`).first();
        const isVisible = await menuItem.isVisible({ timeout: 1000 });
        if (isVisible) {
          return menuItem;
        }
      } catch {
        // Tiếp tục thử selector tiếp theo
      }
    }

    // Nếu không tìm thấy trong sidebar, fallback về tìm trong toàn trang
    return this.page.locator(`text=${menuText}`).first();
  }

  /**
   * Kiểm tra menu item có thể click được không
   * @param menuLocator Locator của menu item
   */
  private async isMenuItemClickable(menuLocator: any): Promise<boolean> {
    try {
      const isVisible = await menuLocator.isVisible({ timeout: 1000 });
      const isEnabled = await menuLocator.isEnabled({ timeout: 1000 });
      return isVisible && isEnabled;
    } catch {
      return false;
    }
  }

  /**
   * Kiểm tra xem menu item đã được expand chưa
   * @param currentMenuItem Menu item hiện tại
   * @param nextMenuItem Menu item tiếp theo (submenu)
   * @returns true nếu menu đã được expand (submenu visible), false nếu chưa
   */
  private async isMenuItemExpanded(currentMenuItem: string, nextMenuItem: string): Promise<boolean> {
    try {
      // Tìm menu item tiếp theo trong sidebar
      const nextMenuLocator = await this.findMenuItemInSidebar(nextMenuItem);
      
      // Kiểm tra xem menu item tiếp theo có visible không
      const isVisible = await nextMenuLocator.isVisible({ timeout: 1000 });
      
      // Nếu visible, menu đã được expand
      return isVisible;
    } catch {
      // Nếu không tìm thấy hoặc không visible, menu chưa được expand
      return false;
    }
  }

  /**
   * Điều hướng menu theo cấp
   * @param menuPath Mảng các menu items theo thứ tự từ cấp cao đến cấp thấp
   */
  async navigateToMenu(menuPath: string[]) {
    // Kiểm tra xem đã ở đúng trang chưa (trang có text "Danh sách yêu cầu sinh trắc học giọng nói đơn lẻ")
    const expectedPageText = "Danh sách yêu cầu sinh trắc học giọng nói đơn lẻ";
    const isOnPage = await this.isOnExpectedPage(expectedPageText);
    if (isOnPage) {
      // Đã ở đúng trang, có thể skip navigation hoặc chỉ đợi trang load
      await this.page.waitForLoadState("domcontentloaded");
      return;
    }

    // Nếu chưa ở đúng trang, thực hiện navigation
    for (let i = 0; i < menuPath.length; i++) {
      const menuItem = menuPath[i];
      
      // Tìm menu item trong sidebar
      const menuLocator = await this.findMenuItemInSidebar(menuItem);
      
      // Đợi menu item hiển thị
      await menuLocator.waitFor({ state: "visible", timeout: 5000 });
      
      // Nếu không phải item cuối cùng, check xem menu đã được expand chưa
      if (i < menuPath.length - 1) {
        const nextMenuItem = menuPath[i + 1];
        const isExpanded = await this.isMenuItemExpanded(menuItem, nextMenuItem);
        
        if (isExpanded) {
          // Menu đã được expand, skip click và đợi menu con hiển thị
          await this.page.waitForTimeout(300);
          continue;
        }
      }
      
      // Kiểm tra xem menu item có thể click được không
      const isClickable = await this.isMenuItemClickable(menuLocator);
      
      if (isClickable) {
        // Scroll vào view nếu cần
        await menuLocator.scrollIntoViewIfNeeded();
        
        // Click vào menu item
        await menuLocator.click({ timeout: 5000 });
        
        // Nếu không phải item cuối cùng, đợi menu con mở ra
        if (i < menuPath.length - 1) {
          // Đợi menu con expand (có thể kiểm tra bằng cách tìm menu item tiếp theo)
          await this.page.waitForTimeout(500);
        }
      } else {
        // Menu item không thể click (có thể đã được expand/active), tiếp tục với item tiếp theo
        continue;
      }
    }
    
    // Đợi trang load xong
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForTimeout(500); // Đợi thêm một chút để đảm bảo trang đã render xong
  }

  /**
   * Click vào tab
   * @param tabName Tên tab cần click
   */
  async clickTab(tabName: string) {
    const tabLocator = this.page.locator(`text=${tabName}`).first();
    await tabLocator.waitFor({ state: "visible" });
    await tabLocator.click();
    await this.page.waitForTimeout(300); // Đợi tab chuyển đổi
  }

  /**
   * Đợi navigation sau khi click (đợi URL thay đổi hoặc element xuất hiện)
   * @param expectedText Text mong đợi xuất hiện sau navigation (optional)
   */
  private async waitForNavigation(expectedText?: string): Promise<void> {
    const currentUrl = this.page.url();
    
    // Đợi URL thay đổi hoặc element xuất hiện
    const promises: Promise<any>[] = [];
    
    // Đợi URL thay đổi
    promises.push(
      this.page
        .waitForURL((url) => url.toString() !== currentUrl, { timeout: 10000 })
        .catch(() => null)
    );
    
    // Nếu có expectedText, đợi element xuất hiện
    if (expectedText) {
      promises.push(
        this.page
          .waitForSelector(`text=${expectedText}`, { state: "visible", timeout: 10000 })
          .catch(() => null)
      );
    }
    
    // Đợi ít nhất một trong hai điều kiện
    await Promise.race(promises);
    
    // Đợi page load xong
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForLoadState("networkidle").catch(() => {
      // Nếu networkidle timeout, không sao, tiếp tục
      return null;
    });
  }

  /**
   * Click vào dropdown và chọn option
   * @param dropdownText Text của dropdown button
   * @param optionText Text của option cần chọn
   */
  async clickDropdownAndSelect(dropdownText: string, optionText: string) {
    // Tìm dropdown button
    const dropdownButton = this.page.locator(`text=${dropdownText}`).first();
    await dropdownButton.waitFor({ state: "visible" });
    
    // Scroll vào view nếu cần
    await dropdownButton.scrollIntoViewIfNeeded();
    
    // Click vào dropdown button
    await dropdownButton.click();
    
    // Đợi dropdown menu mở ra hoàn toàn
    await this.page.waitForTimeout(500);
    
    // Tìm dropdown menu container có class "menuable__content__active"
    const dropdownContainer = this.page.locator('.menuable__content__active').first();
    
    // Đợi container visible và stable
    await dropdownContainer.waitFor({ state: "visible", timeout: 5000 });
    
    // Tìm option bên trong container
    const optionLocator = dropdownContainer.locator(`text=${optionText}`).first();
    await optionLocator.waitFor({ state: "visible", timeout: 5000 });
    
    // Đợi option có thể click được
    await optionLocator.waitFor({ state: "attached" });
    
    // Scroll option vào view để đảm bảo có thể click được
    await optionLocator.scrollIntoViewIfNeeded();
    
    // Đợi một chút để đảm bảo option đã stable
    await this.page.waitForTimeout(200);
    
    // Click vào option và đợi navigation
    // Lưu URL hiện tại để kiểm tra navigation
    const urlBeforeClick = this.page.url();
    
    // Click option
    await optionLocator.click({ timeout: 5000 });
    
    // Đợi navigation (URL thay đổi hoặc element xuất hiện)
    // Nếu URL không thay đổi sau 1 giây, có thể không có navigation
    await this.page.waitForTimeout(1000);
    
    const urlAfterClick = this.page.url();
    
    if (urlAfterClick !== urlBeforeClick) {
      // Có navigation, đợi page load xong
      await this.page.waitForLoadState("domcontentloaded");
      await this.page.waitForLoadState("networkidle").catch(() => {
        // Nếu networkidle timeout, không sao
        return null;
      });
    } else {
      // Không có navigation, có thể là SPA navigation hoặc cần đợi element xuất hiện
      // Đợi một chút để page xử lý
      await this.page.waitForTimeout(1000);
      await this.page.waitForLoadState("domcontentloaded");
    }
    
    // Đợi thêm một chút để đảm bảo page đã render xong
    await this.page.waitForTimeout(500);
  }

  /**
   * Navigate đến trang request list với path cụ thể
   * @param path Path của trang (ví dụ: "quan-ly-yeu-cau-sinh-trac/dang-ki-dan-su")
   */
  async navigateToRequestListPage(path: string) {
    // Lấy base URL từ environment variable
    const baseUrl = getEnv("BASE_URL", "http://localhost:3000");
    
    // Combine base URL với path
    const fullUrl = `${baseUrl}/${path}`;
    
    // Navigate đến URL
    await this.page.goto(fullUrl);
    
    // Đợi page load xong
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForLoadState("networkidle").catch(() => {
      // Nếu networkidle timeout, không sao, tiếp tục
      return null;
    });
    
    // Verify đã đến đúng trang
    const expectedPageText = "Danh sách yêu cầu sinh trắc học giọng nói đơn lẻ";
    await this.page.waitForSelector(`text=${expectedPageText}`, { state: "visible", timeout: 10000 });
  }

  /**
   * Chọn option đầu tiên trong filter dropdown
   * @param filterLabel Label của filter (ví dụ: "Trạng thái", "Đơn vị")
   */
  async selectFirstOptionInFilter(filterLabel: string) {
    try {
      // Filter có thể là input với placeholder hoặc button với text
      const filterLocator = this.page.locator(`text=${filterLabel}`).first();
      await filterLocator.waitFor({ state: "visible", timeout: 5000 });
      // Click trực tiếp vào filterLocator để mở dropdown
      await filterLocator.click({ timeout: 5000 });
      
      // Đợi dropdown menu mở ra
      await this.page.waitForTimeout(300);
      
      // Tìm dropdown menu container
      const dropdownMenu = this.page.locator('.menuable__content__active').first();
      await dropdownMenu.waitFor({ state: "visible", timeout: 5000 });
      
      if (filterLabel === 'Ngày tạo') {
        // Tìm listbox container bên trong dropdown menu
        const listbox = dropdownMenu.locator('.date-picker-menu-content').first();
        await listbox.waitFor({ state: "visible", timeout: 5000 });
        // Tìm option đầu tiên trong listbox
        const firstOption = listbox.locator('.v-list-item').first();
        await firstOption.waitFor({ state: "visible", timeout: 5000 });
        // Click vào option đầu tiên
        await firstOption.click({ timeout: 5000 });
      } else {
        // Tìm listbox container bên trong dropdown menu
        const listbox = dropdownMenu.locator('.v-virtual-scroll__container').first();
        await listbox.waitFor({ state: "visible", timeout: 5000 });
        // Tìm option đầu tiên trong listbox
        const firstOption = listbox.locator('.v-virtual-scroll__item').first();
        await firstOption.waitFor({ state: "visible", timeout: 5000 });

        // Click vào option đầu tiên
        await firstOption.click({ timeout: 5000 });
      }
    } catch (error) {
      // Nếu không phải lỗi page closed, throw lại error
      throw error;
    }
  }

  /**
   * Chọn option đầu tiên trong tất cả các filter dropdowns
   */
  async selectAllFirstFilterOptions() {
    const filters = [
      "Trạng thái",
      "Đơn vị",
      "Nguồn yêu cầu",
      "Loại yêu cầu",
      "Ngày tạo"
    ];
    
    for (const filter of filters) {
      // Kiểm tra page còn alive trước khi tiếp tục
      if (this.page.isClosed()) {
        throw new Error(`Page has been closed while processing filters. Last processed filter: ${filter}`);
      }

      try {
        await this.selectFirstOptionInFilter(filter);
        // Đợi sau mỗi lần chọn để đảm bảo filter được apply và page stable
        await this.page.waitForTimeout(1000);
      } catch (error) {
        // Nếu không phải lỗi page closed, log và tiếp tục với filter tiếp theo
        console.warn(`Không tìm thấy filter hoặc có lỗi với filter: ${filter}`, error);
        continue;
      }
    }
    
    // Đợi table reload sau khi apply tất cả filters
    await this.page.waitForTimeout(1000);
    
    // Kiểm tra page còn alive sau khi hoàn thành
    if (this.page.isClosed()) {
      throw new Error('Page has been closed after processing all filters');
    }
  }

  /**
   * Kiểm tra table có bản ghi chứa số định danh cá nhân
   * @param personalId Số định danh cá nhân cần tìm
   */
  async assertTableContainsPersonalId(personalId: string) {
    // Đợi page load xong
    await this.page.waitForLoadState("domcontentloaded");
    
    // Tìm table element (có thể là table tag hoặc div với role="table")
    const tableSelectors = [
      'table',
      '[role="table"]',
      '.v-data-table',
      '[class*="table"]'
    ];
    
    let tableLocator = null;
    for (const selector of tableSelectors) {
      try {
        const locator = this.page.locator(selector).first();
        const isVisible = await locator.isVisible({ timeout: 2000 });
        if (isVisible) {
          tableLocator = locator;
          break;
        }
      } catch {
        // Tiếp tục thử selector tiếp theo
        continue;
      }
    }
    
    if (!tableLocator) {
      throw new Error('Không tìm thấy table trên trang');
    }
    
    // Đợi table hiển thị và có data
    await tableLocator.waitFor({ state: "visible", timeout: 10000 });
    
    // Tìm tất cả các rows trong table
    // Rows có thể là tr, hoặc div với role="row"
    const rowSelectors = [
      'tbody tr',
      '[role="row"]',
      '.v-data-table__tbody tr',
      'tr'
    ];
    
    let found = false;
    for (const rowSelector of rowSelectors) {
      try {
        const rows = tableLocator.locator(rowSelector);
        const count = await rows.count();
        
        if (count > 0) {
          // Kiểm tra từng row xem có chứa số định danh không
          for (let i = 0; i < count; i++) {
            const row = rows.nth(i);
            const rowText = await row.textContent();
            
            if (rowText && rowText.includes(personalId)) {
              found = true;
              break;
            }
          }
          
          if (found) {
            break;
          }
        }
      } catch {
        // Tiếp tục thử selector tiếp theo
        continue;
      }
    }
    
    if (!found) {
      // Nếu không tìm thấy trong rows, thử tìm trong toàn bộ table
      const tableText = await tableLocator.textContent();
      if (tableText && tableText.includes(personalId)) {
        found = true;
      }
    }
    
    if (!found) {
      throw new Error(`Không tìm thấy bản ghi với số định danh cá nhân: ${personalId}`);
    }
    
    // Verify row chứa số định danh có visible
    const personalIdLocator = this.page.locator(`text=${personalId}`).first();
    await expect(personalIdLocator).toBeVisible({ timeout: 5000 });
  }

  /**
   * Kiểm tra text có hiển thị trên trang không
   * @param text Text cần kiểm tra
   */
  async assertTextVisible(text: string) {
    // Đợi page load xong trước khi kiểm tra text
    await this.page.waitForLoadState("domcontentloaded");
    
    // Kiểm tra text hiển thị
    const textLocator = this.page.locator(`text=${text}`).first();
    await expect(textLocator).toBeVisible({ timeout: 10000 });
  }
}
