import { When, Then } from "@cucumber/cucumber";
import { PWWorld } from "../support/world";
import { RequestListPage } from "../pages/request-list.page";

When(
  'I navigate to menu {string} -> {string} -> {string}',
  async function (this: PWWorld, menu1: string, menu2: string, menu3: string) {
    const requestListPage = new RequestListPage(this.page);
    
    // Kiểm tra xem đã ở đúng trang chưa
    const isOnPage = await requestListPage.isOnRequestListPage();
    if (isOnPage) {
      // Đã ở đúng trang, skip navigation
      return;
    }
    
    // Chưa ở đúng trang, thực hiện navigation
    const menuItems = [menu1, menu2, menu3];
    await requestListPage.navigateToMenu(menuItems);
  }
);

When('I click on tab {string}', async function (this: PWWorld, tabName: string) {
  const requestListPage = new RequestListPage(this.page);
  await requestListPage.clickTab(tabName);
});

When(
  'I click dropdown {string} and select {string}',
  async function (this: PWWorld, dropdownText: string, optionText: string) {
    const requestListPage = new RequestListPage(this.page);
    await requestListPage.clickDropdownAndSelect(dropdownText, optionText);
  }
);

Then(
  'I should see text {string}',
  async function (this: PWWorld, text: string) {
    const requestListPage = new RequestListPage(this.page);
    await requestListPage.assertTextVisible(text);
  }
);

When(
  'I navigate to request list page {string}',
  async function (this: PWWorld, path: string) {
    const requestListPage = new RequestListPage(this.page);
    await requestListPage.navigateToRequestListPage(path);
  }
);

When(
  'I select first option in all filter dropdowns',
  {timeout: 30000},
  async function (this: PWWorld) {
    const requestListPage = new RequestListPage(this.page);
    await requestListPage.selectAllFirstFilterOptions();
  }
);

Then(
  'I should see table with personal ID {string}',
  async function (this: PWWorld, personalId: string) {
    const requestListPage = new RequestListPage(this.page);
    await requestListPage.assertTableContainsPersonalId(personalId);
  }
);
