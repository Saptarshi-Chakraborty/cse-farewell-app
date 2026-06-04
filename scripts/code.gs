/**
 * Standardizes the JSON response format for the Web App.
 *
 * @param {string} status - "success" or "error"
 * @param {string} msg - User friendly message
 * @param {Object} [data] - Optional data payload
 * @param {string} [error] - Optional error details
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function buildJSONResponse(status, msg, data = null, error = null) {
  const response = { status, msg };
  if (data) response.data = data;
  if (error) response.error = error.toString();

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/**
 * Handles incoming GET requests.
 */
function doGet(e) {
  try {
    if (!e || !e.parameter) throw new Error("Parameters not found");

    // Assuming sendTestImage is defined elsewhere in your project
    const result = sendTestImage(e.parameter);
    return buildJSONResponse("success", "Test image processed", result);
  } catch (error) {
    console.error("doGet Error:", error);
    return buildJSONResponse(
      "error",
      "Invalid GET parameter",
      null,
      error.message,
    );
  }
}

/**
 * Handles incoming POST requests (Main Entry).
 */
function doPost(e) {
  try {
    if (!e || !e.parameter) throw new Error("Parameters not found");

    const result = processCouponEmail(e.parameter);
    return buildJSONResponse("success", "Email Sent Successfully", result);
  } catch (error) {
    console.error("doPost Error:", error);
    return buildJSONResponse(
      "error",
      "Failed to send email",
      null,
      error.message,
    );
  }
}

/**
 * Core logic to generate the template and send the email.
 *
 * @param {Object} params - The request parameters
 * @returns {Object} Result of the email dispatch
 */
function processCouponEmail(params) {
  // 1. Destructure parameters with safe fallback values
  const {
    name = "",
    email = "",
    roll = "",
    year = "",
    food = "",
    imageUrl = "",
  } = params;

  // 2. Validate essential fields
  if (!email.trim()) throw new Error("Recipient email is required.");
  if (!imageUrl.trim()) throw new Error("QR Code image URL is required.");

  // 3. Convert base64 to Blob (assuming base64toBlob is defined in another file)
  const imageBlob = base64toBlob(imageUrl);

  // 4. Bind variables to the HTML Template
  const template = HtmlService.createTemplateFromFile("EmailTemplate");
  template.name = name.trim();
  template.year = year.trim();
  template.roll = roll.trim();
  template.food = food.trim();

  // 5. Evaluate the final HTML
  const htmlBody = template.evaluate().getContent();

  // 6. Send the Email (Updated for Semicolon '26)
  const emailResult = MailApp.sendEmail({
    name: "Semicolon '26 CSE Dept.",
    to: email.trim(),
    bcc: "sapta04chakraborty@gmail.com",
    subject: `Food Coupon for Semicolon '26 - ${name.trim()}`,
    body: "Your email client does not support HTML emails. Please show this email directly to the event organizers.",
    htmlBody: htmlBody,
    noReply: false,
    inlineImages: {
      qrImage: imageBlob,
    },
  });

  console.log(`Email dispatched successfully to: ${email}`);

  return {
    sentTo: email.trim(),
    status: emailResult,
  };
}

/**
 * Utility function to test the email dispatch manually from the Apps Script Editor.
 */
function testProcessCouponEmail() {
  console.log("Remaining email quota: " + MailApp.getRemainingDailyQuota());

  const mockParams = {
    name: "Saptarshi",
    year: "4th",
    roll: "22CSE068",
    food: "Non Veg",
    email: "saptarshichakraborty04.sc@gmail.com",
    imageUrl: "YOUR_TEST_BASE64_STRING_HERE", // Replace with valid test data
  };

  try {
    const result = processCouponEmail(mockParams);
    console.log("Test execution successful:", result);
  } catch (err) {
    console.error("Test execution failed:", err);
  }
}

function base64toBlob(base64Data) {
  const contentType = "image/png";
  const base64 = base64Data.split(',')[1] || base64Data;
  const byteCharacters = Utilities.base64Decode(base64);
  return Utilities.newBlob(byteCharacters, contentType, "qrCode.png");
}