// Sample medical conditions for autocomplete
export interface MedicalCondition {
  id: string;
  name: string;
  category: string;
  synonyms?: string[];
}

export const medicalConditions: MedicalCondition[] = [
  // Endocrine Disorders
  {
    id: 'diabetes-type-1',
    name: 'Type 1 Diabetes Mellitus',
    category: 'Endocrine Disorders',
    synonyms: ['T1DM', 'Juvenile Diabetes', 'Insulin-dependent Diabetes'],
  },
  {
    id: 'diabetes-type-2',
    name: 'Type 2 Diabetes Mellitus',
    category: 'Endocrine Disorders',
    synonyms: ['T2DM', 'Adult-onset Diabetes', 'Non-insulin-dependent Diabetes'],
  },
  {
    id: 'hypothyroidism',
    name: 'Hypothyroidism',
    category: 'Endocrine Disorders',
    synonyms: ['Underactive Thyroid', 'Thyroid Deficiency'],
  },
  {
    id: 'hyperthyroidism',
    name: 'Hyperthyroidism',
    category: 'Endocrine Disorders',
    synonyms: ['Overactive Thyroid', 'Thyrotoxicosis'],
  },

  // Cardiovascular Diseases
  {
    id: 'hypertension',
    name: 'Hypertension',
    category: 'Cardiovascular Diseases',
    synonyms: ['High Blood Pressure', 'HTN'],
  },
  {
    id: 'coronary-artery-disease',
    name: 'Coronary Artery Disease',
    category: 'Cardiovascular Diseases',
    synonyms: ['CAD', 'Ischemic Heart Disease', 'Coronary Heart Disease'],
  },
  {
    id: 'heart-failure',
    name: 'Heart Failure',
    category: 'Cardiovascular Diseases',
    synonyms: ['Congestive Heart Failure', 'CHF', 'Cardiac Failure'],
  },
  {
    id: 'atrial-fibrillation',
    name: 'Atrial Fibrillation',
    category: 'Cardiovascular Diseases',
    synonyms: ['AFib', 'AF', 'Irregular Heartbeat'],
  },

  // Oncology
  {
    id: 'breast-cancer',
    name: 'Breast Cancer',
    category: 'Oncology',
    synonyms: ['Mammary Carcinoma', 'Breast Carcinoma'],
  },
  {
    id: 'lung-cancer',
    name: 'Lung Cancer',
    category: 'Oncology',
    synonyms: ['Pulmonary Cancer', 'Bronchogenic Carcinoma'],
  },
  {
    id: 'colorectal-cancer',
    name: 'Colorectal Cancer',
    category: 'Oncology',
    synonyms: ['Colon Cancer', 'Rectal Cancer', 'Bowel Cancer'],
  },
  {
    id: 'prostate-cancer',
    name: 'Prostate Cancer',
    category: 'Oncology',
    synonyms: ['Prostatic Carcinoma'],
  },

  // Neurological Disorders
  {
    id: 'alzheimers-disease',
    name: "Alzheimer's Disease",
    category: 'Neurological Disorders',
    synonyms: ['AD', 'Dementia', 'Alzheimer Dementia'],
  },
  {
    id: 'parkinsons-disease',
    name: "Parkinson's Disease",
    category: 'Neurological Disorders',
    synonyms: ['PD', 'Parkinsonism'],
  },
  {
    id: 'epilepsy',
    name: 'Epilepsy',
    category: 'Neurological Disorders',
    synonyms: ['Seizure Disorder', 'Convulsive Disorder'],
  },
  {
    id: 'multiple-sclerosis',
    name: 'Multiple Sclerosis',
    category: 'Neurological Disorders',
    synonyms: ['MS', 'Disseminated Sclerosis'],
  },

  // Respiratory Diseases
  {
    id: 'asthma',
    name: 'Asthma',
    category: 'Respiratory Diseases',
    synonyms: ['Bronchial Asthma', 'Allergic Asthma'],
  },
  {
    id: 'copd',
    name: 'Chronic Obstructive Pulmonary Disease',
    category: 'Respiratory Diseases',
    synonyms: ['COPD', 'Chronic Bronchitis', 'Emphysema'],
  },
  {
    id: 'pneumonia',
    name: 'Pneumonia',
    category: 'Respiratory Diseases',
    synonyms: ['Lung Infection', 'Pulmonary Infection'],
  },

  // Gastrointestinal Disorders
  {
    id: 'crohns-disease',
    name: "Crohn's Disease",
    category: 'Gastrointestinal Disorders',
    synonyms: ['CD', 'Regional Enteritis', 'Inflammatory Bowel Disease'],
  },
  {
    id: 'ulcerative-colitis',
    name: 'Ulcerative Colitis',
    category: 'Gastrointestinal Disorders',
    synonyms: ['UC', 'Inflammatory Bowel Disease'],
  },
  {
    id: 'irritable-bowel-syndrome',
    name: 'Irritable Bowel Syndrome',
    category: 'Gastrointestinal Disorders',
    synonyms: ['IBS', 'Spastic Colon'],
  },

  // Rheumatology
  {
    id: 'rheumatoid-arthritis',
    name: 'Rheumatoid Arthritis',
    category: 'Rheumatology',
    synonyms: ['RA', 'Inflammatory Arthritis'],
  },
  {
    id: 'osteoarthritis',
    name: 'Osteoarthritis',
    category: 'Rheumatology',
    synonyms: ['OA', 'Degenerative Joint Disease'],
  },
  {
    id: 'lupus',
    name: 'Systemic Lupus Erythematosus',
    category: 'Rheumatology',
    synonyms: ['SLE', 'Lupus'],
  },

  // Infectious Diseases
  {
    id: 'tuberculosis',
    name: 'Tuberculosis',
    category: 'Infectious Diseases',
    synonyms: ['TB', 'Pulmonary TB', 'Mycobacterial Infection'],
  },
  {
    id: 'hepatitis-b',
    name: 'Hepatitis B',
    category: 'Infectious Diseases',
    synonyms: ['HBV', 'Viral Hepatitis B'],
  },
  {
    id: 'hepatitis-c',
    name: 'Hepatitis C',
    category: 'Infectious Diseases',
    synonyms: ['HCV', 'Viral Hepatitis C'],
  },
  {
    id: 'hiv-aids',
    name: 'HIV/AIDS',
    category: 'Infectious Diseases',
    synonyms: ['HIV', 'AIDS', 'Human Immunodeficiency Virus'],
  },

  // Mental Health
  {
    id: 'depression',
    name: 'Major Depressive Disorder',
    category: 'Mental Health',
    synonyms: ['Depression', 'MDD', 'Clinical Depression'],
  },
  {
    id: 'anxiety-disorder',
    name: 'Generalized Anxiety Disorder',
    category: 'Mental Health',
    synonyms: ['GAD', 'Anxiety', 'Anxiety Disorder'],
  },
  {
    id: 'bipolar-disorder',
    name: 'Bipolar Disorder',
    category: 'Mental Health',
    synonyms: ['Manic Depression', 'Bipolar Affective Disorder'],
  },
  {
    id: 'schizophrenia',
    name: 'Schizophrenia',
    category: 'Mental Health',
    synonyms: ['Psychotic Disorder'],
  },

  // Dermatology
  {
    id: 'psoriasis',
    name: 'Psoriasis',
    category: 'Dermatology',
    synonyms: ['Plaque Psoriasis', 'Chronic Psoriasis'],
  },
  {
    id: 'atopic-dermatitis',
    name: 'Atopic Dermatitis',
    category: 'Dermatology',
    synonyms: ['Eczema', 'Atopic Eczema'],
  },

  // Ophthalmology
  {
    id: 'diabetic-retinopathy',
    name: 'Diabetic Retinopathy',
    category: 'Ophthalmology',
    synonyms: ['DR', 'Diabetic Eye Disease'],
  },
  {
    id: 'glaucoma',
    name: 'Glaucoma',
    category: 'Ophthalmology',
    synonyms: ['Primary Open-Angle Glaucoma', 'POAG'],
  },

  // Nephrology
  {
    id: 'chronic-kidney-disease',
    name: 'Chronic Kidney Disease',
    category: 'Nephrology',
    synonyms: ['CKD', 'Chronic Renal Failure'],
  },
  {
    id: 'diabetic-nephropathy',
    name: 'Diabetic Nephropathy',
    category: 'Nephrology',
    synonyms: ['Diabetic Kidney Disease', 'DKD'],
  },

  // Hematology
  {
    id: 'anemia',
    name: 'Iron Deficiency Anemia',
    category: 'Hematology',
    synonyms: ['IDA', 'Anemia'],
  },
  {
    id: 'thalassemia',
    name: 'Thalassemia',
    category: 'Hematology',
    synonyms: ['Beta Thalassemia', 'Mediterranean Anemia'],
  },

  // Pediatrics
  {
    id: 'childhood-obesity',
    name: 'Childhood Obesity',
    category: 'Pediatrics',
    synonyms: ['Pediatric Obesity', 'Overweight Children'],
  },
  {
    id: 'autism-spectrum-disorder',
    name: 'Autism Spectrum Disorder',
    category: 'Pediatrics',
    synonyms: ['ASD', 'Autism'],
  },
];

