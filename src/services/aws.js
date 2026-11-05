// AWS integration point for SOS reports.
//
// If VITE_AWS_SOS_ENDPOINT is set, the report is POSTed to API Gateway, where a
// Lambda can store it in DynamoDB and fan it out with Amazon SNS (SMS / push).
// Without it, the app runs in offline demo mode and just returns a fake ID.

const ENDPOINT = import.meta.env.VITE_AWS_SOS_ENDPOINT;

export async function sendSOS(report) {
  if (ENDPOINT) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report }),
      });
      if (res.ok) {
        const data = await res.json();
        return { ok: true, id: data.id || report.id, mode: 'aws' };
      }
    } catch {
      /* fall back to offline mode below */
    }
  }
  await new Promise((r) => setTimeout(r, 600));
  return { ok: true, id: report.id, mode: 'offline-demo' };
}
