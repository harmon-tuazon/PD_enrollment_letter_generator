# Letter of Enrollment Automation

## 🎯 Feature Overview

Create an automated system that generates professional Letters of Enrollment whenever specific webhooks are received, integrating seamlessly with the existing PrepDoctors HubSpot-centric payment application framework.

## 📋 Business Case

### Problem Being Solved
- Manual generation of enrollment letters is time-consuming and error-prone
- Students need official enrollment documentation for various purposes (visa applications, employer reimbursement, etc.)
- Lack of consistent formatting and branding across enrollment documents
- No automated delivery system for enrollment confirmations

### Expected Impact
- **Operational Efficiency**: Eliminate manual letter generation (100% automation)
- **Student Experience**: Instant enrollment confirmation upon payment/registration
- **Compliance**: Standardized documentation for regulatory requirements
- **Brand Consistency**: Professional, branded documents every time

### Success Metrics
- Letter generation time: <30 seconds from webhook receipt
- Document delivery success rate: >98%
- Manual intervention reduced by 100%
- Student satisfaction increase through instant delivery

## 🔧 Technical Requirements

### Webhook Integration
- **Trigger Events**:
  - HubSpot Enrollment record is created (object ID: 2-41701559)
  - Manual trigger via HubSpot workflow action
- **Webhook**: Webhook is sent to the vercel url given upon deployment
- **Security**: Verify webhook signatures and validate payloads

### Letter Generation System
- **PDF Generation**: Use Puppeteer (already integrated in payment app)
- **Template Engine**: EJS templates for dynamic content
- **Branding**: PrepDoctors logo, colors, and official formatting
- **Content Sources**: 
  - Student data from HubSpot Contacts
  - Course details from HubSpot Enrollments
  - Enrollment dates and program information

### Serverless Optimization
- **Vercel Puppeteer**: https://github.com/meeehdi-dev/vercel-puppeteer (for @sparticuz/chromium patterns)
- **PDF Generation on Vercel**: https://medium.com/@martin_danielson/generate-html-as-pdf-using-next-js-puppeteer-running-on-serverless-vercel-aws-lambda-ed3464f7a9b7

### HubSpot Integration
- **Data Sources**:
  - Contact properties: contact_name, email, student ID, record_id(hs_obj_id)
  - Enrollment properties: course_id, course_start_date, course_end_date, location
- **File Storage**: Upload generated PDFs to HubSpot Files (folder id: const folderID = "194140833109")
- **Associations**: Link documents to Contact records

### Document Template Requirements
- **Header**: PrepDoctors official letterhead
- **Student Information**: Full name, student ID, contact details
- **Course Details**: Program name, duration, start date, fees paid
- **Official Language**: "This is to certify that [Student Name] is enrolled in..."
- **Signatures**: Digital signature capability with date stamps
- **Footer**: Official contact information and accreditation details

### Sample JS Script
// generate_pdf.js (Standalone Script)
const puppeteer = require('puppeteer');
const hubspot = require('@hubspot/api-client');
const axios = require('axios');
const { Readable } = require('stream');
const FormData = require('form-data');
require('dotenv').config();

const HUBSPOT_TOKEN = process.env.HS_TOKEN2;

