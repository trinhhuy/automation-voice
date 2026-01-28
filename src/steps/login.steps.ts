import { Given, When, Then } from "@cucumber/cucumber";
import { PWWorld } from "../support/world";
import { LoginPage } from "../pages/login.page";
import { getEnv } from "../utils/env";

Given("I open the login page", async function (this: PWWorld) {
  const baseUrl = getEnv("BASE_URL", "http://localhost:3000");
  const login = new LoginPage(this.page);
  await login.goto(baseUrl);
});

When('I access SSO callback with code {string}', async function (this: PWWorld, code: string) {
  const baseUrl = getEnv("BASE_URL", "http://localhost:3000");
  const login = new LoginPage(this.page);
  await login.gotoSSOCallback(baseUrl, code);
});

Then("I should see dashboard", async function (this: PWWorld) {
  const login = new LoginPage(this.page);
  await login.assertLoggedIn();
});
