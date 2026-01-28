import { When, Then } from "@cucumber/cucumber";
import { PWWorld } from "../support/world";
import { CreateRequestFormPage } from "../pages/create-request-form.page";

When('I fill full name {string}', async function (this: PWWorld, name: string) {
  const formPage = new CreateRequestFormPage(this.page);
  await formPage.fillFullName(name);
});

When('I fill personal ID {string}', async function (this: PWWorld, personalId: string) {
  const formPage = new CreateRequestFormPage(this.page);
  await formPage.fillPersonalId(personalId);
});

When('I select date of birth {string}', async function (this: PWWorld, dateString: string) {
  const formPage = new CreateRequestFormPage(this.page);
  await formPage.selectDateOfBirth(dateString);
});

When('I select gender {string}', async function (this: PWWorld, gender: string) {
  const formPage = new CreateRequestFormPage(this.page);
  await formPage.selectGender(gender);
});

When('I select unit option {string}', async function (this: PWWorld, optionIndex: string) {
  const formPage = new CreateRequestFormPage(this.page);
  const index = parseInt(optionIndex, 10);
  await formPage.selectUnit(index);
});

When('I upload file {string}', async function (this: PWWorld, filePath: string) {
  const formPage = new CreateRequestFormPage(this.page);
  await formPage.uploadFile(filePath);
});

When('I click complete button', async function (this: PWWorld) {
  const formPage = new CreateRequestFormPage(this.page);
  await formPage.clickComplete();
});

Then('I should see success message', async function (this: PWWorld) {
  const formPage = new CreateRequestFormPage(this.page);
  await formPage.assertSuccessMessage();
});