(async () => {
  const data = {
    doctorName: "Test Test",
    recordID: "124340560202",
    studentID: "159999999",
    date: "Test",
    location: "Calgary",
    courses: [
      { title: "NDECC Clinical Skills Course", duration: "Jul 27, 2025 to Oct 17, 2025" },
      { title: "NDECC Clinical Skills Course", duration: "Oct 19, 2025 to Jan 16, 2025" },
    ]
  };

  const generateCoursesHTML = (courses) => {
    return courses.map(course => `<li><strong>${course.title}:</strong> ${course.duration}.</li>`).join("\n");
  };

  const findLocation = (location) => {
    location_mapper = {
      Mississauga:  "200-1515 Matheson Blvd Mississauga, ON L4W 2P5",
      Vancouver:  "522 Seventh Street, Unit 100, New Westminster, BC V3M 5T5",
      Montreal: "6540 Chemin de la Côte-de-Liesse Saint-Laurent, QC H4T 1E3",
      Calgary: "518 9 Ave SE, Calgary, AB T2G 0S1"
    }
    
    for (let key in location_mapper) {
      if (key === location) {
        return location_mapper[key];
      }
    }
    return null;
  };

  const serviceLocation = findLocation(data.location)
  const coursesHtml = generateCoursesHTML(data.courses);
  const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Letter of Enrollment - Prep Doctors Institute</title>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Montserrat', sans-serif;
              font-size: 15px;
              background-color: white;
              padding: 0;
              margin: 0;
              color: #000;
            }

            .watermark {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-image: url('https://46814382.fs1.hubspotusercontent-na1.net/hubfs/46814382/011e001d-e85f-48c9-baf2-1dd37205781c_opengraph-16841b41.png');
              background-repeat: no-repeat;
              background-position: center;
              background-size: 80vh auto;
              opacity: 0.2;
              pointer-events: none;
              z-index: 1;
            }

            .container {
              max-width: 56rem;
              padding: 2rem;
              margin-left: 0.5in;
              margin-right: 0.5in;
              margin-top: 1in;
              margin-bottom: 1in;
              position: relative;
              z-index: 10;
            }

            header {
              margin-bottom: 2rem;
            }

            .logo {
              height: 4rem;
              margin-bottom: 1rem;
            }

            .letter-content {
              display: flex;
              flex-direction: column;
              gap: 1.5rem;
            }

            .recipient-date {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 2rem;
            }

            .subject {
              margin-bottom: 1.5rem;
            }

            .subject h1 {
              font-size: 16px;
              font-weight: 500;
              text-decoration: underline;
            }

            .main-content {
              display: flex;
              flex-direction: column;
              gap: 1rem;
            }

            .main-content p {
              line-height: 1.625;
            }

            .facility-address {
              text-align: center;
              font-weight: 500;
              margin: 1.5rem 0;
            }

            .courses-section {
              margin: 1rem 0;
            }

            .courses-section h2 {
              font-size: 15px;
              font-weight: 500;
              margin-bottom: 1rem;
            }

            .courses-list {
              margin-left: 1.5rem;
              display: flex;
              flex-direction: column;
              gap: 0.5rem;
            }

            .courses-list li {
              font-size: 15px;
              margin-bottom: 0.5rem;
            }

            .signature-section {
              margin-top: 5px;
              margin-bottom: 2rem;
            }

            .signature-section > p {
              margin-bottom: 0.5rem;
            }

            .signature-container {
              display: flex;
              flex-direction: column;
              gap: 0.5rem;
            }

            .signature-image-container {
              height: 5rem;
              margin-bottom: 0.5rem;
            }

            .signature-image {
              height: 5rem;
              width: auto;
            }

            .signature-details {
              display: flex;
              flex-direction: column;
              gap: 0.25rem;
            }

            .signature-name {
              font-weight: 500;
            }

            footer {
              background-color: #45D3B9;
              color: #01386E;
              padding: 1rem 2rem;
              text-align: left;
              width: 100%;
              margin-top: -8.5rem;
            }

            footer address {
              font-style: normal;
            }

            footer p {
              font-size: 0.75rem;
              font-weight: 700;
              margin: 0.25rem 0;
            }

            strong {
              font-weight: 600;
            }

            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              .watermark {
                opacity: 0.1;
              }
            }
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
                <div><p>Date: ${data.date}</p></div>
              </section>

              <section class="subject">
                <h1>Subject: Letter of Enrollment</h1>
              </section>

              <section class="main-content">
                <p>Please be informed that <strong>Dr.${data.doctorName}</strong> is currently enrolled as a full-time student in the following Prep Doctors' courses, as illustrated below, which take place in Prep Doctors' ${data.location} facility, located at:</p>
                <address class="facility-address">${serviceLocation}</address>
                <div class="courses-section">
                  <h2>Courses:</h2>
                  <ol class="courses-list">${coursesHtml}</ol>
                </div>
              </section>

              <section class="signature-section">
                <p>Sincerely,</p>
                <div class="signature-container">
                  <div class="signature-image-container">
                    <img src="https://46814382.fs1.hubspotusercontent-na1.net/hubfs/46814382/Enrollment%20Letter/rafik%20signature.png" alt="Rafik Khalaf Signature" class="signature-image">
                  </div>
                  <div class="signature-details">
                    <p class="signature-name">Rafik Khalaf</p>
                    <p>Chief Operating Officer</p>
                    <p>Tel: +1 855-397-7737 EXT: 116</p>
                    <p>Email: info@prepdoctors.ca</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
          <footer>
            <address>
              <p>200-1515 Matheson Blvd E, Mississauga, ON L4W 2P5<br>+1-855-397-7737<br>prepdoctors.ca</p>
            </address>
          </footer>
        </body>
        </html>`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const newPDF = await page.pdf({ format: 'Letter', printBackground: true });
  await browser.close();
  console.log('✅ PDF generated');

  // --- Upload file to HubSpot Files via multipart/form-data (per HubSpot curl docs) ---
  const pdfBuffer = Buffer.isBuffer(newPDF) ? newPDF : Buffer.from(newPDF);
  const pdfStream = Readable.from(pdfBuffer);
  const folderID = "194140833109"; 
  const fileName = `Letter_of_Enrollment_${data.studentID}.pdf`;
  

  const form = new FormData();
  form.append('file', pdfStream, { filename: fileName, contentType: 'application/pdf' });
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

  // --- HubSpot SDK client for Notes API ---
  const hubspotClient = new hubspot.Client({ accessToken: HUBSPOT_TOKEN });

  const note_properties  = {
      hs_note_body: `Letter of Enrollment attached: <a href="${fileUrl}" target="_blank">View PDF</a>`,
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

    console.log({
      message: 'PDF generated, uploaded, and note created/associated in HubSpot.',
      noteId: apiResponse.id,
      fileUrl
    });
})();

## 🏗️ Architecture Integration

### Existing Framework Leverage
- **Serverless Infrastructure**: Extend current Vercel functions
- **HubSpot Client**: Use existing `shared/hubspot.js` patterns
- **PDF Generation**: Leverage existing Puppeteer setup from payment app
- **Error Handling**: Implement existing exponential backoff patterns

### New Components Required
- **Letter Template Service**: EJS template management
- **Enrollment Data Aggregator**: Combine HubSpot data sources
- **Document Generation Pipeline**: PDF creation and storage workflow
- **Delivery Management**: Email sending and tracking system

## 📊 Data Flow Architecture

```yaml
Webhook_Received:
  1. Validate webhook signature and payload
  2. Extract student and course identifiers
  3. Query HubSpot for complete enrollment data
  4. Generate Letter of Enrollment PDF
  5. Upload PDF to HubSpot Files
  6. Associate document with Contact and Deal
  7. Log event to Deal timeline
  8. Trigger email delivery workflow
  9. Track delivery confirmation
