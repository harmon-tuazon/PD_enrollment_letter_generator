const { Client } = require('@hubspot/api-client');
const axios = require('axios');
const { Readable } = require('stream');
const FormData = require('form-data');
const crypto = require('crypto');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const HUBSPOT_TOKEN = process.env.HS_TOKEN2;

// Browser instance management for performance (from PUPPETEER_SERVERLESS_GUIDE)
let browserInstance = null;

/**
 * Get or create browser instance (optimized for serverless)
 * CRITICAL: Reuse browser instance to avoid cold start penalties
 * FIXES: "Could not find Chrome", "libnss3.so", "Browser closed unexpectedly"
 */
async function getBrowserInstance() {
  if (!browserInstance || !browserInstance.connected) {
    console.log('Creating new Puppeteer browser instance');
    
    // CRITICAL: Environment detection fixes Chrome executable errors
    const isServerless = process.env.VERCEL || 
                         process.env.AWS_LAMBDA_FUNCTION_NAME || 
                         process.env.NETLIFY ||
                         process.env.LAMBDA_TASK_ROOT ||
                         process.env.GOOGLE_CLOUD_PROJECT;
    
    console.log('Environment detection:', {
      VERCEL: !!process.env.VERCEL,
      AWS_LAMBDA: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
      NETLIFY: !!process.env.NETLIFY,
      isServerless: isServerless
    });
    
    let launchConfig;
    
    if (isServerless) {
      // Serverless environment - use @sparticuz/chromium
      console.log('Serverless environment detected, using @sparticuz/chromium');
      const executablePath = await chromium.executablePath();  // CRITICAL: Call as function
      console.log('Chromium executable path:', executablePath);
      console.log('Chromium args:', chromium.args);
      
      launchConfig = {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath,        // This provides the correct path
        headless: 'new',                      // Use new headless mode
        ignoreHTTPSErrors: true,
        timeout: 60000                        // Increase timeout for cold starts
      };
    } else {
      // Local development - use system Chrome
      console.log('Local environment detected, using system Chrome');
      launchConfig = {
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-extensions',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote'
        ],
        ignoreHTTPSErrors: true,
        timeout: 30000
        // Note: No executablePath - let Puppeteer find system Chrome
      };
    }
    
    browserInstance = await puppeteer.launch(launchConfig);

    // Handle disconnection with enhanced logging
    browserInstance.on('disconnected', () => {
      console.warn('Browser instance disconnected - will recreate on next request');
      browserInstance = null;
    });
    
    // Test browser health
    try {
      const testPage = await browserInstance.newPage();
      await testPage.close();
      console.log('Browser health check passed');
    } catch (healthError) {
      console.warn('Browser health check failed:', healthError.message);
    }
  }
  
  return browserInstance;
}

/**
 * Generate PDF with proper error handling and retry logic
 * PRODUCTION TESTED - Handles all common serverless PDF generation issues
 */
async function generatePDF(html, options = {}) {
  let page = null;
  let retries = 3;
  
  while (retries > 0) {
    try {
      const browser = await getBrowserInstance();
      
      // Check if browser is still connected
      if (!browser.connected) {
        throw new Error('Browser disconnected');
      }
      
      page = await browser.newPage();

      // Set viewport for consistent rendering
      await page.setViewport({
        width: 1280,
        height: 720,
        deviceScaleFactor: 2
      });

      // Load HTML content with proper wait conditions
      await page.setContent(html, { 
        waitUntil: 'networkidle0',    // Wait for network to be idle
        timeout: 30000                // 30 second timeout
      });

      // Generate PDF with optimized settings to prevent blank pages
      const pdf = await page.pdf({
        format: 'Letter',             // US Letter format
        printBackground: true,        // Include CSS backgrounds
        preferCSSPageSize: false,     
        margin: { top: '1in', right: '0in', bottom: '0in', left: '0in' },    
        ...options                    // Allow override options
      });
        
      console.log('PDF generated successfully, size:', pdf.length, 'bytes');
      return pdf;

    } catch (error) {
      console.warn(`PDF generation attempt failed (${4 - retries}/3):`, error.message);
      
      // Enhanced error logging for debugging
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Clean up failed resources
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.warn('Failed to close page after error:', closeError.message);
        }
        page = null;
      }
      
      // Force new browser if disconnected
      if (browserInstance && !browserInstance.connected) {
        console.log('Forcing new browser instance due to disconnection');
        browserInstance = null;
      }
      
      retries--;
      if (retries === 0) {
        console.error('All PDF generation attempts failed');
        throw error;
      }
      
      // Wait before retry with exponential backoff
      const waitTime = (4 - retries) * 1000;
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
    } finally {
      // CRITICAL: Always close the page (but keep browser for reuse)
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.warn('Failed to close page in finally block:', closeError.message);
        }
      }
    }
  }
}

/**
 * Cleanup for graceful shutdown with enhanced error handling
 */
async function cleanup() {
  if (browserInstance && browserInstance.connected) {
    try {
      console.log('Closing browser instance gracefully...');
      await browserInstance.close();
      console.log('Browser instance closed successfully');
    } catch (error) {
      console.error('Failed to close browser:', error.message);
    } finally {
      browserInstance = null;
    }
  }
}

