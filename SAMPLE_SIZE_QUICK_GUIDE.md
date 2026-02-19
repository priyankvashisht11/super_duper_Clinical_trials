# Sample Size Calculator - Quick User Guide

## 🚀 Getting Started

### Step 1: Navigate to Statistical Considerations
1. Open your protocol
2. Go to **Section 10: Statistical Considerations**
3. You'll see the **AI Sample Size Calculator** at the top

### Step 2: Start the Conversation
The AI will greet you and show what it already knows about your study:
- Your indication
- Trial phase
- Study design
- Number of arms

### Step 3: Answer the Questions

The AI will ask you 4-5 simple questions:

#### Question 1: Endpoint Type
**"Is your primary endpoint continuous or binary?"**

Examples:
- **Binary**: Response rate, mortality, cure rate, event occurrence
- **Continuous**: Blood pressure change, weight loss, pain score change

#### Question 2: Effect Size
**"What difference do you expect to see?"**

Examples:
- **Binary**: "Control 30%, Treatment 50%" or "20% absolute difference"
- **Continuous**: "10 mmHg reduction" or "5-point improvement on scale"

#### Question 3: Statistical Parameters
**"What power and significance level?"**

Common answers:
- "80% power, 0.05 alpha" (most common)
- "90% power, 0.05 alpha" (more conservative)
- "80% power, 0.01 alpha" (stricter significance)

#### Question 4: Dropout Rate
**"What percentage might drop out?"**

Typical ranges:
- Phase I: 5-10%
- Phase II: 10-20%
- Phase III: 15-25%

### Step 4: Review the Calculation

The AI will show you:

```
┌─────────────────────────────────────┐
│  Total Sample Size: 176             │
│  Per Arm: 88                        │
│  Dropout Rate: 15%                  │
└─────────────────────────────────────┘

Justification:
Sample size calculated using two-proportion 
formula for binary endpoint. With 80% power 
to detect a difference from 30% to 50% at 
α=0.05 (two-sided), we need 76 participants 
per arm. Accounting for 15% dropout rate, 
total sample size is 176 (88 per arm).

Power Analysis:
This study is powered at 80% to detect a 
20% absolute difference in response rates 
with 0.05 significance level...
```

### Step 5: Apply or Recalculate

**Option A: Apply to Protocol**
- Click **"Apply to Protocol"** (green button)
- All fields auto-fill
- Protocol auto-saves
- Done! ✅

**Option B: Try Different Parameters**
- Click **"Recalculate"**
- Answer questions differently
- Compare results

## 💡 Pro Tips

### Tip 1: Be Specific
❌ "I want to see improvement"
✅ "I expect 10 mmHg reduction in systolic BP"

### Tip 2: Use Standard Values
Most trials use:
- **Power**: 80% or 90%
- **Alpha**: 0.05 (two-sided)
- **Dropout**: 15-20%

### Tip 3: Consider Your Phase
- **Phase I**: Smaller samples (20-80)
- **Phase II**: Medium samples (50-200)
- **Phase III**: Larger samples (100-1000+)

### Tip 4: Know Your Endpoint
**Binary Examples:**
- "Response rate: control 40%, treatment 60%"
- "Mortality: control 20%, treatment 10%"
- "Cure rate: control 50%, treatment 70%"

**Continuous Examples:**
- "HbA1c reduction: 1.0% with SD 1.5%"
- "Weight loss: 5 kg with SD 8 kg"
- "Pain score: 2-point reduction with SD 3"

### Tip 5: Justify Your Assumptions
The AI will ask where your numbers come from:
- Literature review
- Pilot study
- Clinical experience
- Regulatory guidance

## 📊 Common Scenarios

### Scenario 1: Phase II Oncology Trial
```
Endpoint: Binary (response rate)
Control: 20% (standard of care)
Treatment: 40% (expected with new drug)
Power: 80%
Alpha: 0.05
Dropout: 20%

Result: ~100 patients total (50 per arm)
```

### Scenario 2: Phase III Diabetes Trial
```
Endpoint: Continuous (HbA1c change)
Difference: 0.8% reduction
SD: 1.2%
Power: 90%
Alpha: 0.05
Dropout: 15%

Result: ~120 patients total (60 per arm)
```

### Scenario 3: Phase II Hypertension Trial
```
Endpoint: Continuous (SBP change)
Difference: 10 mmHg
SD: 15 mmHg
Power: 80%
Alpha: 0.05
Dropout: 15%

Result: ~80 patients total (40 per arm)
```

## 🔧 Troubleshooting

### Problem: AI asks for more information
**Solution**: Provide specific numbers
- Not: "Some improvement"
- Yes: "15% improvement"

### Problem: Sample size seems too large
**Possible causes**:
- Effect size too small
- Standard deviation too large
- Power too high (90% vs 80%)
- Dropout rate too high

**Solution**: Review your assumptions or click "Recalculate"

### Problem: Sample size seems too small
**Possible causes**:
- Effect size too large
- Power too low
- Alpha too lenient

**Solution**: Verify your effect size is realistic

### Problem: Want to start over
**Solution**: Click "Start Over" button at bottom

## 📚 Understanding the Results

### Total Sample Size
The total number of participants you need to enroll across all arms.

### Per Arm
How many participants in each treatment group.

### Dropout Rate
Percentage expected to discontinue before completing the study.

### Justification
Detailed explanation of the calculation, including:
- Formula used
- Key parameters
- Assumptions made
- Adjustment for dropout

### Power Analysis
Explanation of what the study can detect:
- Statistical power (probability of detecting true effect)
- Significance level (probability of false positive)
- Effect size (magnitude of difference)

## 🎯 Best Practices

### 1. Start with Literature
Look at similar published trials:
- What effect sizes did they see?
- What was their sample size?
- What dropout rates occurred?

### 2. Be Conservative
- Use realistic (not optimistic) effect sizes
- Account for adequate dropout
- Consider using 90% power for pivotal trials

### 3. Consult Your Statistician
The AI provides a good starting point, but:
- Complex designs need expert review
- Regulatory submissions need statistician sign-off
- Adaptive designs require specialized calculations

### 4. Document Everything
The AI automatically generates:
- Justification text
- Power analysis description
- Key assumptions

Save these for your protocol and regulatory submissions!

### 5. Sensitivity Analysis
Try different scenarios:
- What if dropout is higher?
- What if effect size is smaller?
- What if we need 90% power?

## 🆘 Need Help?

### In-App Support
- Hover over any field for tooltips
- Click the help icon for detailed guidance
- Use the chat feature for questions

### Statistical Consultation
For complex scenarios, consult:
- Your biostatistician
- Clinical trial consultant
- Regulatory affairs team

### Additional Resources
- FDA Statistical Guidance (ICH E9)
- Sample size calculation textbooks
- Online calculators for validation

## ✅ Checklist Before Finalizing

- [ ] Endpoint type clearly defined
- [ ] Effect size based on evidence
- [ ] Power and alpha justified
- [ ] Dropout rate realistic for phase
- [ ] Sample size feasible for recruitment
- [ ] Justification documented
- [ ] Statistician reviewed (if required)
- [ ] Applied to protocol
- [ ] Section validated

---

**Remember**: The AI Sample Size Calculator is a powerful tool, but it's designed to assist, not replace, statistical expertise. For pivotal trials and regulatory submissions, always have a qualified biostatistician review your calculations.

**Questions?** Contact your study statistician or use the in-app help feature.
