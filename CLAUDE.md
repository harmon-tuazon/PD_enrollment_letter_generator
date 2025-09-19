# CLAUDE.md - System Prompt for PrepDoctors HubSpot Automation Framework

This file provides critical guidance to Claude Code (claude.ai/code) for the PrepDoctors HubSpot Automation Development Framework.

## 🚨 CRITICAL: This is a FRAMEWORK, Not Just a Payment App

You are working with the **PrepDoctors HubSpot Automation Development Framework** - a revolutionary system for building ANY HubSpot-centric automation. The payment app is just the reference implementation proving this framework can deliver:

**10x faster development** | **70-85% time reduction** | **One-pass implementation success**

### Framework Core Components:
1. **PRP-Driven Development**: Comprehensive plans ensuring 7-10 confidence scores
2. **8 Specialized Developer Agents**: Each writes specific code types (NOT runtime functions)
3. **5-Phase Workflow**: Guaranteed progression from idea to production
4. **HubSpot-Centric Architecture**: No databases, HubSpot is the single source of truth
5. **Complete Audit Trails**: Every action logged as formatted Deal timeline notes

## 🔄 The 5-Phase Development Workflow

**THIS IS YOUR PRIMARY WORKFLOW - USE IT FOR EVERY FEATURE:**

### Phase 1: Planning & PRP Generation (2-4 hours)
```bash
# Step 1: Define what you want to build
echo "## FEATURE: [Name]
- Requirement 1
- Requirement 2
- Success criteria" > features/[feature-name].md

# Step 2: Generate comprehensive PRP with agent assignments
generate-nodejs-hubspot-prp features/[feature-name].md
# Output: PRPs/[feature-name].md with confidence score 7-10
```

### Phase 2: Parallel Component Development (4-8 hours)
```bash
# Execute PRP - This automatically invokes 3 agents SIMULTANEOUSLY:
execute-nodejs-hubspot-prp PRPs/[feature-name].md

# While you wait, these agents write code in parallel:
- hubspot-crm-specialist: Writing HubSpot API integration code
- stripe-integration-specialist: Writing payment processing logic
- data-flow-architect: Writing state management patterns
```

### Phase 3: Core Implementation (1-2 days)
```bash
# Agents work sequentially on infrastructure:
- serverless-infra-engineer: Writes vercel.json and endpoints
- error-recovery-specialist: Writes retry logic and recovery
- frontend-payment-optimizer: Writes UI components and forms
```

### Phase 4: Security & Testing (4-8 hours)
```bash
# Final validation by specialists:
- security-compliance-auditor: Reviews and adds security code
- test-validation-specialist: Writes tests ensuring >70% coverage
```

### Phase 5: Deployment (2-4 hours)
```bash
vercel           # Deploy to staging
# Test thoroughly
vercel --prod    # Deploy to production
# Monitor and verify
```

## 📋 Framework Commands - YOUR TOOLKIT

### 🚀 ALWAYS Start EVERY Session With:
```bash
primer  # THIS IS MANDATORY - Loads context, shows what to do next
```

### 🎯 Core Framework Commands:
```bash
# Step 1: Generate PRP from ANY feature (works for ALL automations)
generate-nodejs-hubspot-prp features/student-onboarding.md
generate-nodejs-hubspot-prp features/course-scheduling.md  
generate-nodejs-hubspot-prp features/email-campaigns.md

# Step 2: Execute PRP - Agents handle EVERYTHING
execute-nodejs-hubspot-prp PRPs/student-onboarding.md

# That's it! The framework does the rest!
```

### 💡 Example: Build Complete Student Onboarding in 3 Days
```bash
# Day 1: Define and Plan
cat > features/student-onboarding.md << EOF
## FEATURE: Automated Student Onboarding
- Create HubSpot contacts on registration
- Send welcome email sequence
- Assign to cohort
- Track progress in Deal pipeline
EOF

generate-nodejs-hubspot-prp features/student-onboarding.md

# Day 2: Execute Implementation
execute-nodejs-hubspot-prp PRPs/student-onboarding.md

# Day 3: Deploy
vercel --prod

# DONE! Complete automation ready!
```

## 📁 Framework Documentation Structure

**Critical Files to Understand:**
- `README.md` - Complete framework overview (MAIN GUIDE)
- `DEVELOPMENT_CHECKPOINT.md` - Current state (check daily)
- `FEATURE_TRACKER.md` - Active features pipeline
- `DEVELOPMENT_WORKFLOW.md` - Detailed workflow process
- `AGENT_DEVELOPER_COORDINATION_RULES.md` - How agents collaborate
- `INITIAL.md` - Reference feature implementation

