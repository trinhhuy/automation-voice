import { Page } from "playwright";
import { expect } from "@playwright/test";


export class LoginPage {
  constructor(private page: Page) {}

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/login`);
  }

  async gotoSSOCallback(baseUrl: string, code: string) {
    await this.page.goto(`${baseUrl}/callback-sso?code=${code}`);
  }

  async fillEmail(email: string) {
    await this.page.fill('[name="email"]', email);
  }

  async fillPassword(password: string) {
    await this.page.fill('[name="password"]', password);
  }

  async submit() {
    await this.page.click('button[type="submit"]');
  }

  async assertLoggedIn() {
    await expect(this.page.locator("text=Danh sách yêu cầu sinh trắc học giọng nói đơn lẻ")).toBeVisible();
  }
}
