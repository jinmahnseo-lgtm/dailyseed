interface Env {
  RESEND_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const data = await context.request.json() as {
      studentName: string;
      parentEmail: string;
      date: string;
      keyword: string;
      missions: { key: string; label: string; answer: string | null }[];
    };

    const { studentName, parentEmail, date, keyword, missions } = data;
    const adminEmail = "dailyseed.com@gmail.com";

    // Build HTML email
    let html = `<div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#333;">`;
    html += `<div style="background:linear-gradient(135deg,#f0fdf4,#fef9c3);padding:24px;border-radius:16px;text-align:center;margin-bottom:16px;">`;
    html += `<h1 style="font-size:28px;margin:0;">🌱 DailySeed</h1>`;
    html += `<p style="margin:8px 0 0;color:#666;">매일의 씨앗 — 미션 리포트</p>`;
    html += `</div>`;

    html += `<div style="background:#fff;padding:20px;border-radius:16px;border:1px solid #e5e7eb;margin-bottom:16px;">`;
    html += `<table style="width:100%;border-collapse:collapse;">`;
    html += `<tr><td style="padding:8px 0;color:#888;width:80px;">학생</td><td style="padding:8px 0;font-weight:bold;">${studentName}</td></tr>`;
    html += `<tr><td style="padding:8px 0;color:#888;">날짜</td><td style="padding:8px 0;">${date}</td></tr>`;
    html += `<tr><td style="padding:8px 0;color:#888;">키워드</td><td style="padding:8px 0;font-weight:bold;font-size:20px;">${keyword}</td></tr>`;
    html += `</table></div>`;

    html += `<div style="background:#fff;padding:20px;border-radius:16px;border:1px solid #e5e7eb;margin-bottom:16px;">`;
    html += `<h2 style="font-size:16px;margin:0 0 16px;color:#d97706;">✅ 미션 완수!</h2>`;

    for (const m of missions) {
      html += `<div style="padding:12px;background:#f9fafb;border-radius:12px;margin-bottom:8px;">`;
      html += `<p style="margin:0;font-weight:600;font-size:14px;">${m.label}</p>`;
      if (m.answer) {
        html += `<p style="margin:4px 0 0;font-size:13px;color:#555;">${m.answer}</p>`;
      }
      html += `</div>`;
    }

    html += `</div>`;
    html += `<p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">이 메일은 DailySeed 앱에서 자동 발송되었습니다.</p>`;
    html += `</div>`;

    const subject = `🌱 DailySeed — ${studentName}의 ${date} 미션 리포트`;

    // Send to parent
    const recipients = [parentEmail];
    if (adminEmail && adminEmail !== parentEmail) {
      recipients.push(adminEmail);
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "DailySeed <noreply@dailyseed.net>",
        to: [parentEmail],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ success: false, error: err }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

// Handle CORS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