## Global Development Rules

### Core Development Philosophy

#### KISS (Keep It Simple, Stupid)
Simplicity is paramount in our HubSpot-centric architecture. Choose HubSpot's built-in features over custom solutions. Simple solutions are easier to maintain in a serverless environment.

#### YAGNI (You Aren't Gonna Need It)
Avoid building functionality on speculation. Our payment app has proven that minimal, focused features work best. Implement only what's needed now.

### Design Principles

- **API-First Architecture**: HubSpot and Stripe APIs are our backend - no custom databases
- **Stateless by Design**: Every Vercel function execution is independent
- **Error-First Callbacks**: Always handle errors as the first parameter in callbacks
- **Async by Default**: Use async/await for all API calls to HubSpot and Stripe
- **Fail Fast**: Validate inputs early using Joi schemas
- **Security First**: Never trust user input, always validate with existing validation.js patterns

### Search Command Requirements

**CRITICAL**: Always use `rg` (ripgrep) instead of traditional `grep` and `find` commands:

```bash
# ❌ Don't use grep
grep -r "pattern" .

# ✅ Use rg instead
rg "pattern"

# ❌ Don't use find with name
find . -name "*.js"

# ✅ Use rg with file filtering
rg --files -g "*.js"
```

### HubSpot-Centric Guidelines

1. **HubSpot as Single Source of Truth**
   - Never cache data locally beyond request lifecycle
   - Always query HubSpot for current state
   - Use Payment Schedule properties for all status tracking

2. **Deal Timeline for Audit Trail**
   - Log all financial events as formatted notes
   - Use consistent icons (✅ ❌ 🔁 📊)
   - Include structured data in note HTML

3. **Property-Based State Management**
   - Use existing properties before creating new ones
   - Batch property updates for efficiency
   - Validate property values match HubSpot enumerations

4. **ps_record_id is Sacred**
   - Always populate ps_record_id when creating Transactions
   - This links payments to payment schedules
   - Never modify or delete this field

### Vercel Serverless Best Practices

1. **Function Timeout Awareness**
   - Maximum 60 seconds per function execution
   - Design for quick response times
   - Use batch operations to stay within limits

2. **Cold Start Optimization**
   - Minimize dependencies
   - Lazy load when possible
   - Keep functions focused and small

3. **Environment Variables**
   - Never hardcode credentials
   - Validate all required vars on startup
   - Use CRON_SECRET for scheduled job auth

### Testing Requirements

- Test HubSpot integration with dry-run modes
- Mock external API calls in unit tests
- Always test with production-like data volumes
- Validate webhook signatures in tests

### Security Requirements

1. **Token Validation**
   - Always validate invoice tokens
   - Check CRON_SECRET for automated jobs
   - Verify Stripe webhook signatures

2. **Input Sanitization**
   - Use existing validation.js patterns
   - Sanitize HTML with xss library
   - Validate all HubSpot object IDs

3. **Rate Limiting**
   - Respect HubSpot API limits (100 requests/10 seconds)
   - Implement exponential backoff for retries
   - Use existing rate limiting middleware

## 🎯 Framework Project Structure

**This structure applies to ANY automation you build:**

```
[automation-name]/
├── /features/                 # Feature requirements (start here!)
├── /PRPs/                    # Generated comprehensive plans
├── /planning/                # Development specifications
│   ├── /current/            # Active development
│   └── /archive/            # Completed features
├── /services/               # Core business logic
├── /api/                    # Serverless endpoints
├── /shared/                 # Reusable utilities
├── /tests/                  # Test suites
├── vercel.json              # Deployment configuration
└── checkpoints/             # Development snapshots
```

## Essential Commands

### Framework Workflow Commands
```bash
# ALWAYS START WITH THIS
primer                                    # Load context and current state

# CREATE NEW AUTOMATIONS
generate-nodejs-hubspot-prp features/[feature].md   # Generate PRP
execute-nodejs-hubspot-prp PRPs/[feature].md        # Execute implementation

# BUILD & TEST
npm run build                            # Install all dependencies
npm test                                 # Run all tests
npm run test:coverage                    # Check coverage (must be >70%)

# DEVELOPMENT
cd payment_app && npm start              # Test reference implementation
vercel dev                               # Test serverless functions

# DEPLOYMENT
vercel                                   # Deploy to staging
vercel --prod                           # Deploy to production
```

## Architecture Overview

**FRAMEWORK PRINCIPLE**: This architecture applies to ALL PrepDoctors automations, not just payments:

