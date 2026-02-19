# AI Sample Size Agent - Revolutionary Conversational Approach

## Overview

The AI Sample Size Agent represents a paradigm shift in how clinical trial protocols handle sample size calculations. Instead of presenting users with multiple empty fields and expecting them to know complex statistical formulas, we've created an intelligent conversational agent that:

1. **Asks intelligent questions** based on study design
2. **Guides users** through the calculation process
3. **Performs calculations** using validated statistical formulas
4. **Auto-fills fields** based on conversation analysis
5. **Allows regeneration** and editing of results

## Why This Approach?

### Traditional Problems:
- ❌ Empty fields with no guidance
- ❌ Users don't know statistical formulas
- ❌ Requires external calculators
- ❌ Error-prone manual entry
- ❌ No context-aware assistance

### Our Solution:
- ✅ Conversational interface
- ✅ AI guides the process
- ✅ Built-in statistical calculations
- ✅ Auto-fills all fields
- ✅ Context-aware from protocol data
- ✅ Educational and transparent

## Features

### 1. Intelligent Conversation Flow

The agent follows a structured conversation:

```
1. Greet user with protocol context
2. Ask about endpoint type (continuous/binary)
3. Ask about effect size expectations
4. Ask about statistical parameters (power, alpha)
5. Ask about dropout expectations
6. Calculate and present results
7. Allow user to apply or recalculate
```

### 2. Statistical Formulas

#### Binary Endpoints (Two Proportions)
```
n_per_arm = [(Zα/2 + Zβ)² × (p1(1-p1) + p2(1-p2))] / (p1 - p2)²

Where:
- Zα/2 = 1.96 for α=0.05 (two-sided)
- Zβ = 0.84 for 80% power, 1.28 for 90% power
- p1 = control group proportion
- p2 = treatment group proportion
```

#### Continuous Endpoints (Two Means)
```
n_per_arm = 2 × [(Zα/2 + Zβ)² × σ²] / δ²

Where:
- σ = standard deviation
- δ = expected mean difference
```

#### Dropout Adjustment
```
n_adjusted = n / (1 - dropout_rate)
Total = n_adjusted × number_of_arms
```

### 3. Context-Aware Intelligence

The agent automatically knows:
- Study indication
- Trial phase
- Study design type
- Number of arms
- Control type
- Blinding level

This allows it to ask relevant questions and make appropriate assumptions.

### 4. Real-Time Calculation

Once the agent has sufficient information:
1. Performs calculation using validated formulas
2. Presents results in clear cards
3. Shows justification and assumptions
4. Displays power analysis explanation
5. Allows one-click application to protocol

### 5. User-Friendly Interface

**Conversation Area:**
- Chat-like interface
- User messages on right (blue)
- AI messages on left (white)
- Real-time typing indicators
- Smooth animations

**Result Display:**
- Large, clear numbers
- Total sample size
- Per-arm breakdown
- Dropout rate percentage
- Detailed justification
- Power analysis explanation

**Action Buttons:**
- Apply to Protocol (green)
- Recalculate (outline)
- Start Over (text button)

## Usage Example

### User Journey:

1. **User opens Statistical Considerations section**
   - Sees AI Sample Size Agent at top
   - Agent greets with protocol context

2. **Agent asks: "Is your primary endpoint continuous or binary?"**
   - User responds: "Binary - it's response rate"

3. **Agent asks: "What response rates do you expect?"**
   - User responds: "Control group 30%, treatment 50%"

4. **Agent asks: "What power and significance level?"**
   - User responds: "Standard - 80% power, 0.05 alpha"

5. **Agent asks: "Expected dropout rate?"**
   - User responds: "About 15%"

6. **Agent calculates and presents:**
   ```
   Total Sample Size: 176
   Per Arm: 88
   Dropout Rate: 15%
   
   Justification: Sample size calculated using two-proportion formula...
   Power Analysis: This study is powered at 80% to detect...
   ```

7. **User clicks "Apply to Protocol"**
   - All fields auto-filled
   - Protocol auto-saved
   - Validation triggered

## Technical Implementation

### Component Structure

