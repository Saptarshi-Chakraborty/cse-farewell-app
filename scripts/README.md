# 🚀 Google Apps Script Mailer Service Setup Guide

Welcome to the beginner-friendly guide for setting up the Mailer Service using Google Apps Script! This service allows you to send automated emails with QR Code attachments for the Semicolon '26 Farewell event.

Follow these simple, step-by-step instructions to get everything up and running.

---

## 🛠️ Step 1: Create a New Google Apps Script Project

1. Open your web browser and go to [Google Apps Script](https://script.google.com/).
2. Sign in with your Google account if you aren't already logged in.
3. Click the **"New project"** button in the top-left corner.
4. Rename your project by clicking on "Untitled project" at the top left and give it a descriptive name like `Farewell Mailer Service`.

---

## 📄 Step 2: Add the Required Files

You will need to create two files in your new project.

### 1. `code.gs` (The Main Script)
By default, you will see a file named `Code.gs`.
1. Select all the existing code in `Code.gs` and delete it.
2. Open the `code.gs` file from this repository (`scripts/code.gs`).
3. Copy all of its contents and paste them into your Apps Script `Code.gs` file.
> **💡 Pro Tip:** The code expects a `base64toBlob` utility to handle the QR codes. If you haven't added it yet, copy and paste this snippet at the very bottom of your `Code.gs` file:
> ```javascript
> function base64toBlob(base64Data) {
>   const contentType = "image/png";
>   const base64 = base64Data.split(',')[1] || base64Data;
>   const byteCharacters = Utilities.base64Decode(base64);
>   return Utilities.newBlob(byteCharacters, contentType, "qrCode.png");
> }
> ```

### 2. `EmailTemplate.html` (The Email Design)
1. In the Apps Script editor, look at the left sidebar (Files section).
2. Click the **`+` (Add a file)** icon.
3. Select **HTML** from the dropdown menu.
4. Name the file exactly **`EmailTemplate`** (case-sensitive) and press **Enter**.
5. Open the newly created `EmailTemplate.html` file and delete the default code inside it.
6. Open the `EmailTemplate.html` file from this repository (`scripts/EmailTemplate.html`).
7. Copy all of its contents and paste them into your Apps Script `EmailTemplate.html` file.
8. **Save your project** by clicking the floppy disk icon (💾) at the top, or by pressing `Ctrl + S` / `Cmd + S`.

---

## 🧪 Step 3: Run the Test Function

Before we deploy, let's make sure everything works perfectly!

1. In the Apps Script editor, open the `Code.gs` file.
2. Look at the toolbar at the top (next to "Debug"). There is a dropdown menu showing the name of a function (e.g., `buildJSONResponse`).
3. Click that dropdown and select the function named **`testProcessCouponEmail`**.
4. Click the **"Run"** button (▶️).
5. **Authorization:** Since this script sends emails, Google will ask for permission.
   - Click **Review permissions**.
   - Choose your Google Account.
   - You might see a warning saying "Google hasn't verified this app." Click **Advanced** at the bottom, then click **Go to Farewell Mailer Service (unsafe)**.
   - Click **Allow**.
6. Check the **Execution Log** at the bottom of the screen. You should see messages indicating success, like:
   * `Remaining email quota: ...`
   * `Email dispatched successfully to: ...`
   * `Test execution successful: ...`

*(Note: The test function uses dummy data, so it might send a test email to the email address mentioned inside `testProcessCouponEmail`).*

---

## 🚀 Step 4: Deploy the Web App

Now we need to make the script accessible to our Next.js application over the internet.

1. Click the **"Deploy"** button in the top-right corner of the Apps Script editor.
2. Select **"New deployment"**.
3. In the "Select type" sidebar (gear icon ⚙️), check the box next to **"Web app"**.
4. Fill out the deployment configuration:
   - **Description:** `Initial Release` (or whatever you like)
   - **Execute as:** `Me (your email)`
   - **Who has access:** `Anyone` *(⚠️ This is crucial so your Next.js app can send requests without manual Google sign-in).*
5. Click **"Deploy"**.
6. **Authorization (Again):** It may ask you to authorize access one more time. Follow the same steps as before.
7. Once successfully deployed, you will see a **Web app URL**.
8. Click the **"Copy"** button next to the URL. **Keep this URL safe!**

---

## 🔗 Step 5: Configure Your Next.js Application

Finally, connect the newly deployed Google Apps Script to your project's codebase.

1. Go back to your code editor (like VS Code) where this Next.js project is open.
2. Locate the `.env.local` or `.env` file in the root directory. *(Create a `.env` file if it doesn't exist yet).*
3. Add the following line to the file, replacing `YOUR_COPIED_URL_HERE` with the Web app URL you copied in Step 4:

```env
NEXT_PUBLIC_EMAIL_API_URL=YOUR_COPIED_URL_HERE
```

4. Save the `.env` file.
5. If your Next.js development server is currently running, **restart it** (`Ctrl + C` to stop, then `npm run dev` to start) so it can pick up the new environment variable.

**🎉 Congratulations! Your mailer service is now fully integrated and ready to send beautiful digital food coupons.**