// Handle process termination with timeout
process.on('SIGINT', async () => {
  console.log('Received SIGINT, cleaning up...');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, cleaning up...');
  await cleanup();
  process.exit(0);
});

process.on('exit', cleanup);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  cleanup().finally(() => process.exit(1));
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  cleanup().finally(() => process.exit(1));
});

// Helper function to verify HubSpot webhook signature

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'PDF Generation API running', 
      timestamp: new Date().toISOString(),
      service: 'PDF Generation Service'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('PDF generation request received:', { method: req.method, headers: req.headers });

  try {

    // Parse the webhook payload
    const data = req.body;
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    // Validate required fields
    const requiredFields = ['firstname', 'lastname', 'recordID', 'student_id', 'location', 'course_id', 'enrollment_record_id'];
    const missingFields = requiredFields.filter(field => !data[field]);

    const contactName = `${data.firstname} ${data.lastname}`

    function formatEpochMsToLongDate(ms, { timeZone = 'UTC' } = {}) {
          const d = new Date(Number(ms));
          if (Number.isNaN(d.getTime())) throw new Error('Invalid epoch milliseconds');
          return new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: '2-digit',   // ensures "DD" like 05
            year: 'numeric',
            timeZone
          }).format(d);
    }

    const start = formatEpochMsToLongDate(data.course_start_date, { timeZone: 'UTC' });
    const end = formatEpochMsToLongDate(data.course_end_date, { timeZone: 'UTC' });
    let courseIdentifier = String(data.course_id || "").toLowerCase();
    let isSitPrac = courseIdentifier.includes("sitpractice");
    const duration = isSitPrac == false ? `${start} to ${end}` : "12 Weeks" 

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        missingFields,
        receivedData: data
      });
    }

    const findLocation = (location) => {
      const location_mapper = {
        Mississauga: "200-1515 Matheson Blvd Mississauga, ON L4W 2P5",
        B9: "200-1515 Matheson Blvd Mississauga, ON L4W 2P5",
        Online: "200-1515 Matheson Blvd Mississauga, ON L4W 2P5",
        Vancouver: "522 Seventh Street, Unit 100, New Westminster, BC V3M 5T5",
        Montreal: "6540 Chemin de la Côte-de-Liesse Saint-Laurent, QC H4T 1E3",
        Calgary: "518 9 Ave SE, Calgary, AB T2G 0S1"
      };
      return location_mapper[location] ||  location_mapper["Mississauga"];
    };

    const serviceLocation = findLocation(data.location);
    if (!serviceLocation) {
      return res.status(400).json({ 
        error: 'Invalid location',
        location: data.location,
        validLocations: ['Mississauga', 'Vancouver', 'Montreal', 'Calgary', 'Online', 'B9']
      });
    }

    const mapCourse = (courseID) => {
      const course_mapper = {
            AFK: "Assessment of Fundamental Knowledge Course",
            ACJ: "Assessment of Clinical Judgment Course",
            ADT: "Advanced Dental Admission Test Course",
            INBDE: "Integrated National Board Dental Examination Course",
            BRD: "Virtual OSCE",
            Clinical: "NDECC® Clinical Skills Course",
            B9: "NDECC® Clinical Skills Course",
            Situational: "NDECC® Situational Judgment Course",
            SitPractice: "NDECC® Situational Practice Course",
            SimPack:  "NDECC® Simulation Package Course",
            Sim: "NDECC® Simulation Situational Course"
      };
      if (!courseID) return null;
      
      const lower = courseID.toLowerCase();

      for (const [key, val] of Object.entries(course_mapper)) {
          if (lower.includes(key.toLowerCase())) return val;
        }
        return null;
 };
    
    const fullCourseName = mapCourse(data.course_id);
    console.log("Found course: ", fullCourseName)



    // HTML template with exact original specifications
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Letter of Enrollment - Prep Doctors Institute</title>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Montserrat', sans-serif; font-size: 15px; background-color: white; color: #000; margin: 0; padding: 0; }
            .watermark { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-image: url('https://46814382.fs1.hubspotusercontent-na1.net/hubfs/46814382/011e001d-e85f-48c9-baf2-1dd37205781c_opengraph-16841b41.png'); background-repeat: no-repeat; background-position: center; background-size: 80vh auto; opacity: 0.2; pointer-events: none; z-index: 1; }
            .container { max-width: 7.5in; padding: 1rem 0.75in; margin: 0 auto; position: relative; z-index: 10; min-height: calc(100vh - 6rem); }
            header { margin-bottom: 2rem; }
            .logo { height: 4rem; margin-bottom: 1rem; }
            .letter-content { display: flex; flex-direction: column; gap: 1.5rem; }
            .recipient-date { display: flex; justify-content: space-between; margin-bottom: 2rem; }
            .subject { margin-bottom: 1.5rem; }
            .subject h1 { font-size: 16px; font-weight: 500; text-decoration: underline; }
            .main-content { display: flex; flex-direction: column; gap: 1rem; }
            .main-content p { line-height: 1.625; }
            .facility-address { text-align: center; font-weight: 500; margin: 1.5rem 0; }
            .courses-section { margin: 1rem 0; }
            .courses-section h2 { font-size: 15px; font-weight: 500; margin-bottom: 1rem; }
            .courses-list { margin-left: 1.5rem; }
            .courses-list li { font-size: 15px; margin-bottom: 0.5rem; }
            .signature-section { margin-top: 5px; margin-bottom: 2rem; }
            .signature-section > p { margin-bottom: 0.5rem; }
            .signature-container { display: flex; flex-direction: column; gap: 0.5rem; }
            .signature-image { height: 130px; width: 130px; }
            .signature-name { font-weight: 500; }
            footer { background-color: #45D3B9; color: #01386E; padding: 1rem 2rem; position: fixed; bottom: 0; left: 0; right: 0; width: 100%; }
            footer address { font-style: normal; }
            footer p { font-size: 0.75rem; font-weight: 700; margin: 0.25rem 0; }
            strong { font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="watermark"></div>
          <div class="container">
            <header>
              <img src="https://46814382.fs1.hubspotusercontent-na1.net/hubfs/46814382/Enrollment%20Letter/prepdoctors_blue_logo.png" alt="Prep Doctors Institute" class="logo">
            </header>
            <div class="letter-content">
              <section class="recipient-date">
                <div><p>To Whom It May Concern</p></div>
                <div><p>Date: ${date}</p></div>
              </section>
              <section class="subject">
                <h1>Subject: Letter of Enrollment</h1>
              </section>
              <section class="main-content">
                <p>Please be informed that <strong>Dr.${contactName}</strong> has been accepted as a full-time student in the following Prep Doctors' courses, as illustrated below, which take place in Prep Doctors' ${data.location} facility, located at:</p>
                <address class="facility-address">${serviceLocation}</address>
                <div class="courses-section">
                  <h2>Courses:</h2>
                  <ol class="courses-list"><li><strong>${fullCourseName}:</strong> ${duration}</li></ol>
                </div>
              </section>
              <section class="signature-section">
                <p>Sincerely,</p>
                <div class="signature-container">
                  <img src="https://46814382.fs1.hubspotusercontent-na1.net/hubfs/46814382/Enrollment%20Letter/Dipty%20Signature.jpg" alt="Rafik Khalaf Signature" class="signature-image">
                  <div>
                    <p class="signature-name">Dipty Missra</p>
                    <p>Client Relations Manager</p>
                    <p>Tel: +1 855-397-7737 EXT: 116</p>
                    <p>Email: info@prepdoctors.ca</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
          <footer>
            <address>
              <p>200-1515 Matheson Blvd E, Mississauga, ON L4W 2P5<br>+1-855-397-7737<br>info@prepdoctors.ca</p>
            </address>
          </footer>
        </body>
        </html>`;
    
    // Generate PDF using proven serverless pattern from PUPPETEER_SERVERLESS_GUIDE
    console.log('Generating PDF with serverless-optimized Puppeteer...');
    
    const pdfBuffer = await generatePDF(html);
    console.log('✅ PDF generated successfully');

    // Upload to HubSpot - Use Buffer directly instead of Readable stream
    const folderID = "194140833109";
    const fileName = `Letter_of_Acceptance_${data.student_id}_${data.enrollment_record_id}.pdf`;

    // Ensure pdfBuffer is a proper Buffer
    const pdfBufferCorrect = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);

    const form = new FormData();
    // Use Buffer directly - this fixes the "data should be a string, Buffer or Uint8Array" error
    form.append('file', pdfBufferCorrect, { 
      filename: fileName, 
      contentType: 'application/pdf',
      knownLength: pdfBufferCorrect.length 
    });
    form.append('options', JSON.stringify({ access: 'PUBLIC_NOT_INDEXABLE' }));
    form.append('folderId', folderID);

    const uploadRes = await axios.post('https://api.hubapi.com/files/v3/files', form, {
      headers: {
        Authorization: `Bearer ${HUBSPOT_TOKEN}`,
        ...form.getHeaders(),
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    const fileUrl = uploadRes.data.url || uploadRes.data.absoluteUrl;

    // Create HubSpot note
    const hubspotClient = new Client({ accessToken: HUBSPOT_TOKEN });

    const note_properties = {
      hs_note_body: `Letter of Acceptance attached: <a href="${fileUrl}" target="_blank">View PDF</a>`,
      hs_timestamp: uploadRes.data.createdAt,
      hs_attachment_ids: uploadRes.data.id
    };

    const SimplePublicObjectInputForCreate = {
      properties: note_properties,
      associations: [
        {
          to: { id: data.recordID },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 202
            }
          ]
        }
      ]
    };

    const apiResponse = await hubspotClient.crm.objects.notes.basicApi.create(SimplePublicObjectInputForCreate);

    // Return success response
    return res.status(200).json({
      message: 'PDF generated, uploaded, and note created/associated in HubSpot.',
      noteId: apiResponse.id,
      fileUrl,
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
};