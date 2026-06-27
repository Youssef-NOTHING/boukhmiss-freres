import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const d = req.body;

  if (!d.prenom || !d.nom) {
    return res.status(422).json({ success: false, message: 'Prénom et nom obligatoires' });
  }

  const s = (v) => String(v ?? '—').replace(/[<>]/g, '');

  try {
    await resend.emails.send({
      from    : 'BOUKHMISS FRERES Site Web <onboarding@resend.dev>',
      to      : ['youssefboukhmiss44@gmail.com'],
      subject : `✉️ Nouveau message — ${s(d.prenom)} ${s(d.nom)}`,
      html    : `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/></head>
<body style="font-family:Arial,sans-serif;color:#1A1A1A;background:#F9F9F9;margin:0;padding:0;">
  <div style="max-width:600px;margin:32px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#1A1A1A;padding:28px 32px;display:flex;align-items:center;gap:14px;">
      <div style="width:44px;height:44px;background:#B8922A;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:white;font-family:Georgia,serif;">B</div>
      <div>
        <div style="color:white;font-size:16px;font-weight:700;letter-spacing:0.3px;">BOUKHMISS FRERES SARL</div>
        <div style="color:#B8922A;font-size:12px;margin-top:2px;">Nouveau message depuis le formulaire de contact</div>
      </div>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <h2 style="font-size:18px;color:#B8922A;margin:0 0 20px;">👤 Informations du contact</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
        <tr style="background:#F9F3E7;">
          <td style="padding:10px 14px;border:1px solid #E8E0D0;font-size:13px;font-weight:600;width:40%;color:#5A5A5A;">Nom complet</td>
          <td style="padding:10px 14px;border:1px solid #E8E0D0;font-size:14px;font-weight:700;color:#1A1A1A;">${s(d.prenom)} ${s(d.nom)}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;border:1px solid #E8E0D0;font-size:13px;color:#5A5A5A;">Téléphone</td>
          <td style="padding:10px 14px;border:1px solid #E8E0D0;font-size:14px;font-weight:700;color:#B8922A;">
            <a href="tel:${s(d.tel)}" style="color:#B8922A;text-decoration:none;">${s(d.tel) || '—'}</a>
          </td>
        </tr>
        <tr style="background:#F9F3E7;">
          <td style="padding:10px 14px;border:1px solid #E8E0D0;font-size:13px;color:#5A5A5A;">Service souhaité</td>
          <td style="padding:10px 14px;border:1px solid #E8E0D0;font-size:13px;color:#1A1A1A;">${s(d.service) || '—'}</td>
        </tr>
      </table>

      <h2 style="font-size:18px;color:#B8922A;margin:0 0 16px;">💬 Message</h2>
      <div style="background:#F9F3E7;border:1px solid #E8E0D0;border-radius:10px;padding:18px 20px;font-size:14px;color:#1A1A1A;line-height:1.7;margin-bottom:28px;white-space:pre-wrap;">${s(d.message) || '(aucun message)'}</div>

      <!-- CTA -->
      <div style="background:#F9F3E7;border:1px solid rgba(184,146,42,0.3);border-radius:10px;padding:18px 20px;text-align:center;">
        <div style="font-size:13px;color:#5A5A5A;margin-bottom:10px;">Répondez à ce client rapidement</div>
        ${d.tel ? `<a href="tel:${s(d.tel)}" style="display:inline-block;background:#B8922A;color:white;padding:10px 28px;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none;margin:4px;">📞 Appeler</a>` : ''}
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#F4F4F4;padding:18px 32px;border-top:1px solid #E8E0D0;font-size:11px;color:#999;text-align:center;">
      Envoyé depuis le formulaire de contact — boukhmissfreres.ma &nbsp;·&nbsp; Errachidia, Maroc 🇲🇦
    </div>
  </div>
</body>
</html>
      `
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