// Indian cities for location filtering
export const indianCities = [
  'Mumbai, Maharashtra',
  'Delhi, Delhi',
  'Bangalore, Karnataka',
  'Hyderabad, Telangana',
  'Chennai, Tamil Nadu',
  'Kolkata, West Bengal',
  'Pune, Maharashtra',
  'Ahmedabad, Gujarat',
  'Jaipur, Rajasthan',
  'Surat, Gujarat',
  'Lucknow, Uttar Pradesh',
  'Kanpur, Uttar Pradesh',
  'Nagpur, Maharashtra',
  'Indore, Madhya Pradesh',
  'Thane, Maharashtra',
  'Bhopal, Madhya Pradesh',
  'Visakhapatnam, Andhra Pradesh',
  'Pimpri-Chinchwad, Maharashtra',
  'Patna, Bihar',
  'Vadodara, Gujarat',
  'Ghaziabad, Uttar Pradesh',
  'Ludhiana, Punjab',
  'Agra, Uttar Pradesh',
  'Nashik, Maharashtra',
  'Faridabad, Haryana',
  'Meerut, Uttar Pradesh',
  'Rajkot, Gujarat',
  'Kalyan-Dombivali, Maharashtra',
  'Vasai-Virar, Maharashtra',
  'Varanasi, Uttar Pradesh',
  'Srinagar, Jammu and Kashmir',
  'Aurangabad, Maharashtra',
  'Dhanbad, Jharkhand',
  'Amritsar, Punjab',
  'Navi Mumbai, Maharashtra',
  'Allahabad, Uttar Pradesh',
  'Ranchi, Jharkhand',
  'Howrah, West Bengal',
  'Coimbatore, Tamil Nadu',
  'Jabalpur, Madhya Pradesh',
  'Gwalior, Madhya Pradesh',
  'Vijayawada, Andhra Pradesh',
  'Jodhpur, Rajasthan',
  'Madurai, Tamil Nadu',
  'Raipur, Chhattisgarh',
  'Kota, Rajasthan',
  'Chandigarh, Chandigarh',
  'Guwahati, Assam',
  'Solapur, Maharashtra',
  'Hubli-Dharwad, Karnataka',
  'Tiruchirappalli, Tamil Nadu',
  'Bareilly, Uttar Pradesh',
  'Mysore, Karnataka',
  'Tiruppur, Tamil Nadu',
  'Gurgaon, Haryana',
  'Aligarh, Uttar Pradesh',
  'Jalandhar, Punjab',
  'Bhubaneswar, Odisha',
  'Salem, Tamil Nadu',
  'Warangal, Telangana',
  'Guntur, Andhra Pradesh',
  'Bhiwandi, Maharashtra',
  'Saharanpur, Uttar Pradesh',
  'Gorakhpur, Uttar Pradesh',
  'Bikaner, Rajasthan',
  'Amravati, Maharashtra',
  'Noida, Uttar Pradesh',
  'Jamshedpur, Jharkhand',
  'Bhilai, Chhattisgarh',
  'Cuttack, Odisha',
  'Firozabad, Uttar Pradesh',
  'Kochi, Kerala',
  'Nellore, Andhra Pradesh',
  'Bhavnagar, Gujarat',
  'Dehradun, Uttarakhand',
  'Durgapur, West Bengal',
  'Asansol, West Bengal',
  'Rourkela, Odisha',
  'Nanded, Maharashtra',
  'Kolhapur, Maharashtra',
  'Ajmer, Rajasthan',
  'Akola, Maharashtra',
  'Gulbarga, Karnataka',
  'Jamnagar, Gujarat',
  'Ujjain, Madhya Pradesh',
  'Loni, Uttar Pradesh',
  'Siliguri, West Bengal',
  'Jhansi, Uttar Pradesh',
  'Ulhasnagar, Maharashtra',
  'Jammu, Jammu and Kashmir',
  'Sangli-Miraj & Kupwad, Maharashtra',
  'Mangalore, Karnataka',
  'Erode, Tamil Nadu',
  'Belgaum, Karnataka',
  'Ambattur, Tamil Nadu',
  'Tirunelveli, Tamil Nadu',
  'Malegaon, Maharashtra',
  'Gaya, Bihar',
  'Jalgaon, Maharashtra',
  'Udaipur, Rajasthan',
  'Maheshtala, West Bengal',
];

// Trial phases
export const trialPhases = [
  { value: 'I', label: 'Phase I', description: 'Safety and dosage' },
  { value: 'II', label: 'Phase II', description: 'Efficacy and side effects' },
  { value: 'III', label: 'Phase III', description: 'Large-scale testing' },
  { value: 'IV', label: 'Phase IV', description: 'Post-market surveillance' },
];

// Recruitment statuses
export const recruitmentStatuses = [
  { value: 'recruiting', label: 'Recruiting', description: 'Currently enrolling participants' },
  { value: 'not_yet_recruiting', label: 'Not Yet Recruiting', description: 'Will start recruiting soon' },
  { value: 'completed', label: 'Completed', description: 'Study has finished' },
  { value: 'suspended', label: 'Suspended', description: 'Temporarily halted' },
];

// Gender options
export const genderOptions = [
  { value: 'all', label: 'All Genders' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];