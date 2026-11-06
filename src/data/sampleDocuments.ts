import { DocumentItem } from '../types/document';

export const SAMPLE_DOCUMENTS: DocumentItem[] = [
  {
    id: 'demo-doc-rental',
    userId: 'demo-user',
    fileName: 'Sample_Rental_Agreement_Indiranagar.pdf',
    fileType: 'sample',
    fileSize: 428000,
    documentCategory: 'Rental Agreement',
    uploadDate: '2026-10-15T10:30:00.000Z',
    pageCount: 3,
    isDemo: true,
    previewPages: [
      `RESIDENTIAL TENANCY AGREEMENT
This Deed of Tenancy Agreement is made and executed on the 1st day of November 2026 at Bengaluru, Karnataka:
BETWEEN:
Mr. Ramesh Sundaram, residing at Flat 402, Oakwood Enclave, 100ft Road, Indiranagar, Bengaluru - 560038 (hereinafter called the "LESSOR / LANDLORD") of the ONE PART;
AND:
Ms. Ananya Sharma, employed at CloudTech Solutions Pvt Ltd, Bengaluru (hereinafter called the "LESSEE / TENANT") of the OTHER PART.

WHEREAS the Landlord is the absolute owner of residential apartment No. 201, 2nd Floor, Lotus Residency, 12th Main Road, Indiranagar, measuring 1,450 sq.ft. 3BHK with reserved car parking.

NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:
1. TERM & PERIOD:
The lease period shall be for a fixed term of eleven (11) consecutive months commencing from 1st November 2026 to 30th September 2027. Either party may terminate this agreement by providing two (2) full calendar months written notice.

2. MONTHLY RENT & UTILITIES:
The Tenant agrees to pay a fixed monthly rent of ₹38,000 (Rupees Thirty Eight Thousand only) payable in advance on or before the 5th day of every calendar month into the Landlord's designated HDFC Bank Account. Maintenance charges of ₹4,200 per month shall be paid directly by the Tenant to the Apartment Owners Association.`,

      `3. INTEREST-FREE REFUNDABLE SECURITY DEPOSIT:
The Tenant has deposited a sum of ₹1,50,000 (Rupees One Lakh Fifty Thousand only) as interest-free refundable security deposit with the Landlord. The deposit shall be refunded within fifteen (15) working days from the date of handover of vacant possession, subject to deduction of unpaid utility bills, damages beyond normal wear and tear, and mandatory painting charges of one month's rent (₹38,000).

4. LATE PAYMENT PENALTY:
In the event the monthly rent is not credited by the 5th of the month, a grace period until the 10th is permitted. If payment is delayed beyond the 10th day, a late penalty of ₹500 per day shall be levied until the full amount is settled. Continued default for more than thirty (30) days gives the Landlord unconditional right of immediate eviction.

5. LOCK-IN PERIOD:
Both parties mutually agree to a mandatory Lock-in Period of six (6) months from the commencement date. If the Tenant vacates before the expiry of the lock-in period, the Tenant shall forfeit the security deposit equivalent to the rent for the remainder of the lock-in period.`,

      `6. USE, MAINTENANCE & SUB-LETTING RESTRICTION:
The premises shall be used exclusively for peaceful residential purposes by the Tenant and her immediate family. Sub-letting, assigning, sharing, or paying-guest accommodations are strictly prohibited and constitutes an immediate material breach.

7. INSPECTION & RIGHT OF ENTRY:
The Landlord or authorized representative reserves the right to inspect the premises at reasonable daylight hours after giving prior written notice of at least twenty-four (24) hours.

8. RENEWAL CLAUSE:
If mutually agreed, the tenancy may be renewed for a further term of eleven (11) months subject to an automatic escalation of 8% (eight percent) on the current monthly rent.

9. REPAIRS & ALTERATIONS:
Minor day-to-day repairs up to ₹1,500 (such as bulb replacements, tap washer fixes) shall be borne by the Tenant. Structural repairs, seepage, and external plumbing shall be attended to by the Landlord within 7 business days of written notice.

IN WITNESS WHEREOF the parties have set their hands and signatures on the day and year first above written.`
    ],
    analysis: {
      id: 'analysis-rental-1',
      documentId: 'demo-doc-rental',
      createdAt: '2026-10-15T10:31:12.000Z',
      overview: {
        title: 'Residential Tenancy Agreement — 11 Month Lease',
        category: 'Rental Agreement',
        mainPurpose: 'Formal agreement leasing a 3BHK apartment in Indiranagar, Bengaluru for residential occupancy between Mr. Ramesh Sundaram and Ms. Ananya Sharma.',
        partiesMentioned: ['Mr. Ramesh Sundaram (Landlord)', 'Ms. Ananya Sharma (Tenant)', 'Lotus Residency Apartment Owners Association'],
        effectiveDates: '1st November 2026 to 30th September 2027 (11 months)',
        summaryEnglish: 'This is a standard 11-month residential rent agreement with a monthly rent of ₹38,000 and ₹1,50,000 security deposit. It includes a strict 6-month lock-in period, a 2-month notice requirement, and an automatic deduction of one month\'s rent for painting upon move-out.',
        summaryHindi: 'यह 11 महीने का आवासीय किराया समझौता है जिसमें ₹38,000 मासिक किराया और ₹1,50,000 सिक्योरिटी डिपॉजिट शामिल है। इसमें 6 महीने का अनिवार्य लॉक-इन पीरियड और खाली करते समय 1 महीने के किराए की पेंटिंग कटौती का नियम है।',
        summaryHinglish: 'Yeh 11 months ka residential rental agreement hai jisme monthly rent ₹38,000 aur security deposit ₹1,50,000 hai. Isme 6-month lock-in period aur vacating ke time 1 month rent painting charges deduction mention kiya gaya hai.',
        keyTakeaways: [
          'Rent of ₹38,000 is due strictly by the 5th of each month.',
          'Mandatory 6-month lock-in period — leaving early causes forfeiture of deposit.',
          'Deduction of ₹38,000 (one month rent) will be deducted for painting when you vacate.',
          'A late fee of ₹500 per day begins after the 10th of the month.',
          '2 months advance written notice required before vacating.'
        ],
        complexityScore: 42,
        readingTimeMinutes: 4
      },
      keyClauses: [
        {
          id: 'rental-c1',
          title: 'Mandatory 6-Month Lock-in Period',
          originalQuote: 'Both parties mutually agree to a mandatory Lock-in Period of six (6) months... Tenant shall forfeit the security deposit equivalent to the rent for the remainder',
          simpleExplanation: 'You cannot leave or break the lease during the first 6 months. If you move out early, you still have to pay the rent for the remaining lock-in months from your deposit.',
          hindiExplanation: 'पहले 6 महीनों के दौरान आप मकान खाली नहीं कर सकते। यदि आप पहले छोड़ते हैं, तो बचे हुए महीनों का किराया आपके डिपॉजिट से काट लिया जाएगा।',
          hinglishExplanation: 'Pehle 6 months aap room/flat nahi chhod sakte. Agar pehle chhodte ho toh remaining months ka rent security deposit se forfeit ho jayega.',
          whyItMatters: 'Prevents you from terminating the lease prematurely without substantial financial penalty.',
          pageNumber: 2,
          sectionRef: 'Section 5: Lock-In Period',
          category: 'restrictions',
          importance: 'critical'
        },
        {
          id: 'rental-c2',
          title: 'Two Months Notice Period for Termination',
          originalQuote: 'Either party may terminate this agreement by providing two (2) full calendar months written notice.',
          simpleExplanation: 'When you decide to move out after the lock-in period, you must give the landlord written notice 2 full months in advance.',
          hindiExplanation: 'लॉक-इन अवधि के बाद खाली करने के लिए आपको मकान मालिक को कम से कम 2 महीने पहले लिखित नोटिस देना होगा।',
          hinglishExplanation: 'Flat vacate karne ke liye aapko 2 calendar months pehle written notice dena compulsory hai.',
          whyItMatters: 'Failing to serve notice will result in two months rent being deducted from your deposit.',
          pageNumber: 1,
          sectionRef: 'Section 1: Term & Period',
          category: 'termination',
          importance: 'important'
        },
        {
          id: 'rental-c3',
          title: 'Strict Sub-letting & Paying Guest Ban',
          originalQuote: 'Sub-letting, assigning, sharing, or paying-guest accommodations are strictly prohibited and constitutes an immediate material breach.',
          simpleExplanation: 'You cannot rent out rooms to roommates, Airbnb guests, or paying guests without formal landlord consent.',
          hindiExplanation: 'किरायेदार किसी अन्य व्यक्ति को उप-किराए (सबलेट) पर नहीं दे सकता या पेइंग गेस्ट नहीं रख सकता।',
          hinglishExplanation: 'Aap kisi aur ko room sublet nahi kar sakte ya commercial PG ki tarah use nahi kar sakte.',
          whyItMatters: 'Subletting gives the landlord ground for immediate lease cancellation.',
          pageNumber: 3,
          sectionRef: 'Section 6: Use & Sub-letting',
          category: 'restrictions',
          importance: 'important'
        },
        {
          id: 'rental-c4',
          title: '24-Hour Notice for Landlord Entry',
          originalQuote: 'The Landlord reserves the right to inspect the premises at reasonable daylight hours after giving prior written notice of at least twenty-four (24) hours.',
          simpleExplanation: 'The landlord cannot enter unannounced; they must give you at least 24 hours advance written notice and come during daytime.',
          hindiExplanation: 'मकान मालिक बिना पूर्व सूचना के नहीं आ सकते; उन्हें कम से कम 24 घंटे पहले लिखित नोटिस देना होगा।',
          hinglishExplanation: 'Landlord achanak nahi aa sakte, unhe aane se pehle kam se kam 24 hours advance written notice dena hoga.',
          whyItMatters: 'Protects your privacy and quiet enjoyment of the rented home.',
          pageNumber: 3,
          sectionRef: 'Section 7: Inspection & Entry',
          category: 'rights',
          importance: 'info'
        }
      ],
      fees: [
        {
          id: 'rental-f1',
          feeName: 'Monthly Rent',
          amount: '₹38,000',
          frequency: 'monthly',
          purpose: 'Fixed monthly fee for tenancy and car parking',
          penaltiesOrLateFee: '₹500/day after the 10th of the month',
          refundConditions: 'Non-refundable rental payment',
          pageNumber: 1,
          sectionRef: 'Section 2: Monthly Rent',
          severity: 'critical'
        },
        {
          id: 'rental-f2',
          feeName: 'Society Maintenance Charges',
          amount: '₹4,200',
          frequency: 'monthly',
          purpose: 'Direct payment to Lotus Residency Apartment Owners Association for amenities & security',
          penaltiesOrLateFee: 'Society standard late fee if unpaid',
          refundConditions: 'Non-refundable operational charge',
          pageNumber: 1,
          sectionRef: 'Section 2: Monthly Rent & Utilities',
          severity: 'important'
        },
        {
          id: 'rental-f3',
          feeName: 'Security Deposit',
          amount: '₹1,50,000',
          frequency: 'one-time',
          purpose: 'Interest-free refundable security against damages and dues',
          penaltiesOrLateFee: 'Forfeited if lock-in broken or bills unpaid',
          refundConditions: 'Refundable within 15 working days minus painting charges (₹38,000)',
          pageNumber: 2,
          sectionRef: 'Section 3: Security Deposit',
          severity: 'critical'
        },
        {
          id: 'rental-f4',
          feeName: 'Mandatory Painting Deduction',
          amount: '₹38,000 (1 month rent)',
          frequency: 'one-time',
          purpose: 'Repainting the premises upon vacating at the end of tenancy',
          penaltiesOrLateFee: 'Deducted automatically from ₹1,50,000 deposit',
          refundConditions: 'Non-refundable deduction upon move-out',
          pageNumber: 2,
          sectionRef: 'Section 3: Security Deposit',
          severity: 'critical'
        },
        {
          id: 'rental-f5',
          feeName: 'Late Rent Penalty',
          amount: '₹500 per day',
          frequency: 'conditional',
          purpose: 'Penalty charged for rent delayed past the 10th of the month',
          penaltiesOrLateFee: 'Compounds daily until full settlement; eviction risk after 30 days',
          refundConditions: 'Non-refundable penalty',
          pageNumber: 2,
          sectionRef: 'Section 4: Late Payment Penalty',
          severity: 'critical'
        }
      ],
      deadlines: [
        {
          id: 'rental-d1',
          date: '5th of every month',
          requirement: 'Transfer monthly rent of ₹38,000 to Landlord bank account',
          pageNumber: 1,
          sectionRef: 'Section 2',
          isExplicit: true,
          status: 'upcoming',
          urgency: 'urgent'
        },
        {
          id: 'rental-d2',
          date: '10th of every month',
          requirement: 'Grace period cut-off. Daily penalty of ₹500/day begins on the 11th',
          pageNumber: 2,
          sectionRef: 'Section 4',
          isExplicit: true,
          status: 'pending',
          urgency: 'urgent'
        },
        {
          id: 'rental-d3',
          date: '30th April 2027',
          isoDate: '2027-04-30',
          requirement: 'End of 6-month lock-in period (lease started 1st Nov 2026)',
          pageNumber: 2,
          sectionRef: 'Section 5',
          isExplicit: false,
          status: 'pending',
          urgency: 'medium'
        },
        {
          id: 'rental-d4',
          date: '30th September 2027',
          isoDate: '2027-09-30',
          requirement: 'Expiry of 11-month tenancy term unless renewed with 8% escalation',
          pageNumber: 1,
          sectionRef: 'Section 1',
          isExplicit: true,
          status: 'pending',
          urgency: 'low'
        },
        {
          id: 'rental-d5',
          date: '15 working days after handover',
          requirement: 'Landlord must refund remaining security deposit (₹1,50,000 - ₹38,000 painting)',
          pageNumber: 2,
          sectionRef: 'Section 3',
          isExplicit: true,
          status: 'pending',
          urgency: 'medium'
        }
      ],
      requiredActions: [
        {
          id: 'rental-a1',
          actionText: 'Set up automated standing instruction for ₹38,000 on the 1st of every month',
          description: 'Ensures payment reaches landlord before the 5th due date to avoid the ₹500/day late penalty.',
          dueDate: '1st of each month',
          urgency: 'urgent',
          completed: false,
          pageNumber: 1,
          sectionRef: 'Section 2',
          partiesInvolved: ['Ms. Ananya Sharma (Tenant)']
        },
        {
          id: 'rental-a2',
          actionText: 'Inspect apartment and take time-stamped video/photos before move-in',
          description: 'Document existing wall marks, plumbing, and fixtures so you are not unfairly charged beyond the ₹38,000 painting fee.',
          dueDate: 'Day of Move-in',
          urgency: 'medium',
          completed: false,
          pageNumber: 2,
          sectionRef: 'Section 3',
          partiesInvolved: ['Tenant and Landlord']
        },
        {
          id: 'rental-a3',
          actionText: 'Pay ₹4,200 monthly maintenance directly to Lotus Residency AOA',
          description: 'Obtain monthly receipts from the association office to prove no arrears exist upon vacating.',
          dueDate: 'Monthly',
          urgency: 'medium',
          completed: false,
          pageNumber: 1,
          sectionRef: 'Section 2',
          partiesInvolved: ['Tenant']
        },
        {
          id: 'rental-a4',
          actionText: 'Submit 2 months written notice if planning to vacate after lock-in',
          description: 'Must be in writing (email or physical letter) to satisfy Section 1 notice obligations.',
          dueDate: '60 days before move-out',
          urgency: 'low',
          completed: false,
          pageNumber: 1,
          sectionRef: 'Section 1',
          partiesInvolved: ['Tenant']
        }
      ],
      importantConditions: [
        {
          id: 'rental-ic1',
          title: 'Automatic ₹38,000 Deduction for Painting',
          condition: 'The agreement specifies a full month\'s rent deduction for painting upon move-out, regardless of how clean you maintain the walls.',
          potentialImpact: 'Your effective security deposit returned will be at most ₹1,12,000 even if there is zero damage.',
          recommendation: 'Verify if the landlord is willing to waive this if you get professional deep cleaning done yourself prior to handover.',
          severity: 'critical',
          pageNumber: 2,
          sectionRef: 'Section 3'
        },
        {
          id: 'rental-ic2',
          title: 'Heavy Daily Penalty (₹500/day) after 10th',
          condition: '₹500 per day begins immediately on the 11th if rent has not cleared.',
          potentialImpact: 'A 10-day delay results in ₹5,000 extra cost (over 13% of the monthly rent).',
          recommendation: 'Always maintain a bank balance buffer or schedule transfer for the 2nd or 3rd.',
          severity: 'critical',
          pageNumber: 2,
          sectionRef: 'Section 4'
        },
        {
          id: 'rental-ic3',
          title: '8% Automatic Rent Escalation on Renewal',
          condition: 'If the lease is extended for another 11 months, rent increases from ₹38,000 to ₹41,040.',
          potentialImpact: 'Higher recurring outflow in Year 2.',
          recommendation: 'Budget for ₹41,040 plus maintenance if you plan to stay past September 2027.',
          severity: 'info',
          pageNumber: 3,
          sectionRef: 'Section 8'
        }
      ],
      sourceReferences: [
        {
          pageNumber: 1,
          summarySnippet: 'Parties description, Indiranagar property details, 11-month lease tenure, and ₹38,000 monthly rent terms.',
          topicsCovered: ['Parties', 'Term', 'Rent Amount', 'Association Maintenance']
        },
        {
          pageNumber: 2,
          summarySnippet: '₹1,50,000 security deposit terms, ₹38,000 painting deduction, ₹500/day late penalty, and 6-month lock-in clause.',
          topicsCovered: ['Security Deposit', 'Painting Deduction', 'Late Penalties', 'Lock-in Period']
        },
        {
          pageNumber: 3,
          summarySnippet: 'Residential use only, no sub-letting, 24-hr inspection notice, 8% renewal escalation, and repair obligations.',
          topicsCovered: ['Subletting Ban', 'Landlord Inspection', '8% Escalation', 'Repairs']
        }
      ]
    }
  },
  {
    id: 'demo-doc-insurance',
    userId: 'demo-user',
    fileName: 'Sample_Health_Insurance_Policy_ShieldPlus.pdf',
    fileType: 'sample',
    fileSize: 580000,
    documentCategory: 'Insurance Policy',
    uploadDate: '2026-09-20T14:15:00.000Z',
    pageCount: 4,
    isDemo: true,
    previewPages: [
      `CARE HEALTHCARE ASSURANCE LIMITED
POLICY SCHEDULE — "SHIELD PLUS INDIVIDUAL HEALTH POLICY"
Policy Number: CHAL-IND-2026-981244
Insured Person: Vikramaditya Patel | Age: 34 Years | Gender: Male
Sum Insured: ₹10,00,000 (Rupees Ten Lakhs Only)
Policy Tenure: 1 Year (Commencement: 01-October-2026 to Midnight 30-September-2027)
Gross Annual Premium: ₹18,450 (inclusive of 18% GST)
Zone of Cover: Zone 1 (Metro Cities including Mumbai, Delhi NCR, Bangalore, Chennai)

SECTION I — BENEFIT HIGHLIGHTS:
1. In-patient Hospitalization: Medical expenses incurred for hospitalization exceeding 24 hours up to the full Sum Insured (₹10,00,000).
2. Room Rent Limit: Single Private Air Conditioned room capped at 1% of Sum Insured per day (₹10,000/day). ICU charges capped at 2% of Sum Insured per day (₹20,000/day). If a higher room category is chosen, proportionate deduction shall apply across all associated medical bills.
3. Pre & Post Hospitalization: 60 days pre-hospitalization and 90 days post-hospitalization medical expenses covered on actuals.`,

      `SECTION II — WAITING PERIODS (MANDATORY CONDITIONS):
1. Initial Waiting Period (30 Days):
No claims shall be admissible for any medical treatment within the first thirty (30) days from policy inception, except claims arising directly out of accidental injury.

2. Specified Disease / Procedure Waiting Period (24 Months):
A strict waiting period of twenty-four (24) consecutive months of continuous coverage applies to treatments for: Cataract, Benign Prostatic Hypertrophy, Hernia, Hydrocele, Piles, Sinusitis, Knee Joint Replacement, Gall bladder stones, and Hysterectomy for menorrhagia.

3. Pre-Existing Disease (PED) Waiting Period (36 Months):
Any pre-existing illness or condition disclosed or diagnosed prior to policy inception shall only be covered after thirty-six (36) months of continuous renewal without break.

SECTION III — CO-PAYMENT CLAUSE:
A mandatory 20% co-payment shall apply to all admissible claims if treatment is availed at a Non-Network Hospital. No co-payment applies at authorized cashless Network Hospitals.`,

      `SECTION IV — CLAIM NOTIFICATION & SUBMISSION TIMELINES:
1. Emergency Hospitalization: The Company or Third Party Administrator (TPA) must be formally notified within twenty-four (24) hours of admission or before discharge, whichever is earlier.
2. Planned Hospitalization: Written pre-authorization request must be submitted at least forty-eight (48) hours prior to hospital admission.
3. Reimbursement Claim Submission: All original bills, discharge summary, pharmacy receipts, and diagnostic reports must be lodged with the TPA within fifteen (15) calendar days from the date of discharge. Failure to lodge within 15 days may result in repudiation of the claim unless supported by valid unforeseen medical grounds.

SECTION V — PERMANENT EXCLUSIONS:
The Company is not liable for costs related to: Cosmetic or aesthetic treatments, weight control surgeries (bariatric), fertility treatments/IVF, self-inflicted injuries, treatments outside the territory of India, non-allopathic unproven therapies, and purchase of non-medical consumables (PPE kits, gloves, sanitizers, administrative fees).`,

      `SECTION VI — GRACE PERIOD & POLICY RENEWAL:
1. Grace Period: A grace period of thirty (30) days is allowed for payment of renewal premium to maintain continuity benefits. However, treatments incurred during the grace period before premium credit are NOT covered.
2. Free-Look Period: The policyholder is entitled to a 15-day free-look period from the date of receipt of the physical or digital policy document to review the terms and conditions. If dissatisfied, the policyholder may cancel and receive a full refund of premium minus stamp duty and proportionate risk coverage.
3. No-Claim Bonus (NCB): A cumulative bonus of 10% on the basic Sum Insured will be granted for every claim-free year, up to a maximum ceiling of 50%.

FOR CARE HEALTHCARE ASSURANCE LIMITED:
Authorized Signatory & Chief Underwriting Officer`
    ],
    analysis: {
      id: 'analysis-insurance-1',
      documentId: 'demo-doc-insurance',
      createdAt: '2026-09-20T14:16:30.000Z',
      overview: {
        title: 'Shield Plus Individual Health Insurance Policy',
        category: 'Insurance Policy',
        mainPurpose: 'Health insurance contract providing ₹10,00,000 medical coverage for Vikramaditya Patel with Care Healthcare Assurance Ltd.',
        partiesMentioned: ['Care Healthcare Assurance Limited (Insurer)', 'Vikramaditya Patel (Insured)', 'Third Party Administrator (TPA)'],
        effectiveDates: '01-October-2026 to 30-September-2027 (1 Year)',
        summaryEnglish: 'This is a ₹10 Lakh individual health policy with an annual premium of ₹18,450. It features a 30-day initial waiting period, a 2-year waiting period for specific surgeries (like hernia and cataract), and a 3-year pre-existing illness exclusion. Using a non-network hospital triggers a 20% co-pay.',
        summaryHindi: 'यह ₹10 लाख का व्यक्तिगत स्वास्थ्य बीमा है जिसका वार्षिक प्रीमियम ₹18,450 है। इसमें 30 दिन का प्रारंभिक वेटिंग पीरियड, सर्जरी के लिए 2 वर्ष का वेटिंग पीरियड और नॉन-नेटवर्क अस्पताल में इलाज पर 20% सह-भुगतान (को-पे) अनिवार्य है।',
        summaryHinglish: 'Yeh ₹10 Lakh ka health insurance policy hai jiska annual premium ₹18,450 hai. Isme 30 days initial waiting period, specific surgeries ke liye 2 saal ka waiting period aur non-network hospital me 20% co-pay lagta hai.',
        keyTakeaways: [
          'Emergency hospitalization must be reported within 24 hours.',
          'Reimbursement bills must be submitted within 15 days of discharge.',
          '20% co-payment applies if you go to a Non-Network hospital.',
          'Room rent capped at ₹10,000/day (1% of Sum Insured) — exceeding this causes proportionate cuts on doctor fees.',
          '15-day Free-Look cancellation window from date of receiving policy.'
        ],
        complexityScore: 68,
        readingTimeMinutes: 6
      },
      keyClauses: [
        {
          id: 'ins-c1',
          title: 'Emergency Notification within 24 Hours',
          originalQuote: 'The Company or Third Party Administrator (TPA) must be formally notified within twenty-four (24) hours of admission or before discharge',
          simpleExplanation: 'If you or a family member is rushed to the hospital in an emergency, you must notify the insurer within 24 hours, otherwise claims can be denied.',
          hindiExplanation: 'आपातकालीन भर्ती की स्थिति में 24 घंटे के भीतर बीमा कंपनी या टीपीए को सूचित करना अनिवार्य है।',
          hinglishExplanation: 'Emergency hospitalization hone par 24 hours ke andar TPA ko inform karna compulsory hai.',
          whyItMatters: 'Late notification is one of the most common reasons insurers reject or delay cashless processing.',
          pageNumber: 3,
          sectionRef: 'Section IV: Claim Notification',
          category: 'liability',
          importance: 'critical'
        },
        {
          id: 'ins-c2',
          title: 'Room Rent Capping at 1% (₹10,000/day) & Proportionate Deduction',
          originalQuote: 'Single Private Air Conditioned room capped at 1% of Sum Insured per day (₹10,000/day)... If a higher room category is chosen, proportionate deduction shall apply',
          simpleExplanation: 'If you choose a deluxe room that costs ₹15,000/day instead of the ₹10,000 cap, the insurer will proportionately slash payment on doctor visits, surgery, and nursing by 33%.',
          hindiExplanation: 'कमरे का किराया प्रति दिन अधिकतम ₹10,000 (1%) तक ही सीमित है। अधिक महंगे कमरे का चयन करने पर सभी बिलों में आनुपातिक कटौती होगी।',
          hinglishExplanation: 'Agar aapne ₹10,000/day se mehenga room liya toh poore hospital bill pe proportionate deduction lagega.',
          whyItMatters: 'Can result in unexpected out-of-pocket bills of several lakhs during major surgeries.',
          pageNumber: 1,
          sectionRef: 'Section I: Benefit Highlights',
          category: 'restrictions',
          importance: 'critical'
        },
        {
          id: 'ins-c3',
          title: '20% Non-Network Hospital Co-payment',
          originalQuote: 'A mandatory 20% co-payment shall apply to all admissible claims if treatment is availed at a Non-Network Hospital.',
          simpleExplanation: 'If the hospital is not on the insurer\'s approved cashless network list, you must pay 20% of the entire medical bill yourself.',
          hindiExplanation: 'गैर-नेटवर्क अस्पताल में इलाज कराने पर कुल मान्य दावे का 20% खर्च आपको स्वयं उठाना होगा।',
          hinglishExplanation: 'Non-network hospital me admit hone par 20% bill aapko apni pocket se pay karna padega.',
          whyItMatters: 'Always check if your hospital is in Care Health\'s network to avoid losing 20% of your claim.',
          pageNumber: 2,
          sectionRef: 'Section III: Co-Payment Clause',
          category: 'restrictions',
          importance: 'important'
        },
        {
          id: 'ins-c4',
          title: '15-Day Free-Look Period',
          originalQuote: 'The policyholder is entitled to a 15-day free-look period... may cancel and receive a full refund of premium minus stamp duty',
          simpleExplanation: 'You can cancel the policy within 15 days of receiving it and get a full refund if you do not agree with any terms.',
          hindiExplanation: 'पॉलिसी दस्तावेज प्राप्त होने के 15 दिनों के भीतर आप इसे रद्द करके पूरा प्रीमियम वापस पा सकते हैं।',
          hinglishExplanation: 'Policy document milne ke 15 days ke andar aap policy cancel karke full refund le sakte hain.',
          whyItMatters: 'Gives you risk-free time to review the fine print.',
          pageNumber: 4,
          sectionRef: 'Section VI: Free-Look Period',
          category: 'rights',
          importance: 'info'
        }
      ],
      fees: [
        {
          id: 'ins-f1',
          feeName: 'Annual Gross Premium',
          amount: '₹18,450',
          frequency: 'annual',
          purpose: 'Annual cost for ₹10,00,000 coverage including 18% GST',
          penaltiesOrLateFee: 'Policy lapses after 30-day grace period',
          refundConditions: 'Pro-rata refund if cancelled under Free-Look (15 days)',
          pageNumber: 1,
          sectionRef: 'Policy Schedule',
          severity: 'important'
        },
        {
          id: 'ins-f2',
          feeName: 'Room Rent Limit',
          amount: '₹10,000 / day',
          frequency: 'conditional',
          purpose: 'Maximum eligible room charge (1% of Sum Insured)',
          penaltiesOrLateFee: 'Excess triggers proportionate deduction on doctor/surgeon fees',
          refundConditions: 'N/A',
          pageNumber: 1,
          sectionRef: 'Section I (2)',
          severity: 'critical'
        },
        {
          id: 'ins-f3',
          feeName: 'Non-Network Co-payment',
          amount: '20% of claim bill',
          frequency: 'conditional',
          purpose: 'Deduction applied when admitted to a non-empanelled hospital',
          penaltiesOrLateFee: 'Mandatory patient co-share',
          refundConditions: 'Non-refundable out-of-pocket expense',
          pageNumber: 2,
          sectionRef: 'Section III',
          severity: 'critical'
        }
      ],
      deadlines: [
        {
          id: 'ins-d1',
          date: 'Within 24 hours of emergency admission',
          requirement: 'Notify TPA/Insurer about emergency hospitalization',
          pageNumber: 3,
          sectionRef: 'Section IV (1)',
          isExplicit: true,
          status: 'upcoming',
          urgency: 'urgent'
        },
        {
          id: 'ins-d2',
          date: '48 hours prior to admission',
          requirement: 'Submit pre-authorization for planned hospitalization',
          pageNumber: 3,
          sectionRef: 'Section IV (2)',
          isExplicit: true,
          status: 'pending',
          urgency: 'medium'
        },
        {
          id: 'ins-d3',
          date: 'Within 15 days of discharge',
          requirement: 'Submit original bills, diagnostic reports, and claim forms for reimbursement',
          pageNumber: 3,
          sectionRef: 'Section IV (3)',
          isExplicit: true,
          status: 'pending',
          urgency: 'urgent'
        },
        {
          id: 'ins-d4',
          date: '30-September-2027',
          isoDate: '2027-09-30',
          requirement: 'Policy expiration date. Must pay renewal premium before 30-day grace period ends',
          pageNumber: 1,
          sectionRef: 'Policy Schedule',
          isExplicit: true,
          status: 'pending',
          urgency: 'low'
        }
      ],
      requiredActions: [
        {
          id: 'ins-a1',
          actionText: 'Save TPA emergency toll-free contact and digital health card in your phone',
          description: 'Ensures immediate access during sudden hospital admission to meet the 24-hour notification deadline.',
          dueDate: 'Immediate',
          urgency: 'urgent',
          completed: false,
          pageNumber: 3,
          sectionRef: 'Section IV',
          partiesInvolved: ['Policyholder']
        },
        {
          id: 'ins-a2',
          actionText: 'Request hospital reception for a room capped strictly at ₹10,000/day or below',
          description: 'Prevents the insurer from triggering proportionate deduction across surgery, nursing, and medicines.',
          dueDate: 'At time of admission',
          urgency: 'urgent',
          completed: false,
          pageNumber: 1,
          sectionRef: 'Section I',
          partiesInvolved: ['Insured / Attendant']
        },
        {
          id: 'ins-a3',
          actionText: 'Collect all pharmacy invoices, doctor prescriptions, and original test reports upon discharge',
          description: 'Section IV requires submission within 15 days. Missing pharmacy vouchers will be rejected.',
          dueDate: 'Day of discharge',
          urgency: 'medium',
          completed: false,
          pageNumber: 3,
          sectionRef: 'Section IV',
          partiesInvolved: ['Insured']
        }
      ],
      importantConditions: [
        {
          id: 'ins-ic1',
          title: '30-Day Initial Waiting Period (Zero Illness Coverage)',
          condition: 'No claim is payable in the first 30 days of the policy, except for accidental injuries.',
          potentialImpact: 'Any fever, infection, or medical hospitalization in Month 1 is 100% out-of-pocket.',
          recommendation: 'Do not schedule elective treatments before 01-November-2026.',
          severity: 'critical',
          pageNumber: 2,
          sectionRef: 'Section II (1)'
        },
        {
          id: 'ins-ic2',
          title: '24-Month Waiting Period for Surgeries (Hernia, Stones, Joint)',
          condition: 'Specific operations like hernia, cataract, gallbladder stones, and piles are excluded for 2 full years.',
          potentialImpact: 'Surgeries for these conditions will be denied until October 2028.',
          recommendation: 'Maintain continuous yearly renewal so you do not reset the 24-month clock.',
          severity: 'important',
          pageNumber: 2,
          sectionRef: 'Section II (2)'
        },
        {
          id: 'ins-ic3',
          title: 'Non-Medical Consumables Excluded (Gloves, Sanitizers, PPE)',
          condition: 'Insurers do not pay for administrative charges, syringe disposal, gloves, and patient gowns.',
          potentialImpact: 'Expect an out-of-pocket hospital charge of approximately 8%–15% of the total bill.',
          recommendation: 'Keep a small emergency fund ready at discharge even for cashless claims.',
          severity: 'info',
          pageNumber: 3,
          sectionRef: 'Section V'
        }
      ],
      sourceReferences: [
        {
          pageNumber: 1,
          summarySnippet: 'Policy schedule, ₹10L sum insured, ₹18,450 premium, and 1% room rent cap with proportionate deduction warning.',
          topicsCovered: ['Sum Insured', 'Premium', 'Room Rent Cap', 'Pre/Post Hospitalization']
        },
        {
          pageNumber: 2,
          summarySnippet: '30-day initial waiting period, 24-month specified surgery exclusion, 36-month pre-existing condition terms, and 20% co-pay.',
          topicsCovered: ['Waiting Periods', 'PED Waiting', 'Co-payment']
        },
        {
          pageNumber: 3,
          summarySnippet: '24-hour emergency notice, 48-hr planned notice, 15-day reimbursement submission deadline, and permanent exclusions.',
          topicsCovered: ['Notification Timelines', 'Reimbursement Deadline', 'Exclusions']
        },
        {
          pageNumber: 4,
          summarySnippet: '30-day grace period, 15-day free-look cancellation, and cumulative no-claim bonus progression.',
          topicsCovered: ['Grace Period', 'Free-Look Period', 'No Claim Bonus']
        }
      ]
    }
  },
  {
    id: 'demo-doc-bank',
    userId: 'demo-user',
    fileName: 'Sample_Bank_Loan_Agreement_SME.pdf',
    fileType: 'sample',
    fileSize: 512000,
    documentCategory: 'Bank / Loan Agreement',
    uploadDate: '2026-08-10T16:00:00.000Z',
    pageCount: 3,
    isDemo: true,
    previewPages: [
      `APEX COMMERCIAL BANK LIMITED
SANCTION LETTER & TERM LOAN AGREEMENT
Facility: Secured MSME Equipment Term Loan | Ref: ACB-SME-TL-2026-00452
Borrower: Apex Logistics Private Limited (represented by Director Sanjay Mehta)
Sanctioned Loan Amount: ₹15,00,000 (Rupees Fifteen Lakhs Only)
Tenure: 60 Months (5 Years)
Repayment Mode: 60 Equated Monthly Installments (EMIs) of ₹31,650 each
First EMI Due Date: 1st December 2026 | Last EMI Due Date: 1st November 2031

CLAUSE 1: INTEREST RATE & BENCHMARK LINKAGE
The loan carries a floating interest rate of 9.75% per annum linked to the Bank's 3-Month External Benchmark Lending Rate (EBLR). The current rate is calculated as EBLR (6.50%) + Spread (3.25%). The Bank reserves the right to reset the spread or adjust the interest rate quarterly in tandem with Reserve Bank of India policy rate revisions. The revised rate shall be communicated via SMS or Email notification.

CLAUSE 2: PROCESSING CHARGES & UPFRONT DEDUCTIONS
A non-refundable processing fee of 1.00% of the loan amount (₹15,000) plus applicable GST (18% = ₹2,700), totaling ₹17,700, shall be deducted directly at source from the loan disbursement. In addition, stamp duty and documentation charges of ₹3,500 shall be debited to the Borrower's current account.`,

      `CLAUSE 3: REPAYMENT TERMS & LATE PAYMENT CHARGES
1. The EMI of ₹31,650 must be received by the Bank on or before the 1st of every calendar month through NACH / e-Mandate auto-debit.
2. In case of ECS / NACH return due to insufficient funds, a cheque bounce / mandate return charge of ₹650 per instance shall be charged.
3. In addition, penal interest at the rate of 24.00% per annum (2.00% per month) shall be levied on the overdue EMI amount from the due date until the actual date of realization.
4. If two consecutive EMIs remain unpaid, the entire outstanding loan balance shall immediately become due and payable, and the account shall be reported as Special Mention Account (SMA) to Credit Information Bureaus (CIBIL/Experian).

CLAUSE 4: PREPAYMENT & FORECLOSURE CONDITIONS
Prepayment or partial foreclosure is permitted only after completion of twelve (12) months from the date of first disbursement.
- Prepayment within 12 to 24 months: Foreclosure penalty of 2.00% plus GST on the principal outstanding.
- Prepayment after 24 months from floating rate borrower funds: No foreclosure charges applicable in compliance with regulatory guidelines for micro and small enterprises.`,

      `CLAUSE 5: HYPOTHECATION & SECURITY CHARGE
The entire loan facility is secured by a first and exclusive hypothecation charge over the commercial delivery vehicles and machinery purchased out of the loan proceeds. The Borrower shall maintain comprehensive insurance cover for the hypothecated assets naming Apex Commercial Bank as the sole loss payee. Proof of insurance renewal must be submitted to the Bank annually thirty (30) days prior to policy expiry.

CLAUSE 6: COVENANTS & REPORTING REQUIREMENTS
The Borrower shall submit quarterly unaudited financial statements within 45 days of the close of each financial quarter, and annual audited financial statements along with Tax Audit Reports within 180 days of the financial year close. Failure to submit statements within stipulated timelines shall attract a non-compliance charge of ₹2,000 per month.

FOR APEX COMMERCIAL BANK LIMITED:
Branch Head & Chief Relationship Manager | Bangalore Branch`
    ],
    analysis: {
      id: 'analysis-bank-1',
      documentId: 'demo-doc-bank',
      createdAt: '2026-08-10T16:01:20.000Z',
      overview: {
        title: 'Commercial Term Loan Agreement (₹15,00,000)',
        category: 'Bank / Loan Agreement',
        mainPurpose: 'SME equipment financing agreement providing ₹15,00,000 loan at 9.75% floating interest to Apex Logistics Pvt Ltd.',
        partiesMentioned: ['Apex Commercial Bank Limited (Lender)', 'Apex Logistics Private Limited (Borrower)', 'Director Sanjay Mehta'],
        effectiveDates: '1st December 2026 to 1st November 2031 (60 Months)',
        summaryEnglish: 'This is a 5-year secured term loan of ₹15,00,000 with monthly EMIs of ₹31,650 at a floating rate of 9.75%. An upfront deduction of ₹17,700 processing fee applies. Bounced EMIs incur a ₹650 fee plus 24% annual penal interest. Prepayment has a 2% penalty if done within 24 months.',
        summaryHindi: 'यह 5 साल का ₹15,00,000 का टर्म लोन है जिसमें ₹31,650 की मासिक ईएमआई और 9.75% फ्लोटिंग ब्याज दर है। बाउंस होने पर ₹650 शुल्क और 24% वार्षिक दंडात्मक ब्याज लगेगा। 24 महीने से पहले समय पूर्व बंद करने पर 2% पेनल्टी है।',
        summaryHinglish: 'Yeh ₹15 Lakh ka SME term loan hai 5 saal ke liye jisme ₹31,650 monthly EMI aur 9.75% floating interest rate hai. Cheque bounce pe ₹650 charge aur 24% annual penal interest lagta hai. 2 saal se pehle prepayment pe 2% penalty hai.',
        keyTakeaways: [
          'Monthly EMI is ₹31,650 due on the 1st of every month via NACH.',
          'Penal interest of 24% per annum (2%/month) applies on delayed EMIs.',
          'Bounced ECS / mandate returns incur a penalty of ₹650 per attempt.',
          'Vehicles purchased are hypothecated to the bank — insurance renewal proof required annually.',
          'Prepayment is locked for the first 12 months; 2% penalty applies between months 12–24.'
        ],
        complexityScore: 58,
        readingTimeMinutes: 5
      },
      keyClauses: [
        {
          id: 'bank-c1',
          title: '24% Annual Penal Interest on Overdue EMIs',
          originalQuote: 'penal interest at the rate of 24.00% per annum (2.00% per month) shall be levied on the overdue EMI amount from the due date',
          simpleExplanation: 'If you miss your EMI, the bank charges a massive 24% annual penalty on the missed amount in addition to the standard interest.',
          hindiExplanation: 'ईएमआई चूकने पर देय तिथि से वास्तविक भुगतान की तिथि तक 24% वार्षिक दंडात्मक ब्याज लगाया जाएगा।',
          hinglishExplanation: 'EMI miss karne par 24% annual penal interest lagega jab tak poora overdue clear nahi hota.',
          whyItMatters: 'Extremely expensive penalty that rapidly compounds loan debt if missed.',
          pageNumber: 2,
          sectionRef: 'Clause 3 (3)',
          category: 'liability',
          importance: 'critical'
        },
        {
          id: 'bank-c2',
          title: 'Floating Rate Benchmark Linkage & Quarterly Resets',
          originalQuote: 'floating interest rate of 9.75% per annum linked to the Bank\'s 3-Month EBLR... reserves the right to reset the spread or adjust the interest rate quarterly',
          simpleExplanation: 'Your 9.75% interest is not fixed. Whenever RBI hikes interest rates, your EMI amount or loan tenure will increase automatically.',
          hindiExplanation: 'ब्याज दर 9.75% फ्लोटिंग है और आरबीआई की नीति के अनुसार हर तिमाही में बदल सकती है।',
          hinglishExplanation: 'Yeh interest rate fixed nahi hai. RBI repo rate badhane par aapki EMI ya tenure dono badh sakti hai.',
          whyItMatters: 'You must prepare for potential hikes in monthly outflow if market rates rise.',
          pageNumber: 1,
          sectionRef: 'Clause 1',
          category: 'rights',
          importance: 'important'
        },
        {
          id: 'bank-c3',
          title: 'Immediate Acceleration upon Two Consecutive Defaults',
          originalQuote: 'If two consecutive EMIs remain unpaid, the entire outstanding loan balance shall immediately become due and payable',
          simpleExplanation: 'If you fail to pay 2 months in a row, the bank can cancel the 5-year repayment plan and demand all ₹15 Lakhs immediately, plus report you to CIBIL.',
          hindiExplanation: 'लगातार 2 ईएमआई न चुकाने पर बैंक पूरी बकाया ऋण राशि तुरंत एकमुश्त चुकाने की मांग कर सकता है।',
          hinglishExplanation: 'Agar 2 months lagatar EMI miss hui toh bank poora loan ek sath maang sakta hai aur CIBIL report kar dega.',
          whyItMatters: 'Severe risk of asset seizure and severe credit score damage.',
          pageNumber: 2,
          sectionRef: 'Clause 3 (4)',
          category: 'termination',
          importance: 'critical'
        },
        {
          id: 'bank-c4',
          title: 'Prepayment Lock-in (12 Months) & 2% Penalty',
          originalQuote: 'Prepayment or partial foreclosure is permitted only after completion of twelve (12) months... penalty of 2.00% plus GST on the principal outstanding.',
          simpleExplanation: 'You cannot pay off this loan in the first year. Between months 12 and 24, paying early costs an extra 2% penalty.',
          hindiExplanation: 'पहले 12 महीनों तक समय पूर्व भुगतान की अनुमति नहीं है। 12 से 24 महीनों के बीच 2% पेनल्टी लगेगी।',
          hinglishExplanation: 'Pehle 1 saal me loan band nahi kar sakte. 12-24 months ke beech prepayment karne par 2% charge lagega.',
          whyItMatters: 'Disincentivizes early loan payoff unless held past year 2.',
          pageNumber: 2,
          sectionRef: 'Clause 4',
          category: 'restrictions',
          importance: 'important'
        }
      ],
      fees: [
        {
          id: 'bank-f1',
          feeName: 'Monthly EMI',
          amount: '₹31,650',
          frequency: 'monthly',
          purpose: 'Fixed monthly principal + interest repayment (60 installments)',
          penaltiesOrLateFee: '₹650 return fee + 24% p.a. penal interest',
          refundConditions: 'Non-refundable debt payment',
          pageNumber: 1,
          sectionRef: 'Loan Overview',
          severity: 'critical'
        },
        {
          id: 'bank-f2',
          feeName: 'Processing Fee + GST',
          amount: '₹17,700 (1% + 18% GST)',
          frequency: 'one-time',
          purpose: 'Administrative loan appraisal and documentation fee',
          penaltiesOrLateFee: 'Deducted directly from loan disbursement',
          refundConditions: 'Non-refundable upfront charge',
          pageNumber: 1,
          sectionRef: 'Clause 2',
          severity: 'important'
        },
        {
          id: 'bank-f3',
          feeName: 'ECS / NACH Return Charge',
          amount: '₹650 per bounce',
          frequency: 'conditional',
          purpose: 'Bank penalty for auto-debit failure due to insufficient account balance',
          penaltiesOrLateFee: 'Charged each time the mandate is presented and fails',
          refundConditions: 'Non-refundable penalty',
          pageNumber: 2,
          sectionRef: 'Clause 3 (2)',
          severity: 'important'
        },
        {
          id: 'bank-f4',
          feeName: 'Penal Interest Rate',
          amount: '24% per annum (2% / month)',
          frequency: 'conditional',
          purpose: 'Penalty on delayed EMI payments',
          penaltiesOrLateFee: 'Compounds monthly until full settlement',
          refundConditions: 'Non-refundable interest charge',
          pageNumber: 2,
          sectionRef: 'Clause 3 (3)',
          severity: 'critical'
        },
        {
          id: 'bank-f5',
          feeName: 'Prepayment Penalty (Months 12–24)',
          amount: '2.00% + GST on outstanding',
          frequency: 'conditional',
          purpose: 'Foreclosure fee if closed early before 24 months',
          penaltiesOrLateFee: 'Waived after 24 months for MSME borrowers',
          refundConditions: 'Non-refundable',
          pageNumber: 2,
          sectionRef: 'Clause 4',
          severity: 'important'
        }
      ],
      deadlines: [
        {
          id: 'bank-d1',
          date: '1st of every month',
          requirement: 'Ensure sufficient funds in current account for ₹31,650 auto-debit',
          pageNumber: 2,
          sectionRef: 'Clause 3 (1)',
          isExplicit: true,
          status: 'upcoming',
          urgency: 'urgent'
        },
        {
          id: 'bank-d2',
          date: '30 days prior to insurance expiry',
          requirement: 'Submit renewed comprehensive insurance policy naming Bank as loss payee',
          pageNumber: 3,
          sectionRef: 'Clause 5',
          isExplicit: true,
          status: 'pending',
          urgency: 'medium'
        },
        {
          id: 'bank-d3',
          date: '45 days after quarter end',
          requirement: 'Submit quarterly unaudited financials to avoid ₹2,000/mo non-compliance penalty',
          pageNumber: 3,
          sectionRef: 'Clause 6',
          isExplicit: true,
          status: 'pending',
          urgency: 'medium'
        },
        {
          id: 'bank-d4',
          date: '1st November 2031',
          isoDate: '2031-11-01',
          requirement: 'Final EMI payment and loan maturity closure',
          pageNumber: 1,
          sectionRef: 'Loan Overview',
          isExplicit: true,
          status: 'pending',
          urgency: 'low'
        }
      ],
      requiredActions: [
        {
          id: 'bank-a1',
          actionText: 'Maintain minimum ₹35,000 balance in current account on the 30th of every month',
          description: 'Prevents NACH return charge of ₹650 and triggers of 24% penal interest.',
          dueDate: 'Monthly on 30th/31st',
          urgency: 'urgent',
          completed: false,
          pageNumber: 2,
          sectionRef: 'Clause 3',
          partiesInvolved: ['Borrower (Finance team)']
        },
        {
          id: 'bank-a2',
          actionText: 'Endorse Bank hypothecation in vehicle registration and insurance policy',
          description: 'Required within 30 days of vehicle purchase to prevent loan cancellation.',
          dueDate: 'Within 30 days of purchase',
          urgency: 'urgent',
          completed: false,
          pageNumber: 3,
          sectionRef: 'Clause 5',
          partiesInvolved: ['Borrower and Dealer']
        },
        {
          id: 'bank-a3',
          actionText: 'Schedule calendar reminders for quarterly financial submissions',
          description: 'Avoid ₹2,000 monthly reporting non-compliance fee stipulated in Clause 6.',
          dueDate: 'Quarterly',
          urgency: 'medium',
          completed: false,
          pageNumber: 3,
          sectionRef: 'Clause 6',
          partiesInvolved: ['Borrower Accountant']
        }
      ],
      importantConditions: [
        {
          id: 'bank-ic1',
          title: 'Compounded 24% Penalty Rate on Overdue Installments',
          condition: 'Late payment attracts 2% per month (24% per year) on top of usual floating rate.',
          potentialImpact: 'Delaying one EMI by 3 months adds substantial penalty and damages credit score.',
          recommendation: 'Prioritize this EMI above other unsecured debts.',
          severity: 'critical',
          pageNumber: 2,
          sectionRef: 'Clause 3 (3)'
        },
        {
          id: 'bank-ic2',
          title: 'Mandatory Hypothecation & Asset Insurance Lock',
          condition: 'Vehicles cannot be sold, transferred, or modified without Bank No-Objection Certificate (NOC).',
          potentialImpact: 'Restricts business flexibility to sell older machinery until loan is cleared.',
          recommendation: 'Ensure annual insurance is never allowed to lapse for even 1 day.',
          severity: 'important',
          pageNumber: 3,
          sectionRef: 'Clause 5'
        },
        {
          id: 'bank-ic3',
          title: 'Reporting Non-Compliance Fine of ₹2,000/month',
          condition: 'Failing to send quarterly balance sheets on time incurs a recurring ₹2,000 fee.',
          potentialImpact: 'Unnecessary leak of business capital for administrative oversights.',
          recommendation: 'Set up an automated notification for your company accountant every quarter.',
          severity: 'info',
          pageNumber: 3,
          sectionRef: 'Clause 6'
        }
      ],
      sourceReferences: [
        {
          pageNumber: 1,
          summarySnippet: '₹15L loan amount, 60-month tenure, 9.75% floating interest rate, and ₹17,700 upfront processing deductions.',
          topicsCovered: ['Loan Terms', 'Floating Rate EBLR', 'Processing Fee']
        },
        {
          pageNumber: 2,
          summarySnippet: '₹31,650 EMI terms, ₹650 NACH bounce fee, 24% penal rate, 2-default acceleration, and 12-month foreclosure lock-in.',
          topicsCovered: ['EMI Due Date', 'Bounce Penalties', 'Default Terms', 'Prepayment Penalty']
        },
        {
          pageNumber: 3,
          summarySnippet: 'Hypothecation of machinery, mandatory annual insurance renewal submission, and quarterly reporting compliance rules.',
          topicsCovered: ['Hypothecation', 'Insurance Covenants', 'Financial Reporting']
        }
      ]
    }
  }
];
