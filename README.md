# Enrollment Letter Generator

A serverless PDF generation service for creating enrollment letters for PrepDoctors students. This application generates enrollment letters by fetching student and course data from HubSpot and creating formatted PDF documents.

## Features

- **Serverless PDF Generation**: Uses Puppeteer with Chrome in serverless environments
- **HubSpot Integration**: Automatically fetches student and course data from HubSpot CRM
- **PDF Upload**: Automatically uploads generated PDFs to HubSpot file storage
- **Note Creation**: Creates HubSpot notes with PDF attachments linked to student records
- **Multi-Location Support**: Supports multiple PrepDoctors locations (Mississauga, Vancouver, Montreal, Calgary, Online)
- **Course Mapping**: Maps course IDs to full course names and formats enrollment periods

## Tech Stack

- **Runtime**: Node.js 18+
- **Platform**: Vercel Serverless Functions
- **PDF Generation**: Puppeteer Core with @sparticuz/chromium
- **Integrations**: HubSpot API, Stripe (if needed)
- **Styling**: Custom CSS with Montserrat font

## API Endpoints

### `POST /api/generatePDF`
Generates an enrollment letter PDF for a student.

**Required Fields:**
```json
{
  "firstname": "Student's first name",
  "lastname": "Student's last name",
  "recordID": "HubSpot contact ID",
  "student_id": "Student identifier",
  "location": "Course location",
  "course_id": "Course identifier",
  "enrollment_record_id": "Enrollment record ID",
  "course_start_date": "Course start date (epoch ms)",
  "course_end_date": "Course end date (epoch ms)"
}
```

**Response:**
```json
{
  "message": "PDF generated, uploaded, and note created/associated in HubSpot.",
  "noteId": "123456789",
  "fileUrl": "https://hubspot-file-url.com/file.pdf",
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `GET /api/generatePDF`
Health check endpoint that returns service status.

## Environment Variables

Create a `.env` file with:

```env
HS_TOKEN2=your_hubspot_private_app_token
```

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your HubSpot token
   ```

3. **Run locally:**
   ```bash
   vercel dev
   ```

4. **Test the endpoint:**
   ```bash
   node test-enrollment-limiting.js
   ```

## Deployment

Deploy to Vercel:

```bash
# Deploy to staging
vercel

# Deploy to production
vercel --prod
```

## Project Structure

```
enrollmentLetterGen/
├── api/
│   └── generatePDF.js        # Main PDF generation endpoint
├── public/                   # Static assets
├── test-enrollment-limiting.js # Test script
├── package.json             # Dependencies
├── vercel.json              # Vercel configuration
└── .env                     # Environment variables
```

## Supported Locations

- **Mississauga**: `200-1515 Matheson Blvd Mississauga, ON L4W 2P5`
- **Vancouver**: `522 Seventh Street, Unit 100, New Westminster, BC V3M 5T5`
- **Montreal**: `6540 Chemin de la Côte-de-Liesse Saint-Laurent, QC H4T 1E3`
- **Calgary**: `518 9 Ave SE, Calgary, AB T2G 0S1`
- **Online/B9**: Uses Mississauga address

## Supported Courses

- **AFK**: Assessment of Fundamental Knowledge Course
- **ACJ**: Assessment of Clinical Judgment Course
- **ADT**: Advanced Dental Admission Test Course
- **INBDE**: Integrated National Board Dental Examination Course
- **BRD**: Virtual OSCE
- **Clinical/B9**: NDECC® Clinical Skills Course
- **Situational**: NDECC® Situational Judgment Course
- **SitPractice**: NDECC® Situational Practice Course
- **SimPack**: NDECC® Simulation Package Course
- **Sim**: NDECC® Simulation Situational Course

## PDF Template

The generated PDFs include:
- PrepDoctors branding and logo
- Student name with "Dr." prefix
- Course name and duration
- Facility location and address
- Official signature from Client Relations Manager
- Watermark background
- Professional footer with contact information

## Error Handling

The service includes comprehensive error handling for:
- Missing required fields
- Invalid locations or course IDs
- PDF generation failures
- HubSpot API errors
- Serverless timeout issues
- Browser connection failures

## License

Internal use for PrepDoctors Institute.