import { ClinicalTrial } from '../types';

// Comprehensive sample CTRI trial data with realistic medical information
export const sampleTrials: ClinicalTrial[] = [
    {
        id: 'trial-001',
        ctriNumber: 'CTRI/2024/01/012345',
        title: 'Efficacy and Safety of Novel GLP-1 Receptor Agonist in Type 2 Diabetes Mellitus: A Randomized Controlled Trial',
        briefSummary: 'This Phase III randomized, double-blind, placebo-controlled trial evaluates the efficacy and safety of a novel GLP-1 receptor agonist in Indian patients with Type 2 diabetes mellitus inadequately controlled on metformin monotherapy.',
        detailedDescription: 'Type 2 diabetes mellitus affects over 77 million Indians, making it a critical public health concern. This study aims to evaluate a novel once-weekly GLP-1 receptor agonist that has shown promising results in international trials. The primary endpoint is HbA1c reduction from baseline at 26 weeks. Secondary endpoints include weight loss, time in range (glucose 70-180 mg/dL), and safety parameters including hypoglycemia rates and gastrointestinal adverse events.',
        phase: 'III',
        studyType: 'Interventional',
        recruitmentStatus: 'recruiting',
        condition: 'Type 2 Diabetes Mellitus',
        intervention: 'GLP-1 Receptor Agonist vs Placebo',
        inclusionCriteria: [
            'Adults aged 18-75 years',
            'Diagnosed with Type 2 diabetes for ≥6 months',
            'HbA1c 7.0-10.5% on stable metformin therapy',
            'BMI 23-40 kg/m²',
            'Signed informed consent'
        ],
        exclusionCriteria: [
            'Type 1 diabetes or MODY',
            'History of diabetic ketoacidosis',
            'Severe renal impairment (eGFR <30 mL/min/1.73m²)',
            'Active malignancy',
            'Pregnancy or breastfeeding'
        ],
        primarySponsor: 'All Institute of Medical Sciences (AIIMS), New Delhi',
        principalInvestigator: 'Dr. Rajesh Kumar Sharma, MD (Endocrinology)',
        locations: [
            {
                hospital: 'AIIMS New Delhi',
                city: 'Delhi',
                state: 'Delhi',
                country: 'India',
                coordinates: { lat: 28.5672, lng: 77.2100 }
            },
            {
                hospital: 'King George Medical University',
                city: 'Lucknow',
                state: 'Uttar Pradesh',
                country: 'India',
                coordinates: { lat: 26.8467, lng: 80.9462 }
            },
            {
                hospital: 'Postgraduate Institute of Medical Education and Research',
                city: 'Chandigarh',
                state: 'Chandigarh',
                country: 'India',
                coordinates: { lat: 30.7333, lng: 76.7794 }
            }
        ],
        contactInfo: {
            name: 'Dr. Priya Mehta',
            email: 'priya.mehta@aiims.edu',
            phone: '+91-11-26588500'
        },
        startDate: new Date('2024-02-15'),
        completionDate: new Date('2025-08-15'),
        lastUpdated: new Date('2024-12-01')
    },
    {
        id: 'trial-002',
        ctriNumber: 'CTRI/2024/02/023456',
        title: 'Immunotherapy Combination Trial for Advanced Non-Small Cell Lung Cancer: PD-1 Inhibitor Plus Chemotherapy',
        briefSummary: 'Phase II open-label trial investigating the combination of PD-1 inhibitor with platinum-based chemotherapy as first-line treatment for advanced non-small cell lung cancer in Indian patients.',
        detailedDescription: 'Lung cancer is the leading cause of cancer-related deaths in India, with non-small cell lung cancer (NSCLC) accounting for 85% of cases. This study evaluates the efficacy of combining a PD-1 checkpoint inhibitor with standard platinum-doublet chemotherapy in treatment-naïve patients with advanced NSCLC. The trial aims to improve overall survival and progression-free survival compared to historical controls.',
        phase: 'II',
        studyType: 'Interventional',
        recruitmentStatus: 'recruiting',
        condition: 'Non-Small Cell Lung Cancer',
        intervention: 'PD-1 Inhibitor + Carboplatin/Paclitaxel',
        inclusionCriteria: [
            'Histologically confirmed NSCLC, Stage IIIB/IV',
            'Age 18-75 years',
            'ECOG Performance Status 0-1',
            'Adequate organ function',
            'No prior systemic therapy for advanced disease'
        ],
        exclusionCriteria: [
            'Active autoimmune disease',
            'Prior immunotherapy',
            'Active CNS metastases',
            'Severe cardiovascular disease',
            'Active infection requiring systemic therapy'
        ],
        primarySponsor: 'Tata Memorial Centre, Mumbai',
        principalInvestigator: 'Dr. Vanita Noronha, MD (Medical Oncology)',
        locations: [
            {
                hospital: 'Tata Memorial Hospital',
                city: 'Mumbai',
                state: 'Maharashtra',
                country: 'India',
                coordinates: { lat: 19.0760, lng: 72.8777 }
            },
            {
                hospital: 'Regional Cancer Centre',
                city: 'Thiruvananthapuram',
                state: 'Kerala',
                country: 'India',
                coordinates: { lat: 8.5241, lng: 76.9366 }
            },
            {
                hospital: 'Cancer Institute (WIA)',
                city: 'Chennai',
                state: 'Tamil Nadu',
                country: 'India',
                coordinates: { lat: 13.0827, lng: 80.2707 }
            }
        ],
        contactInfo: {
            name: 'Dr. Amit Joshi',
            email: 'amit.joshi@tmc.gov.in',
            phone: '+91-22-24177000'
        },
        startDate: new Date('2024-03-01'),
        completionDate: new Date('2026-03-01'),
        lastUpdated: new Date('2024-11-28')
    },
    {
        id: 'trial-003',
        ctriNumber: 'CTRI/2024/03/034567',
        title: 'Efficacy of Ayurvedic Formulation in Rheumatoid Arthritis: A Randomized Controlled Trial',
        briefSummary: 'Phase III randomized, double-blind, placebo-controlled trial evaluating the efficacy and safety of a standardized Ayurvedic polyherbal formulation in patients with active rheumatoid arthritis.',
        detailedDescription: 'Rheumatoid arthritis affects approximately 0.75% of the Indian population. This study investigates a traditional Ayurvedic formulation containing Boswellia serrata, Curcuma longa, and Withania somnifera, standardized for active compounds. The trial aims to demonstrate non-inferiority to methotrexate in reducing disease activity while potentially offering better tolerability.',
        phase: 'III',
        studyType: 'Interventional',
        recruitmentStatus: 'not_yet_recruiting',
        condition: 'Rheumatoid Arthritis',
        intervention: 'Ayurvedic Polyherbal Formulation vs Methotrexate',
        inclusionCriteria: [
            'Age 18-65 years',
            'ACR/EULAR 2010 criteria for RA',
            'DAS28-CRP ≥3.2',
            'Disease duration ≥6 months',
            'Stable on NSAIDs for ≥4 weeks'
        ],
        exclusionCriteria: [
            'Prior DMARD therapy',
            'Severe extra-articular manifestations',
            'Active infections',
            'Liver or kidney dysfunction',
            'Pregnancy or lactation'
        ],
        primarySponsor: 'Institute of Post Graduate Medical Education and Research, Kolkata',
        principalInvestigator: 'Dr. Alakendu Ghosh, MD (Rheumatology)',
        locations: [
            {
                hospital: 'IPGMER & SSKM Hospital',
                city: 'Kolkata',
                state: 'West Bengal',
                country: 'India',
                coordinates: { lat: 22.5726, lng: 88.3639 }
            },
            {
                hospital: 'Sanjay Gandhi Postgraduate Institute',
                city: 'Lucknow',
                state: 'Uttar Pradesh',
                country: 'India',
                coordinates: { lat: 26.8467, lng: 80.9462 }
            }
        ],
        contactInfo: {
            name: 'Dr. Sumantro Mondal',
            email: 'sumantro.mondal@ipgmer.gov.in',
            phone: '+91-33-22041000'
        },
        startDate: new Date('2024-04-01'),
        completionDate: new Date('2025-10-01'),
        lastUpdated: new Date('2024-11-25')
    },
    {
        id: 'trial-004',
        ctriNumber: 'CTRI/2024/04/045678',
        title: 'Digital Therapeutic Intervention for Depression Management: A Randomized Controlled Trial',
        briefSummary: 'Phase II randomized controlled trial evaluating the efficacy of a smartphone-based digital therapeutic intervention combined with standard care versus standard care alone in patients with moderate depression.',
        detailedDescription: 'Depression affects over 56 million Indians, with limited access to mental health services. This study evaluates a culturally adapted digital therapeutic platform that combines cognitive behavioral therapy modules, mindfulness exercises, and peer support features. The intervention is designed specifically for the Indian context, incorporating local languages and cultural elements.',
        phase: 'II',
        studyType: 'Interventional',
        recruitmentStatus: 'recruiting',
        condition: 'Major Depressive Disorder',
        intervention: 'Digital Therapeutic App + Standard Care vs Standard Care',
        inclusionCriteria: [
            'Age 18-60 years',
            'DSM-5 criteria for Major Depressive Disorder',
            'PHQ-9 score 10-19 (moderate depression)',
            'Smartphone access with internet connectivity',
            'Able to read Hindi or English'
        ],
        exclusionCriteria: [
            'Severe depression (PHQ-9 ≥20)',
            'Active suicidal ideation',
            'Bipolar disorder or psychotic disorders',
            'Substance use disorder',
            'Cognitive impairment'
        ],
        primarySponsor: 'National Institute of Mental Health and Neurosciences (NIMHANS), Bangalore',
        principalInvestigator: 'Dr. Geetha Desai, MD (Psychiatry)',
        locations: [
            {
                hospital: 'NIMHANS',
                city: 'Bangalore',
                state: 'Karnataka',
                country: 'India',
                coordinates: { lat: 12.9716, lng: 77.5946 }
            },
            {
                hospital: 'Institute of Human Behaviour and Allied Sciences',
                city: 'Delhi',
                state: 'Delhi',
                country: 'India',
                coordinates: { lat: 28.7041, lng: 77.1025 }
            },
            {
                hospital: 'Central Institute of Psychiatry',
                city: 'Ranchi',
                state: 'Jharkhand',
                country: 'India',
                coordinates: { lat: 23.3441, lng: 85.3096 }
            }
        ],
        contactInfo: {
            name: 'Dr. Naveen Kumar',
            email: 'naveen.kumar@nimhans.ac.in',
            phone: '+91-80-26995000'
        },
        startDate: new Date('2024-01-15'),
        completionDate: new Date('2025-01-15'),
        lastUpdated: new Date('2024-12-02')
    },
    {
        id: 'trial-005',
        ctriNumber: 'CTRI/2024/05/056789',
        title: 'Telemedicine-Based Hypertension Management in Rural India: A Cluster Randomized Trial',
        briefSummary: 'Phase III cluster randomized trial evaluating the effectiveness of a telemedicine-based hypertension management program versus usual care in rural primary health centers across India.',
        detailedDescription: 'Hypertension affects 28% of Indian adults, with poor control rates especially in rural areas due to limited healthcare access. This pragmatic trial tests a telemedicine intervention involving remote monitoring, medication titration by specialists, and health education delivered through primary health centers in rural communities.',
        phase: 'III',
        studyType: 'Interventional',
        recruitmentStatus: 'recruiting',
        condition: 'Hypertension',
        intervention: 'Telemedicine-based Management vs Usual Care',
        inclusionCriteria: [
            'Age ≥30 years',
            'Diagnosed hypertension (BP ≥140/90 mmHg)',
            'Residing in rural areas',
            'Access to primary health center',
            'Willing to participate for 12 months'
        ],
        exclusionCriteria: [
            'Secondary hypertension',
            'Severe cardiovascular disease',
            'Chronic kidney disease stage 4-5',
            'Pregnancy',
            'Unable to provide consent'
        ],
        primarySponsor: 'Public Health Foundation of India, Gurgaon',
        principalInvestigator: 'Dr. Dorairaj Prabhakaran, MD (Cardiology)',
        locations: [
            {
                hospital: 'Primary Health Centers - Haryana',
                city: 'Gurgaon',
                state: 'Haryana',
                country: 'India',
                coordinates: { lat: 28.4595, lng: 77.0266 }
            },
            {
                hospital: 'Primary Health Centers - Karnataka',
                city: 'Bangalore',
                state: 'Karnataka',
                country: 'India',
                coordinates: { lat: 12.9716, lng: 77.5946 }
            },
            {
                hospital: 'Primary Health Centers - Telangana',
                city: 'Hyderabad',
                state: 'Telangana',
                country: 'India',
                coordinates: { lat: 17.3850, lng: 78.4867 }
            }
        ],
        contactInfo: {
            name: 'Dr. Kavitha Rajsekar',
            email: 'kavitha.rajsekar@phfi.org',
            phone: '+91-124-4781400'
        },
        startDate: new Date('2024-06-01'),
        completionDate: new Date('2025-12-01'),
        lastUpdated: new Date('2024-11-30')
    },
    {
        id: 'trial-006',
        ctriNumber: 'CTRI/2024/06/067890',
        title: 'Novel Antibiotic Combination for Multidrug-Resistant Tuberculosis: Phase II Safety and Efficacy Trial',
        briefSummary: 'Phase II open-label trial evaluating the safety and efficacy of a novel antibiotic combination regimen for the treatment of multidrug-resistant tuberculosis in Indian patients.',
        detailedDescription: 'India accounts for 27% of global MDR-TB cases, with treatment success rates of only 50%. This study evaluates a shorter, more tolerable regimen combining bedaquiline, pretomanid, and linezolid with optimized background therapy. The primary endpoint is treatment success at 76 weeks with improved safety profile.',
        phase: 'II',
        studyType: 'Interventional',
        recruitmentStatus: 'recruiting',
        condition: 'Multidrug-Resistant Tuberculosis',
        intervention: 'Novel Antibiotic Combination Regimen',
        inclusionCriteria: [
            'Age 18-65 years',
            'Confirmed MDR-TB by GeneXpert or culture',
            'No prior exposure to bedaquiline or pretomanid',
            'HIV-negative or HIV-positive with CD4 >100',
            'Adequate organ function'
        ],
        exclusionCriteria: [
            'Extensively drug-resistant TB (XDR-TB)',
            'Severe hepatic impairment',
            'QTc prolongation >450ms',
            'Pregnancy or breastfeeding',
            'Active psychiatric illness'
        ],
        primarySponsor: 'National Institute for Research in Tuberculosis, Chennai',
        principalInvestigator: 'Dr. Soumya Swaminathan, MD (Pulmonology)',
        locations: [
            {
                hospital: 'National Institute for Research in Tuberculosis',
                city: 'Chennai',
                state: 'Tamil Nadu',
                country: 'India',
                coordinates: { lat: 13.0827, lng: 80.2707 }
            },
            {
                hospital: 'LRS Institute of Tuberculosis and Respiratory Diseases',
                city: 'Delhi',
                state: 'Delhi',
                country: 'India',
                coordinates: { lat: 28.7041, lng: 77.1025 }
            },
            {
                hospital: 'Vallabhbhai Patel Chest Institute',
                city: 'Delhi',
                state: 'Delhi',
                country: 'India',
                coordinates: { lat: 28.6692, lng: 77.2265 }
            }
        ],
        contactInfo: {
            name: 'Dr. Padmapriyadarsini Chandrasekaran',
            email: 'padmapriyadarsini@nirt.res.in',
            phone: '+91-44-28369600'
        },
        startDate: new Date('2024-07-01'),
        completionDate: new Date('2026-07-01'),
        lastUpdated: new Date('2024-11-27')
    },
    {
        id: 'trial-007',
        ctriNumber: 'CTRI/2024/07/078901',
        title: 'Stem Cell Therapy for Diabetic Foot Ulcers: A Randomized Controlled Trial',
        briefSummary: 'Phase II randomized, double-blind, placebo-controlled trial evaluating autologous mesenchymal stem cell therapy for non-healing diabetic foot ulcers in Indian patients.',
        detailedDescription: 'Diabetic foot ulcers affect 15% of diabetic patients in India, leading to significant morbidity and healthcare costs. This study investigates the regenerative potential of autologous bone marrow-derived mesenchymal stem cells in promoting wound healing when combined with standard wound care.',
        phase: 'II',
        studyType: 'Interventional',
        recruitmentStatus: 'not_yet_recruiting',
        condition: 'Diabetic Foot Ulcer',
        intervention: 'Autologous Mesenchymal Stem Cells + Standard Care vs Placebo + Standard Care',
        inclusionCriteria: [
            'Age 18-70 years',
            'Type 1 or Type 2 diabetes',
            'Non-healing foot ulcer >4 weeks duration',
            'Ulcer size 1-25 cm²',
            'Adequate vascular supply (ABI >0.7)'
        ],
        exclusionCriteria: [
            'Active infection requiring systemic antibiotics',
            'Malignancy',
            'Immunosuppressive therapy',
            'Pregnancy',
            'Severe peripheral arterial disease'
        ],
        primarySponsor: 'Christian Medical College, Vellore',
        principalInvestigator: 'Dr. Nihal Thomas, MD (Endocrinology)',
        locations: [
            {
                hospital: 'Christian Medical College',
                city: 'Vellore',
                state: 'Tamil Nadu',
                country: 'India',
                coordinates: { lat: 12.9165, lng: 79.1325 }
            },
            {
                hospital: 'Manipal Hospital',
                city: 'Bangalore',
                state: 'Karnataka',
                country: 'India',
                coordinates: { lat: 12.9716, lng: 77.5946 }
            }
        ],
        contactInfo: {
            name: 'Dr. Felix Jebasingh',
            email: 'felix.jebasingh@cmcvellore.ac.in',
            phone: '+91-416-228-2020'
        },
        startDate: new Date('2024-08-01'),
        completionDate: new Date('2026-02-01'),
        lastUpdated: new Date('2024-11-20')
    },
    {
        id: 'trial-008',
        ctriNumber: 'CTRI/2024/08/089012',
        title: 'Artificial Intelligence-Guided Personalized Cancer Treatment: A Prospective Cohort Study',
        briefSummary: 'Phase II prospective cohort study evaluating an AI-powered decision support system for personalized cancer treatment selection based on genomic profiling and clinical parameters.',
        detailedDescription: 'Cancer treatment in India often follows standard protocols without considering individual patient genomics. This study implements an AI system that analyzes tumor genomics, patient characteristics, and treatment response data to recommend personalized treatment regimens for solid tumors.',
        phase: 'II',
        studyType: 'Observational',
        recruitmentStatus: 'recruiting',
        condition: 'Solid Tumors (Multiple Types)',
        intervention: 'AI-Guided Treatment Selection vs Standard Care',
        inclusionCriteria: [
            'Age ≥18 years',
            'Histologically confirmed solid tumor',
            'Adequate tissue for genomic profiling',
            'ECOG Performance Status 0-2',
            'Life expectancy >3 months'
        ],
        exclusionCriteria: [
            'Hematological malignancies',
            'Prior genomic profiling within 6 months',
            'Inability to follow protocol',
            'Concurrent clinical trial participation',
            'Severe comorbidities'
        ],
        primarySponsor: 'Rajiv Gandhi Cancer Institute, Delhi',
        principalInvestigator: 'Dr. Vineet Talwar, MD (Medical Oncology)',
        locations: [
            {
                hospital: 'Rajiv Gandhi Cancer Institute',
                city: 'Delhi',
                state: 'Delhi',
                country: 'India',
                coordinates: { lat: 28.7041, lng: 77.1025 }
            },
            {
                hospital: 'HCG Cancer Centre',
                city: 'Bangalore',
                state: 'Karnataka',
                country: 'India',
                coordinates: { lat: 12.9716, lng: 77.5946 }
            },
            {
                hospital: 'Apollo Cancer Centre',
                city: 'Chennai',
                state: 'Tamil Nadu',
                country: 'India',
                coordinates: { lat: 13.0827, lng: 80.2707 }
            }
        ],
        contactInfo: {
            name: 'Dr. Atul Sharma',
            email: 'atul.sharma@rgcirc.org',
            phone: '+91-11-47022222'
        },
        startDate: new Date('2024-09-01'),
        completionDate: new Date('2026-09-01'),
        lastUpdated: new Date('2024-12-01')
    },
    {
        id: 'trial-009',
        ctriNumber: 'CTRI/2024/09/090123',
        title: 'Yoga and Meditation Intervention for Chronic Pain Management: A Randomized Controlled Trial',
        briefSummary: 'Phase III randomized controlled trial evaluating the efficacy of a structured yoga and meditation program versus standard physiotherapy for chronic low back pain management.',
        detailedDescription: 'Chronic low back pain affects 60% of Indian adults at some point in their lives. This study evaluates a 12-week yoga and meditation intervention based on traditional Indian practices, adapted for chronic pain management with modern evidence-based modifications.',
        phase: 'III',
        studyType: 'Interventional',
        recruitmentStatus: 'recruiting',
        condition: 'Chronic Low Back Pain',
        intervention: 'Yoga and Meditation Program vs Standard Physiotherapy',
        inclusionCriteria: [
            'Age 25-65 years',
            'Chronic low back pain >3 months',
            'Pain intensity ≥4/10 on VAS',
            'Able to perform basic physical activities',
            'Willing to attend 3 sessions/week for 12 weeks'
        ],
        exclusionCriteria: [
            'Specific spinal pathology',
            'Recent spinal surgery',
            'Severe psychiatric illness',
            'Pregnancy',
            'Regular yoga practice in past 6 months'
        ],
        primarySponsor: 'Morarji Desai National Institute of Yoga, Delhi',
        principalInvestigator: 'Dr. Ishwar Basavaraddi, MD (Physical Medicine)',
        locations: [
            {
                hospital: 'Morarji Desai National Institute of Yoga',
                city: 'Delhi',
                state: 'Delhi',
                country: 'India',
                coordinates: { lat: 28.6139, lng: 77.2090 }
            },
            {
                hospital: 'Swami Vivekananda Yoga Anusandhana Samsthana',
                city: 'Bangalore',
                state: 'Karnataka',
                country: 'India',
                coordinates: { lat: 12.9716, lng: 77.5946 }
            },
            {
                hospital: 'Kaivalyadhama Yoga Institute',
                city: 'Pune',
                state: 'Maharashtra',
                country: 'India',
                coordinates: { lat: 18.5204, lng: 73.8567 }
            }
        ],
        contactInfo: {
            name: 'Dr. Raghuram Nagarathna',
            email: 'raghuram.nagarathna@mdniy.org',
            phone: '+91-11-23387006'
        },
        startDate: new Date('2024-10-01'),
        completionDate: new Date('2025-10-01'),
        lastUpdated: new Date('2024-11-29')
    },
    {
        id: 'trial-010',
        ctriNumber: 'CTRI/2024/10/101234',
        title: 'Mobile Health Intervention for Maternal and Child Health in Rural India: A Cluster Randomized Trial',
        briefSummary: 'Phase III cluster randomized trial evaluating a mobile health platform for improving maternal and child health outcomes in rural communities through community health workers.',
        detailedDescription: 'India accounts for 17% of global maternal deaths and 21% of under-5 child deaths. This study tests a comprehensive mHealth intervention delivered through ASHA workers, including pregnancy tracking, vaccination reminders, nutrition counseling, and emergency referral systems.',
        phase: 'III',
        studyType: 'Interventional',
        recruitmentStatus: 'recruiting',
        condition: 'Maternal and Child Health',
        intervention: 'Mobile Health Platform vs Standard Care',
        inclusionCriteria: [
            'Pregnant women in rural communities',
            'Gestational age <20 weeks',
            'Planning to deliver in study area',
            'Access to mobile phone',
            'Consent to participate'
        ],
        exclusionCriteria: [
            'High-risk pregnancy requiring specialist care',
            'Multiple pregnancy',
            'Severe medical comorbidities',
            'Planning to relocate during study period',
            'Previous participation in similar studies'
        ],
        primarySponsor: 'Indian Council of Medical Research, New Delhi',
        principalInvestigator: 'Dr. Sanjay Zodpey, MD (Community Medicine)',
        locations: [
            {
                hospital: 'Rural Health Centers - Uttar Pradesh',
                city: 'Lucknow',
                state: 'Uttar Pradesh',
                country: 'India',
                coordinates: { lat: 26.8467, lng: 80.9462 }
            },
            {
                hospital: 'Rural Health Centers - Rajasthan',
                city: 'Jaipur',
                state: 'Rajasthan',
                country: 'India',
                coordinates: { lat: 26.9124, lng: 75.7873 }
            },
            {
                hospital: 'Rural Health Centers - Odisha',
                city: 'Bhubaneswar',
                state: 'Odisha',
                country: 'India',
                coordinates: { lat: 20.2961, lng: 85.8245 }
            }
        ],
        contactInfo: {
            name: 'Dr. Preet Kaur Dhillon',
            email: 'preet.dhillon@icmr.gov.in',
            phone: '+91-11-26588980'
        },
        startDate: new Date('2024-11-01'),
        completionDate: new Date('2026-11-01'),
        lastUpdated: new Date('2024-12-03')
    }
];

