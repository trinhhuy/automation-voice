import { Before, After } from "@cucumber/cucumber";
import { PWWorld } from "./world";
// 
Before(async function (this: PWWorld) {
  await this.init();
});

After(async function (this: PWWorld) {
  await this.cleanup();
});
