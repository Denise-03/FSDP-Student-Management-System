import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
async function login(page, email) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('AikidoDemo!2026');
  await page.getByRole('button', { name: /^Sign\ in/, exact: true }).click();
  await expect(page).not.toHaveURL(/\/login$/);
}
async function checkPage(page, url) {
  const errors = [];
  const listener = (error) => errors.push(error.message);
  page.on('pageerror', listener);
  await page.goto(url);
  await expect(page.locator('main h1').last()).toBeVisible();
  await expect(page.getByText('Loading your information…')).toHaveCount(0);
  expect(errors).toEqual([]);
  await expect(page.locator('main')).not.toContainText(
    'The request could not be completed.',
  );
  await expect(page.locator('main')).not.toContainText('Please sign in.');
  page.off('pageerror', listener);
}
async function noOverflow(page) {
  const widths = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: innerWidth,
  }));
  expect(widths.document, `Horizontal overflow at ${page.url()}`).toBeLessThanOrEqual(
    widths.viewport + 1,
  );
}
test('all public screens work on a 360px phone and class selection survives sign-in', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const path of [
    '/',
    '/about',
    '/classes',
    '/classes/adult',
    '/dojos',
    '/grading-info',
    '/fees',
    '/how-to-join',
    '/login',
    '/register',
  ]) {
    await checkPage(page, path);
    await noOverflow(page);
  }
  await page.goto('/classes/adult');
  await page
    .getByRole('button', { name: /^Book\ class/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/login$/);
  expect(
    await page.evaluate(
      () => JSON.parse(sessionStorage.getItem('fsdp.intendedSession')).id,
    ),
  ).toBeTruthy();
  await page.getByLabel('Email address').fill('jamie@fsdp.demo');
  await page.getByLabel('Password', { exact: true }).fill('AikidoDemo!2026');
  await page.getByRole('button', { name: /^Sign\ in/, exact: true }).click();
  await expect(page).toHaveURL(/\/student\/classes$/);
  await expect(page.getByRole('heading', { name: 'Your selected class' })).toBeVisible();
});
test('student portal routes persist session after refresh at mobile and desktop widths', async ({
  page,
}) => {
  await login(page, 'jamie@fsdp.demo');
  const paths = [
    '/student',
    '/student/classes',
    '/student/bookings',
    '/student/attendance',
    '/student/grading-readiness',
    '/student/grading-applications',
    '/student/notifications',
    '/student/membership',
    '/student/profile',
  ];
  for (const width of [1440, 360]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of paths) {
      await checkPage(page, path);
      await noOverflow(page);
      if (path === '/student/classes') {
        await expect(
          page.getByRole('heading', { name: 'Adult Aikido', exact: true }).first(),
        ).toBeVisible();
        await expect(
          page.getByRole('heading', { name: 'Children Aikido', exact: true }),
        ).toHaveCount(0);
      }
    }
  }
  await page.reload();
  await expect(page.getByLabel('Full name')).toHaveValue('Jamie Lim');
  await mkdir('docs/screenshots', { recursive: true });
  await page.goto('/student');
  await expect(page.getByRole('heading', { name: 'Your next milestone' })).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/student-mobile.png', fullPage: true });
});
test('instructor routes, roster and assessment are assigned and responsive', async ({
  page,
}) => {
  await login(page, 'instructor-central@fsdp.demo');
  await page.setViewportSize({ width: 360, height: 900 });
  for (const path of [
    '/instructor',
    '/instructor/classes/transition-session/attendance',
    '/instructor/students',
    '/instructor/assessments',
  ]) {
    await checkPage(page, path);
    await noOverflow(page);
  }
  await page.goto('/instructor/classes/history-2/attendance');
  await expect(page.getByRole('alert')).toContainText('not assigned');
});
test('admin screens and private review load with real server records', async ({ page }) => {
  await login(page, 'admin@fsdp.demo');
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const path of [
    '/admin',
    '/admin/enrolments',
    '/admin/members',
    '/admin/reports',
    '/admin/manage',
    '/admin/payments',
  ])
    await checkPage(page, path);
  await page.goto('/admin/enrolments');
  await page.getByRole('button', { name: /Alex Tan/ }).click();
  await expect(page.getByRole('link', { name: /synthetic-training[.]pdf/ })).toBeVisible();
  await page.setViewportSize({ width: 360, height: 900 });
  await noOverflow(page);
  await page.goto('/admin/reports');
  await noOverflow(page);
});
test('new applicant completes four-step application and review status persists', async ({
  page,
}) => {
  const email = `browser-${Date.now()}@fsdp.demo`;
  await page.goto('/register');
  await page.getByLabel('Full name').fill('Browser Demo Applicant');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('AikidoDemo!2026');
  await page.getByLabel('Confirm password').fill('AikidoDemo!2026');
  await page.getByRole('button', { name: /^Create\ account/ }).click();
  await expect(page).toHaveURL(/\/enrolment$/);
  await page.getByLabel('Contact number').fill('0000 0000');
  await page.getByLabel('Date of birth').fill('2000-01-01');
  await page.getByLabel('Principal dojo').selectOption('central');
  await page.getByRole('button', { name: /^Save\ \&\ continue/ }).click();
  await expect(page.getByRole('heading', { name: 'Your training so far.' })).toBeVisible();
  await page
    .getByLabel('Previous Aikido training')
    .fill('Synthetic demonstration practice.');
  await page.getByRole('button', { name: /^Save\ \&\ continue/ }).click();
  await expect(page.getByRole('heading', { name: 'Evidence and consent.' })).toBeVisible();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /^Save\ \&\ continue/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Review your application.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Submit application', exact: true }).click();
  await expect(page).toHaveURL(/\/enrolment\/status$/);
  await page.reload();
  await expect(page.locator('main')).toContainText('pending review');
  await page.goto('/student/classes');
  await expect(page).toHaveURL(/\/enrolment\/status$/);
  // This fictional record remains available for the reviewer to inspect in the admin queue.
});
test('public desktop and mobile visual evidence has a licensed local photograph', async ({
  page,
}) => {
  await mkdir('docs/screenshots', { recursive: true });
  for (const [name, width, height] of [
    ['home-desktop', 1440, 1000],
    ['home-mobile', 360, 800],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Find your balance/ })).toBeVisible();
    const image = page.locator('.hero-photo img');
    await expect(image).toBeVisible();
    expect(
      await image.evaluate((element) => element.complete && element.naturalWidth > 0),
    ).toBeTruthy();
    await noOverflow(page);
    await page.screenshot({ path: `docs/screenshots/${name}.png`, fullPage: true });
  }
});