// Additional sample trials for comprehensive dataset
export const additionalSampleTrials: ClinicalTrial[] = [
    {
        id: 'trial-011',
        ctriNumber: 'CTRI/2024/11/112345',
        title: 'Precision Medicine Approach for Breast Cancer Treatment in Indian Women',
        briefSummary: 'Phase II trial evaluating genomic profiling-guided treatment selection for hormone receptor-positive breast cancer in Indian women.',
        detailedDescription: 'Breast cancer is the most common cancer in Indian women, with unique molecular characteristics. This study uses comprehensive genomic profiling to guide treatment decisions, potentially avoiding unnecessary chemotherapy in low-risk patients.',
        phase: 'II',
        studyType: 'Interventional',
        recruitmentStatus: 'recruiting',
        condition: 'Breast Cancer',
        intervention: 'Genomic Profiling-Guided Treatment vs Standard Care',
        inclusionCriteria: [
            'Women aged 18-70 years',
            'Hormone receptor-positive breast cancer',
            'Stage I-III disease',
            'Adequate tissue for genomic testing',
            'ECOG Performance Status 0-1'
        ],
        exclusionCriteria: [
            'Triple-negative breast cancer',
            'HER2-positive disease',
            'Metastatic disease',
            'Prior chemotherapy',
            'Pregnancy or lactation'
        ],
        primarySponsor: 'Kidwai Memorial Institute of Oncology, Bangalore',
        principalInvestigator: 'Dr. Lakshmaiah KC, MD (Medical Oncology)',
        locations: [
            {
                hospital: 'Kidwai Memorial Institute of Oncology',
                city: 'Bangalore',
                state: 'Karnataka',
                country: 'India',
                coordinates: { lat: 12.9716, lng: 77.5946 }
            },
            {
                hospital: 'Gujarat Cancer Research Institute',
                city: 'Ahmedabad',
                state: 'Gujarat',
                country: 'India',
                coordinates: { lat: 23.0225, lng: 72.5714 }
            }
        ],
        contactInfo: {
            name: 'Dr. Suresh Babu',
            email: 'suresh.babu@kidwai.kar.nic.in',
            phone: '+91-80-26560721'
        },
        startDate: new Date('2024-12-01'),
        completionDate: new Date('2026-12-01'),
        lastUpdated: new Date('2024-12-05')
    },
    {
        id: 'trial-012',
        ctriNumber: 'CTRI/2024/12/123456',
        title: 'Artificial Pancreas System for Type 1 Diabetes Management in Indian Children',
        briefSummary: 'Phase III randomized crossover trial evaluating a closed-loop insulin delivery system versus sensor-augmented pump therapy in children and adolescents with Type 1 diabetes.',
        detailedDescription: 'Type 1 diabetes management in Indian children faces unique challenges including dietary patterns and lifestyle factors. This study evaluates an AI-powered closed-loop system adapted for Indian food patterns and cultural practices.',
        phase: 'III',
        studyType: 'Interventional',
        recruitmentStatus: 'not_yet_recruiting',
        condition: 'Type 1 Diabetes Mellitus',
        intervention: 'Closed-Loop Insulin System vs Sensor-Augmented Pump',
        inclusionCriteria: [
            'Age 6-18 years',
            'Type 1 diabetes >1 year',
            'HbA1c 6.5-10.0%',
            'Using insulin pump >3 months',
            'Willing to wear continuous glucose monitor'
        ],
        exclusionCriteria: [
            'Severe hypoglycemia in past 6 months',
            'Diabetic ketoacidosis in past 3 months',
            'Significant comorbidities',
            'Pregnancy (for adolescents)',
            'Unable to comply with study procedures'
        ],
        primarySponsor: 'Diabetes Research Centre, Chennai',
        principalInvestigator: 'Dr. Vijay Viswanathan, MD (Endocrinology)',
        locations: [
            {
                hospital: 'Prof. M. Viswanathan Diabetes Research Centre',
                city: 'Chennai',
                state: 'Tamil Nadu',
                country: 'India',
                coordinates: { lat: 13.0827, lng: 80.2707 }
            },
            {
                hospital: 'Jothydev Diabetes Research Centre',
                city: 'Kochi',
                state: 'Kerala',
                country: 'India',
                coordinates: { lat: 9.9312, lng: 76.2673 }
            }
        ],
        contactInfo: {
            name: 'Dr. Sanjay Kalra',
            email: 'sanjay.kalra@drc-chennai.org',
            phone: '+91-44-24541439'
        },
        startDate: new Date('2025-01-15'),
        completionDate: new Date('2026-07-15'),
        lastUpdated: new Date('2024-12-06')
    }
];

// Combine all sample trials
export const allSampleTrials = [...sampleTrials, ...additionalSampleTrials];

// Export count for easy reference
export const TOTAL_SAMPLE_TRIALS = allSampleTrials.length;