```

### HubSpot Properties Integration
- **Contact Properties**:
  - `enrollment_letter_generated` (date)
  - `enrollment_letter_file_id` (HubSpot file ID)
  - `enrollment_letter_sent` (boolean)
- **Deal Properties**:
  - `enrollment_confirmed_date` (date)
  - `enrollment_document_status` (enumeration)
  - `enrollment_letter_recipients` (multi-line text)

## 🔒 Security & Compliance

### Data Protection
- **PII Handling**: Secure processing of student personal information
- **Document Security**: Password-protected PDFs for sensitive documents
- **Access Control**: Token-based access for document retrieval
- **Audit Trail**: Complete logging of document generation and access

### Compliance Requirements
- **FERPA Compliance**: Student privacy protection
- **Data Retention**: Automated cleanup of temporary files
- **International Standards**: Support for multiple country formats
- **Accessibility**: PDF/A compliance for long-term archival

## ⚡ Performance Requirements

### Response Time Targets
- **Webhook Processing**: <5 seconds
- **Letter Generation**: <30 seconds
- **File Upload**: <10 seconds
- **Email Delivery**: <2 minutes end-to-end

### Scalability Considerations
- **Concurrent Processing**: Handle multiple enrollments simultaneously
- **Rate Limiting**: Respect HubSpot API limits (100 requests/10 seconds)
- **Queue Management**: Process letters in order during high-volume periods
- **Error Recovery**: Automatic retry for failed generations

## 🧪 Testing Strategy

### Unit Tests
- PDF generation with mock data
- HubSpot API integration testing
- Email delivery service validation
- Template rendering accuracy

### Integration Tests
- End-to-end webhook to delivery workflow
- HubSpot file association verification
- Email tracking and confirmation
- Error handling and retry logic

### Manual Testing Scenarios
- Generate letters for different course types
- Test with international student data
- Verify multi-recipient delivery
- Validate document accessibility and formatting

## 📋 Success Criteria & Validation Gates

### Phase 1 - Planning Validation
- [ ] PRP confidence score ≥7
- [ ] All dependencies identified
- [ ] HubSpot properties mapped
- [ ] Template design approved

### Phase 2 - Development Validation  
- [ ] Webhook handler processes all trigger events
- [ ] PDF generation matches template requirements
- [ ] HubSpot integration follows existing patterns
- [ ] Error handling implements exponential backoff

### Phase 3 - Testing Validation
- [ ] Test coverage ≥70%
- [ ] All security requirements verified
- [ ] Performance targets achieved
- [ ] Manual testing scenarios pass

### Phase 4 - Deployment Validation
- [ ] Staging deployment successful
- [ ] Production webhook integration tested
- [ ] Monitoring and alerting configured
- [ ] Documentation complete

## 🚀 Implementation Timeline

### Estimated Effort (Framework Accelerated)
- **Traditional Approach**: 3-4 weeks
- **Framework Approach**: 3-5 days
- **Time Reduction**: 85%

### Development Phases
1. **Planning & PRP**: 4 hours
2. **Parallel Component Development**: 8 hours
3. **Core Implementation**: 2 days
4. **Security & Testing**: 1 day
5. **Deployment**: 4 hours

## 🎯 Developer Agent Assignments

Based on the PrepDoctors framework, expected agent responsibilities:

- **hubspot-crm-specialist**: HubSpot data integration, property management
- **serverless-infra-engineer**: Webhook handler extension, Vercel configuration
- **data-flow-architect**: Enrollment data aggregation, state management
- **frontend-payment-optimizer**: PDF template design and generation
- **error-recovery-specialist**: Retry logic, failure recovery
- **security-compliance-auditor**: Data protection, access control
- **test-validation-specialist**: Comprehensive testing suite
- **stripe-integration-specialist**: Webhook signature validation

## 💡 Future Enhancement Opportunities

### Phase 2 Features (Future Sprints)
- **Multi-language Support**: Generate letters in student's preferred language
- **Dynamic Templates**: Course-specific letter formats
- **Bulk Generation**: Process multiple enrollments simultaneously
- **Integration APIs**: Allow external systems to request letters
- **Advanced Analytics**: Track document usage and effectiveness

### Integration Possibilities
- **DocuSign**: Digital signature workflows
- **SMS Notifications**: Instant delivery alerts
- **Mobile App**: Direct letter access for students
- **CRM Integration**: Cross-platform enrollment tracking

---

## 📝 Notes for PRP Generation

This feature leverages the existing PrepDoctors framework infrastructure:
- Extends proven webhook processing patterns
- Uses established HubSpot integration methods
- Builds on existing PDF generation capabilities
- Follows serverless architecture best practices
- Maintains security and compliance standards

**Ready for PRP generation and agent-coordinated implementation.**
