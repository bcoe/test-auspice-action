import { toMatchImageSnapshot } from './helpers';

describe("Zika", () => {
  describe("Color by", () => {
    describe("author", () => {
      it("matches the screenshot", async () => {
        await matchSelectOptionScreenshot("author", async () => {
          await page.keyboard.press("ArrowUp");
          await page.keyboard.press("Enter");
        });
      });
    });
  });
});

async function matchSelectOptionScreenshot(option, selectOptionTest) {
  await goToZikaPage();

  const colorBySelector = await expect(page).toMatchElement("#selectColorBy");

  await colorBySelector.click();

  await selectOptionTest();

  await expect(colorBySelector).toMatch(option);

  const treeTitle = await expect(page).toMatchElement("#Title");

  await expect(treeTitle).toMatch(option);

  await toMatchImageSnapshot(async () => {
    const image = await page.screenshot();

    /**
     * (tihuan): Apply `blur` and `failureThreshold` to ignore minor noises.
     * Also `customSnapshotIdentifier` is needed, since we use `jest.retryTimes()`
     * https://github.com/americanexpress/jest-image-snapshot/pull/122/files
     * https://github.com/americanexpress/jest-image-snapshot#%EF%B8%8F-api
     */
    const SNAPSHOT_CONFIG = {
      failureThreshold: 0,
      failureThresholdType: "percent",
      blur: 0,
      customSnapshotIdentifier: `Color by: ${option}`
    };

    console.info('we got here');
    expect(image).toMatchImageSnapshot(SNAPSHOT_CONFIG);
    console.info('why is this fine');
  });
}

async function goToZikaPage() {
  await page.goto(`${BASE_URL}/zika?p=grid`, { waitUntil: "networkidle2" });
  await expect(page).toMatchElement("#TransmissionsCard");
}