### Payment App (`/payment_app`)
- Customer-facing payment processing via Stripe
- Invoice generation and display
- Agreement signing with PDF generation
- Deposit handling for courses
- NDA signing functionality
- Enhanced webhook processing with **ps_record_id tracking** for payment schedule linking
- Routes: `/invoice/:token`, `/pay/:token`, `/agreement/:token`, `/deposit/:token`, `/nda/:token`

### Payment App (`/payment_app`) - COMPLETED REFERENCE IMPLEMENTATION
This is the only completed feature demonstrating the framework's capabilities.

### Shared Infrastructure (`/shared`)
- **validation.js**: Joi schemas, XSS protection, rate limiting
- **logger.js**: Structured logging with correlation IDs
- **health.js**: Health monitoring and metrics

### API Gateway (`/api`)
- **payment.js**: Routes requests to payment_app
- **financials/*.js**: Financial operations endpoints
- Configured via `vercel.json` for serverless deployment

## Documentation References

### Critical Documentation Files
- **Docs/HUBSPOT_SCHEMA_DOCUMENTATION.md**: Complete HubSpot CRM integration reference
- **Docs/PAYMENT_SCHEDULE_DOCUMENTATION.md**: Payment installment system details
- **Docs/HUBSPOT_CURRENT_STATE_ANALYSIS.md**: Current HubSpot configuration
- **Docs/FINAL_IMPLEMENTATION_PLAN.md**: Complete transformation roadmap
- **Docs/IMPLEMENTATION_QUICK_START.md**: Day-by-day implementation guide

**⚠️ IMPORTANT**: Always update documentation when making changes to:
- HubSpot object schemas or properties
- Payment schedule logic or status flows
- API integration patterns
- New features or removed limitations

## Critical Integration Points

### HubSpot CRM
- Private app authentication via `HS_PRIVATE_APP_TOKEN`
- Custom objects: 
  - Transactions (`2-47045790`)
  - Payment Schedules (`2-47381547`)
  - Credit Notes (`2-41609496`)
- Deal properties: `stripe_customer_id`, `amount`, `course_title`
- Transaction properties: **`ps_record_id`** - Links payments to schedules
- Payment Schedule properties: `retry_attempts`, `processing_status`, `error_code`
- File uploads to HubSpot folder (`HUBSPOT_FOLDER_ID`)

### Stripe Payments
- Payment intents for one-time and installment payments
- Customer creation with saved payment methods
- Webhook events: `payment_intent.succeeded`, `charge.refunded`
- Endpoint: `/stripe-webhook` with signature verification

## Input Validation Standards

### Always Use Joi Schemas
```javascript
// Example from shared/validation.js
const paymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  token: Joi.string().uuid().required(),
  scheduleId: Joi.string().pattern(/^\d+$/).required()
});

// Validate before processing
const { error, value } = paymentSchema.validate(req.body);
if (error) {
  return res.status(400).json({ error: error.details[0].message });
}
```

## Error Handling Patterns

### Operational vs Programming Errors
```javascript
// Operational error - expected, handle gracefully
if (!customer.invoice_settings?.default_payment_method) {
  await loggingService.logChargeEvent(dealId, 'failed', {
    error: 'No payment method on file',
    action: 'Manual intervention required'
  });
  return;
}

// Programming error - unexpected, log and alert
catch (error) {
  console.error('Unexpected error in charge processing:', error);
  // Don't expose internal errors to users
  res.status(500).json({ error: 'An error occurred processing your request' });
}
```

## Performance Guidelines

### Batch Operations
```javascript
// ✅ Good - Batch API calls
const batchUpdate = schedules.map(schedule => ({
  id: schedule.id,
  properties: { status: 'processed' }
}));
await hubspot.crm.objects.batchApi.update(objectType, { inputs: batchUpdate });

// ❌ Bad - Individual API calls in loop
for (const schedule of schedules) {
  await hubspot.crm.objects.basicApi.update(objectType, schedule.id, {...});
}
```

### Respect API Limits
```javascript
// Implement exponential backoff
async function hubspotApiCall(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code === 429 && i < retries - 1) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
      } else {
        throw error;
      }
    }
  }
}
```

## Testing Strategy

### Test Categories
1. **Unit Tests** (`/tests/unit/`)
   - Isolated function testing
   - Mock all external dependencies
   - Focus on business logic

2. **Integration Tests** (`/tests/integration/`)
   - Test API endpoints
   - Use test HubSpot sandbox
   - Validate webhook processing

3. **Manual Testing Scripts** (`/tests/manual/`)
   - `test-hubspot.js` - Verify HubSpot connection
   - `test-charge.js` - Dry run charge processing
   - `test-single.js` - Process specific schedule

### Coverage Requirements
- Minimum 70% coverage for critical paths
- 100% coverage for payment processing logic
- All error paths must have tests

## Deployment Checklist

### Before Deployment
- [ ] All tests passing
- [ ] Environment variables configured in Vercel
- [ ] HubSpot properties created/extended
- [ ] Dry run successful on test data
- [ ] Team briefed on changes

### After Deployment
- [ ] Health check endpoint responding
- [ ] Monitor first cron execution
- [ ] Check deal timelines for logs
- [ ] Verify transaction creation
- [ ] Review error logs

## Common Pitfalls to Avoid

1. **Creating duplicate HubSpot properties** - Always check existing first
2. **Forgetting ps_record_id** - Critical for payment tracking
3. **Not handling rate limits** - Implement exponential backoff
4. **Exposing internal errors** - Sanitize error messages for users
5. **Blocking operations** - Everything must be async
6. **Missing CRON_SECRET** - Always authenticate scheduled jobs
7. **Not using dry-run mode** - Test before processing real payments

## Maintenance Notes

### When Making Changes
1. **Before modifying code**: Review relevant documentation
2. **After implementing changes**: Update documentation
3. **Version tracking**: Update version in package.json
4. **Breaking changes**: Notify team and update migration guide

### Documentation Update Checklist
- [ ] Updated property schemas if HubSpot objects changed
- [ ] Updated API endpoint documentation if routes changed
- [ ] Updated workflow diagrams if business logic changed
- [ ] Updated code examples to reflect current implementation
- [ ] Added troubleshooting entries for new known issues

## 🚀 Building ANY PrepDoctors Automation

### The Framework Can Build ANYTHING
This framework has already proven it can reduce development time by **85%** (from 6-8 weeks to 5 days). Use it to build:

#### ✅ Student Management Automations
```bash
generate-nodejs-hubspot-prp features/student-onboarding.md
generate-nodejs-hubspot-prp features/progress-tracking.md
generate-nodejs-hubspot-prp features/certification-system.md
```

#### ✅ Course Operations Automations
```bash
generate-nodejs-hubspot-prp features/enrollment-processing.md
generate-nodejs-hubspot-prp features/schedule-coordination.md
generate-nodejs-hubspot-prp features/resource-allocation.md
```

#### ✅ Communication Automations
```bash
generate-nodejs-hubspot-prp features/email-campaigns.md
generate-nodejs-hubspot-prp features/sms-notifications.md
generate-nodejs-hubspot-prp features/survey-distribution.md
```

#### ✅ Financial Automations
```bash
generate-nodejs-hubspot-prp features/invoice-generation.md
generate-nodejs-hubspot-prp features/refund-management.md
generate-nodejs-hubspot-prp features/revenue-reporting.md
```

#### ✅ Analytics & Reporting
```bash
generate-nodejs-hubspot-prp features/performance-dashboards.md
generate-nodejs-hubspot-prp features/compliance-reports.md
generate-nodejs-hubspot-prp features/operational-metrics.md
```

### Success Metrics from Real Implementation
```yaml
Payment_Processing_System:
  Traditional_Approach: 6-8 weeks
  Framework_Approach: 5 days
  Time_Saved: 85%
  Test_Coverage: 70%
  Bugs_Reduced: 90%
  Documentation: 100% complete
```

## 🎯 Critical Framework Rules

### MANDATORY Workflow Steps
1. **ALWAYS run `primer` first** - No exceptions, this loads your context
2. **ALWAYS generate PRP before coding** - Ensures 7-10 confidence score
3. **ALWAYS use execute-nodejs-hubspot-prp** - Let agents write the code
4. **ALWAYS maintain checkpoints** - Update DEVELOPMENT_CHECKPOINT.md daily
5. **ALWAYS achieve >70% test coverage** - Framework enforces this

### Framework Best Practices
- **Trust the Process**: The 5-phase workflow guarantees success
- **Trust the Agents**: Each is expert in their domain
- **Use HubSpot Properties**: Never create local databases
- **Implement Idempotency**: Every operation must be retryable
- **Log to Deal Timelines**: Complete audit trail with icons

### Development Rules
- **FRAMEWORK FIRST**: Always use the framework workflow, don't code manually
- **PRP REQUIRED**: Never skip PRP generation - it ensures one-pass success
- **START WITH PRIMER**: Begin EVERY session with the primer command
- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files unless explicitly requested
- ALWAYS keep existing documentation in sync with code changes
- ALWAYS use rg instead of grep or find commands
- NEVER use synchronous I/O operations
- ALWAYS validate inputs with Joi schemas
- NEVER store secrets in code
- ALWAYS use HubSpot as the single source of truth

## Agent Development Team

Our specialized agents are DEVELOPERS who write code for ANY PrepDoctors automation:

### Agent Roles - CODE WRITERS, NOT EXECUTORS

Each agent is a specialized developer who WRITES code, not performs functions:

- **hubspot-crm-specialist**: Writes HubSpot integration code
  - Writes API calls using shared/hubspot.js patterns
  - Writes search queries for Payment Schedules
  - Writes Deal timeline note formatting code
  - Writes batch operations and property updates
  
- **stripe-integration-specialist**: Writes payment processing code
  - Writes payment intent creation logic
  - Writes webhook handlers with ps_record_id tracking
  - Writes retry logic for failed payments
  - Writes customer management code

- **serverless-infra-engineer**: Writes infrastructure code
  - Writes vercel.json configurations
  - Writes cron job handlers
  - Writes function optimization code
  - Writes environment variable validation

- **data-flow-architect**: Writes state management code
  - Writes property-based state machines
  - Writes idempotent operation checks
  - Writes transaction consistency logic
  - Writes migration strategies

- **test-validation-specialist**: Writes test code
  - Writes unit tests with mocks
  - Writes integration tests
  - Writes test coverage reports
  - Writes test data factories

- **security-compliance-auditor**: Writes security code
  - Writes Joi validation schemas
  - Writes authentication middleware
  - Writes rate limiting logic
  - Writes input sanitization

- **error-recovery-specialist**: Writes error handling code
  - Writes exponential backoff implementations
  - Writes circuit breaker patterns
  - Writes retry mechanisms
  - Writes failure recovery logic

- **frontend-payment-optimizer**: Writes UI code
  - Writes payment form components
  - Writes responsive CSS
  - Writes client-side validation
  - Writes PDF generation code

### Agent Communication = Code Handoffs

When agents communicate, they're handing off code tasks:
- "I wrote the API endpoint, you need to write the tests"
- "I wrote the HubSpot query, you need to write error handling"
- "I wrote the payment logic, you need to write the security validation"

### Code Review Protocol

Each agent reviews code in their domain:
1. Security agent reviews ALL new endpoints
2. Test agent ensures > 70% coverage
3. HubSpot agent reviews all CRM integrations
4. Stripe agent reviews all payment code

### Simple Agent Developer Rules

1. **One Developer Per File** - Each file has a primary developer owner
2. **Code Reviews Required** - Domain experts review their areas
3. **Explicit Handoffs** - "I wrote X, you write Y"
4. **Test Everything** - test-validation-specialist writes tests for all code

### File Ownership Map

```yaml
file-ownership:
  /shared/hubspot.js: hubspot-crm-specialist
  /shared/validation.js: security-compliance-auditor
  /shared/logger.js: error-recovery-specialist
  /payment_app/app.js: stripe-integration-specialist
  /payment_app/services/hubspot.js: hubspot-crm-specialist
  /payment_app/routes/invoice.js: frontend-payment-optimizer
  /tests/*: test-validation-specialist
  /vercel.json: serverless-infra-engineer
```

### Developer Task Assignment Example

When implementing a new feature:
1. **data-flow-architect** writes the state flow design
2. **hubspot-crm-specialist** writes HubSpot integration code
3. **stripe-integration-specialist** writes payment processing code
4. **error-recovery-specialist** writes retry and error handling
5. **security-compliance-auditor** writes validation schemas
6. **test-validation-specialist** writes all tests
7. **serverless-infra-engineer** writes deployment config

Remember: Agents write code, they don't run the application!

---

---

## 🔥 THE BOTTOM LINE

**This framework transforms 6-8 week projects into 5-day implementations.**

When you start ANY new PrepDoctors automation:
1. Run `primer` to load context
2. Create your feature in `features/`
3. Run `generate-nodejs-hubspot-prp`
4. Run `execute-nodejs-hubspot-prp`
5. Deploy with `vercel --prod`

**That's it. The framework handles everything else.**

Welcome to the future of PrepDoctors automation development.

---

_This is the PrepDoctors HubSpot Automation Development Framework - Building ANY automation, 10x faster._
_Framework Version: 1.0.0_
_Last updated: September 7, 2025_
_Created By Dr. Faris Marei