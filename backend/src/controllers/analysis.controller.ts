import type { Request, Response } from 'express';

interface AnalysisRequest {
  enrolled: number;
  active: number;
  completed: number;
  withdrawn: number;
  adverseEvents: number;
  crfsFiled: number;
  totalPossibleCrfs: number;
  regulatoryProgress: number;
  indication: string;
  phase: string;
}

interface Insights {
  enrollmentVelocity: string;
  safetyProfile: string;
  dataQuality: string;
  regulatoryReadiness: string;
  topRecommendations: string[];
}

interface PerplexityResponse {
  choices: Array<{ message: { content: string } }>;
}

function fallback(data: AnalysisRequest): Insights {
  const completionPct = data.totalPossibleCrfs > 0 ? Math.round((data.crfsFiled / data.totalPossibleCrfs) * 100) : 0;
  const aePct = data.enrolled > 0 ? Math.round((data.adverseEvents / data.enrolled) * 100) : 0;
  return {
    enrollmentVelocity: `${data.enrolled} subjects enrolled — ${data.active} active, ${data.completed} completed, ${data.withdrawn} withdrawn. ${data.enrolled < 5 ? 'Early-stage recruitment; consider activating additional sites if behind schedule.' : 'Recruitment progressing. Monitor against projected enrollment curve.'}`,
    safetyProfile: `${data.adverseEvents} adverse events reported across ${data.enrolled} enrolled subjects (${aePct}% AE rate). ${aePct > 30 ? 'AE rate warrants DSMB review. Ensure all SAEs are expedited to the sponsor and IEC within regulatory timelines.' : 'AE rate is within expected range. Continue standard pharmacovigilance monitoring.'}`,
    dataQuality: `CRF completion at ${completionPct}% (${data.crfsFiled} of ${data.totalPossibleCrfs} possible entries). ${completionPct < 70 ? 'Data completeness below target — follow up with site coordinators on pending CRFs.' : 'Data completeness on track. Aim for >95% before database lock.'}`,
    regulatoryReadiness: `Regulatory checklist is ${data.regulatoryProgress}% complete. ${data.regulatoryProgress < 80 ? 'Critical items outstanding — prioritize CTRI registration and IEC approvals before first patient enrolment.' : data.regulatoryProgress < 100 ? 'On track. Clear remaining items and retain all approval documents in the TMF.' : 'Regulatory package complete. Maintain document control and update CTRI for any protocol amendments.'}`,
    topRecommendations: [
      'Lock the database only after ≥95% CRF completion and all outstanding queries are resolved per ICH E6(R2)',
      `Report all SAEs to the IEC within ${data.phase.includes('I') ? '7' : '15'} calendar days and to CDSCO per Schedule Y requirements`,
      `Complete remaining ${100 - data.regulatoryProgress}% of the regulatory checklist — focus on CTRI and CDSCO items before database lock`,
    ],
  };
}

export const analysisController = {
  async getInsights(req: Request, res: Response): Promise<void> {
    const data = req.body as AnalysisRequest;

    const prompt = `You are a senior clinical trial expert specializing in Indian regulatory requirements (CTRI, CDSCO, ICMR). Analyze the following trial data and return ONLY a valid JSON object — no markdown, no explanation.

Trial data:
- Indication: ${data.indication || 'Not specified'}
- Phase: ${data.phase || 'Not specified'}
- Enrolled: ${data.enrolled} subjects (Active: ${data.active}, Completed: ${data.completed}, Withdrawn: ${data.withdrawn})
- Adverse events: ${data.adverseEvents}
- CRF completion: ${data.crfsFiled} / ${data.totalPossibleCrfs} entries (${data.totalPossibleCrfs > 0 ? Math.round((data.crfsFiled / data.totalPossibleCrfs) * 100) : 0}%)
- Regulatory checklist: ${data.regulatoryProgress}% complete

Return this exact JSON:
{"enrollmentVelocity":"2 sentences on recruitment pace","safetyProfile":"2 sentences on AE rate and signals","dataQuality":"2 sentences on CRF completeness","regulatoryReadiness":"2 sentences on compliance status","topRecommendations":["recommendation 1","recommendation 2","recommendation 3"]}`;

    try {
      const resp = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env['PERPLEXITY_API_KEY'] ?? ''}`,
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
        }),
      });

      if (!resp.ok) {
        res.json({ ok: true, insights: fallback(data) });
        return;
      }

      const json = (await resp.json()) as PerplexityResponse;
      const content = json.choices[0]?.message.content ?? '';
      const match = content.match(/\{[\s\S]*\}/);
      if (!match?.[0]) {
        res.json({ ok: true, insights: fallback(data) });
        return;
      }

      const insights = JSON.parse(match[0]) as Insights;
      res.json({ ok: true, insights });
    } catch {
      res.json({ ok: true, insights: fallback(data) });
    }
  },
};