```typescript
AISampleSizeAgent
├── Conversation State Management
├── Message History
├── AI Service Integration
├── Statistical Calculations
├── Result Parsing
└── Protocol Integration
```

### Key Functions

**initiateConversation()**
- Starts the conversation
- Presents protocol context
- Asks first question

**handleSendMessage()**
- Sends user message
- Calls AI service
- Parses response
- Updates conversation

**parseCalculation()**
- Extracts calculation results
- Parses justification
- Extracts assumptions
- Determines confidence level

**handleApplyCalculation()**
- Updates protocol fields
- Triggers auto-save
- Validates section

### AI Prompt Engineering

The agent uses sophisticated prompts that:
- Provide statistical formulas
- Give calculation examples
- Request structured responses
- Include educational context
- Handle edge cases

## Integration Points

### 1. Statistical Considerations Editor
```typescript
<AISampleSizeAgent
  protocolContext={protocolWithDesignData}
  onApplyCalculation={handleApplyCalculation}
  initialData={statsData}
/>
```

### 2. Protocol Context
- Pulls data from metadata section
- Pulls data from trial design section
- Combines for comprehensive context

### 3. Auto-Save Integration
- Applies calculation results
- Triggers save automatically
- Validates section after save

## Benefits

### For Users:
1. **No statistical expertise required**
2. **Guided step-by-step process**
3. **Educational experience**
4. **Transparent calculations**
5. **One-click application**
6. **Ability to regenerate**

### For Product:
1. **Unique differentiator**
2. **Reduces user friction**
3. **Increases completion rates**
4. **Improves data quality**
5. **Reduces support burden**
6. **Enhances user satisfaction**

### For Compliance:
1. **Validated formulas**
2. **Documented assumptions**
3. **Audit trail in conversation**
4. **Justification auto-generated**
5. **Regulatory-compliant**

## Future Enhancements

### Phase 2:
- [ ] Support for survival analysis endpoints
- [ ] Non-inferiority/equivalence designs
- [ ] Cluster randomized trials
- [ ] Adaptive designs
- [ ] Bayesian approaches

### Phase 3:
- [ ] Integration with literature search
- [ ] Automatic effect size estimation from similar trials
- [ ] Monte Carlo simulations
- [ ] Interactive power curves
- [ ] Sensitivity analysis automation

### Phase 4:
- [ ] Multi-language support
- [ ] Voice interface
- [ ] Mobile optimization
- [ ] Collaborative calculations
- [ ] Version history

## Statistical References

### Key Resources:
1. **Chow, S.C., Shao, J., Wang, H., & Lokhnygina, Y. (2017)**
   - Sample Size Calculations in Clinical Research (3rd ed.)

2. **Julious, S.A. (2010)**
   - Sample Sizes for Clinical Trials

3. **FDA Guidance Documents**
   - Statistical Principles for Clinical Trials (ICH E9)

4. **Online Calculators (for validation)**
   - ClinCalc.com
   - Sealed Envelope
   - PS Power and Sample Size

## Testing & Validation

### Test Cases:

1. **Binary Endpoint - Superiority**
   - Control: 30%, Treatment: 50%
   - Power: 80%, Alpha: 0.05
   - Expected: ~88 per arm

2. **Continuous Endpoint - Superiority**
   - Mean difference: 10 mmHg
   - SD: 20 mmHg
   - Power: 90%, Alpha: 0.05
   - Expected: ~86 per arm

3. **Non-Inferiority**
   - Margin: 10%
   - Power: 80%, Alpha: 0.025 (one-sided)
   - Expected: Larger sample size

### Validation Process:
1. Compare with established calculators
2. Verify formulas with biostatistician
3. Test edge cases
4. Validate rounding logic
5. Check dropout adjustments

## Conclusion

The AI Sample Size Agent transforms a complex, error-prone process into an intuitive conversation. By combining:
- Conversational AI
- Statistical expertise
- Context awareness
- Auto-filling capabilities
- Educational transparency

We've created a feature that not only solves a major pain point but also differentiates our product in the market.

This is the future of clinical trial protocol development - intelligent, conversational, and user-centric.

---

**Status**: ✅ Implemented
**Version**: 1.0
**Last Updated**: 2026-02-14
**Author**: AI Development Team
