#!/usr/bin/env node
/**
 * resend-receipt.js — Script ponctuel ATIP-Textile
 *
 * Récupère une commande Square, vérifie les articles, construit un reçu HTML
 * et le renvoie via Brevo (templateId 1 ou HTML inline en fallback).
 *
 * Usage :
 *   node resend-receipt.js --payment-id <SQUARE_PAYMENT_ID> [--to <email>] [--dry-run]
 *   node resend-receipt.js --email <CUSTOMER_EMAIL>         [--to <email>] [--dry-run]
 *
 * --to      Surcharge l'adresse de destination (pratique pour renvoyer à toi-même)
 * --dry-run Affiche le reçu dans le terminal sans rien envoyer
 */

'use strict';

const path  = require('path');
const fs    = require('fs');

// ── Charger .env (cherche .env.local puis .env dans le répertoire parent) ──
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config(); // fallback : .env dans le dossier courant

// ── Dépendances ────────────────────────────────────────────────────────────
const { Client, Environment } = require('square');
const SibApiV3Sdk = require('@getbrevo/brevo');

// ── Catalogue local (noms, formats, prix) ─────────────────────────────────
const CATALOG = require('./catalog');

// ── Articles attendus pour cette commande ─────────────────────────────────
const EXPECTED_ITEMS = [
  { catalogId: '6',  name: 'Festive Night',  format: '20x20 cm | framed' },
  { catalogId: '7',  name: 'Aloe Flowers',   format: '20x20 cm | framed' },
  { catalogId: '8',  name: 'Dragonflies',    format: '20x20 cm | framed' },
  { catalogId: '10', name: 'Vines',          format: '20x20 cm | framed' },
];

// ── Parse CLI ──────────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const get  = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };
  return {
    paymentId : get('--payment-id'),
    email     : get('--email'),
    toOverride: get('--to'),
    dryRun    : args.includes('--dry-run'),
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────
function eur(cents) { return (Number(cents) / 100).toFixed(2); }

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, s =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s])
  );
}

function bigintSafe(obj) {
  return JSON.parse(JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v));
}

// ── Square : récupérer le paiement ────────────────────────────────────────
async function fetchPaymentById(client, paymentId) {
  console.log(`\n🔍  Fetching payment ${paymentId} …`);
  const { result } = await client.paymentsApi.getPayment(paymentId);
  return bigintSafe(result.payment);
}

async function fetchPaymentByEmail(client, email) {
  console.log(`\n🔍  Searching customer by email ${email} …`);
  const { result: custResult } = await client.customersApi.searchCustomers({
    query: { filter: { emailAddress: { exact: email } } },
  });
  const customers = custResult.customers || [];
  if (!customers.length) throw new Error(`No Square customer found for email: ${email}`);

  console.log(`    Found ${customers.length} customer(s). Searching payments …`);

  // List recent payments and filter by buyer email
  const { result: listResult } = await client.paymentsApi.listPayments({
    sortOrder: 'DESC',
    count: 100,
  });
  const payments = (listResult.payments || []).filter(
    p => p.buyerEmailAddress === email || p.note?.toLowerCase().includes(email.toLowerCase())
  );
  if (!payments.length) throw new Error(`No payment found for email: ${email}`);

  // Return the most recent
  const payment = bigintSafe(payments[0]);
  console.log(`    Found payment ${payment.id} (${payment.status})`);
  return payment;
}

// ── Vérification des articles ─────────────────────────────────────────────
function buildEmailItemsFromCatalog() {
  return EXPECTED_ITEMS.map(({ catalogId, name, format }) => {
    const p = CATALOG[catalogId];
    if (!p) throw new Error(`Unknown catalog ID: ${catalogId}`);
    return {
      id: catalogId,
      name: p.name || name,
      format: p.format || format,
      imageUrl: p.imageUrl || '',
      qty: 1,
      lineTotal: Number(p.unitCents || 0),
    };
  });
}

function verifyOrder(payment, emailItems) {
  const totalCents = emailItems.reduce((s, i) => s + i.lineTotal, 0);
  const paymentAmount = Number(payment.amountMoney?.amount || 0);

  console.log('\n📋  Vérification de la commande :');
  emailItems.forEach(i => {
    console.log(`    ✓  ${i.name} — ${i.format} — €${eur(i.lineTotal)}`);
  });
  console.log(`\n    Total catalogue : €${eur(totalCents)}`);
  console.log(`    Total Square    : €${eur(paymentAmount)}`);

  if (totalCents !== paymentAmount) {
    console.warn(`\n    ⚠️  ÉCART détecté : catalogue=${eur(totalCents)}€  Square=${eur(paymentAmount)}€`);
    console.warn('       Le reçu sera envoyé avec le total Square (source de vérité).');
  } else {
    console.log('\n    ✅ Totaux concordants.');
  }

  return { totalCents: paymentAmount, emailItems };
}

// ── Construction du reçu HTML ─────────────────────────────────────────────
function buildReceiptHtml({ payment, emailItems, totalCents }) {
  const dateStr  = new Date(payment.createdAt || Date.now())
    .toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const shortId  = String(payment.id || '').slice(-8).toUpperCase();
  const invoiceNo = `ATIP-${shortId}`;
  const receiptUrl = payment.receiptUrl || null;

  const rows = emailItems.map(i => `
    <tr>
      <td style="padding:14px 18px;border-bottom:1px solid #f0e8db;font-size:14px;color:#1e1e1e;">
        <strong>${escapeHtml(i.name)}</strong><br/>
        <span style="font-size:12px;color:#8b6f3a;">${escapeHtml(i.format)}</span>
      </td>
      <td align="center" style="padding:14px 10px;border-bottom:1px solid #f0e8db;color:#1e1e1e;">${i.qty}</td>
      <td align="right" style="padding:14px 10px;border-bottom:1px solid #f0e8db;color:#1e1e1e;">€${eur(i.lineTotal / i.qty)}</td>
      <td align="right" style="padding:14px 18px;border-bottom:1px solid #f0e8db;color:#1e1e1e;font-weight:600;">€${eur(i.lineTotal)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f6f1e8;font-family:Georgia,'Times New Roman',serif;color:#1e1e1e;">
<div style="max-width:680px;margin:32px auto;padding:0 16px;">
  <div style="background:#efe6d6;border:1px solid #e3d4bb;border-radius:18px;overflow:hidden;">

    <!-- Header -->
    <div style="padding:28px 32px;background:linear-gradient(135deg,#efe3cf 0%,#f8f3ea 100%);border-bottom:1px solid #e7d9c2;">
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9a7b46;margin-bottom:8px;">
        ATIP Textile — Confirmation de commande
      </div>
      <div style="font-size:26px;font-weight:normal;color:#1e1e1e;">Merci pour votre commande ✅</div>
      <div style="font-size:13px;color:#6d6257;margin-top:8px;">
        Référence&nbsp;: <strong>${escapeHtml(invoiceNo)}</strong> &nbsp;·&nbsp; ${escapeHtml(dateStr)}
      </div>
    </div>

    <!-- Table articles -->
    <div style="padding:24px 32px 0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
             style="border-collapse:collapse;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #eadfce;">
        <thead>
          <tr style="background:#f7f1e6;">
            <th align="left"  style="padding:12px 18px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9a7b46;">Article</th>
            <th align="center" style="padding:12px 10px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9a7b46;">Qté</th>
            <th align="right" style="padding:12px 10px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9a7b46;">Unit.</th>
            <th align="right" style="padding:12px 18px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9a7b46;">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <!-- Total -->
    <div style="padding:18px 32px 24px;text-align:right;">
      <div style="display:inline-block;background:#1e1e1e;border-radius:12px;padding:14px 22px;color:#fff;min-width:220px;text-align:left;">
        <div style="font-size:13px;color:#ddd4c6;margin-bottom:6px;">Livraison&nbsp;: <strong>€0.00</strong></div>
        <div style="border-top:1px solid rgba(255,255,255,.15);padding-top:10px;font-size:18px;font-weight:bold;">
          Total payé &nbsp;<span style="color:#f0c36a;">€${eur(totalCents)}</span>
        </div>
      </div>
    </div>

    ${receiptUrl ? `
    <!-- Lien reçu Square -->
    <div style="padding:0 32px 24px;text-align:center;">
      <a href="${escapeHtml(receiptUrl)}" target="_blank"
         style="display:inline-block;padding:12px 24px;background:#7D5134;color:#fff;border-radius:8px;
                font-size:13px;text-decoration:none;letter-spacing:1px;">
        Voir le reçu Square officiel →
      </a>
    </div>` : ''}

    <!-- Footer -->
    <div style="padding:18px 32px;background:#f7f1e6;border-top:1px solid #e7d9c2;text-align:center;
                font-size:12px;color:#8a7d70;line-height:1.7;">
      ATIP-Textile — When Africa is Told In Patterns<br/>
      <a href="mailto:contact@atip-textile.com" style="color:#7D5134;">contact@atip-textile.com</a>
      &nbsp;·&nbsp; www.atip-textile.com
    </div>
  </div>
</div>
</body></html>`;
}

// ── Brevo : construire les params du template ──────────────────────────────
function buildBrevoParams({ payment, emailItems, totalCents }) {
  const dateStr = new Date(payment.createdAt || Date.now()).toISOString().slice(0, 10);
  const shortId = String(payment.id || '').slice(-8).toUpperCase();
  const paymentId = payment.id || `ATIP-${shortId}`;

  const products = emailItems.map(i => ({
    name     : i.name,
    format   : i.format,
    quantity : i.qty,
    unitPrice: eur(i.lineTotal / i.qty),
    lineTotal: eur(i.lineTotal),
    currency : 'EUR',
    imageUrl : i.imageUrl || '',
  }));

  const subtotal = eur(totalCents);
  const first    = emailItems[0] || {};

  return {
    itemsText   : emailItems.map((i, n) => `Article ${n + 1}: ${i.name} — ${i.format} — €${eur(i.lineTotal)}`).join('\n'),
    orderNumber : paymentId,
    date        : dateStr,
    products,
    subtotal,
    shipping    : '0.00',
    total       : subtotal,
    amount      : subtotal,
    paymentId,
    productName : first.name || '',
    format      : first.format || '',
  };
}

// ── Brevo : envoyer ────────────────────────────────────────────────────────
async function sendViaBrevo({ toEmail, payment, emailItems, totalCents, receiptHtml }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY est absent des variables d\'environnement.');

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const params = buildBrevoParams({ payment, emailItems, totalCents });

  // Tentative 1 : template 1 (comme l'automatisation existante)
  try {
    console.log('\n📧  Envoi via Brevo templateId=1 …');
    await apiInstance.sendTransacEmail({
      sender    : { name: 'ATIP-Textile', email: 'orders@atip-textile.com' },
      to        : [{ email: toEmail }],
      templateId: 1,
      params,
    });
    console.log(`    ✅ Email envoyé à ${toEmail} (template 1).`);
    return;
  } catch (err) {
    console.warn(`    ⚠️  Template 1 a échoué : ${err?.message || err}`);
    console.warn('    🔄  Fallback : envoi HTML inline …');
  }

  // Tentative 2 : HTML inline (fallback si le template est cassé ou absent)
  await apiInstance.sendTransacEmail({
    sender     : { name: 'ATIP-Textile', email: 'orders@atip-textile.com' },
    to         : [{ email: toEmail }],
    subject    : `Confirmation de commande ATIP Textile — ${params.orderNumber}`,
    htmlContent: receiptHtml,
    textContent: [
      'Merci pour votre commande ATIP Textile !',
      `Référence : ${params.orderNumber}`,
      `Date : ${params.date}`,
      '',
      ...emailItems.map((i, n) => `${n + 1}. ${i.name} — ${i.format} — €${eur(i.lineTotal)}`),
      '',
      `Total payé : €${params.total}`,
    ].join('\n'),
  });
  console.log(`    ✅ Email envoyé à ${toEmail} (HTML inline).`);
}

// ── Diagnostic Brevo ───────────────────────────────────────────────────────
function printDiagnostic() {
  const brevoKey = process.env.BREVO_API_KEY;
  const sqToken  = process.env.Square_PROD_Access_Token;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🩺  DIAGNOSTIC — Pourquoi Brevo ne s\'est pas déclenché ?');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  BREVO_API_KEY            : ${brevoKey  ? '✅ présente (' + brevoKey.slice(0,8) + '…)' : '❌ ABSENTE'}`);
  console.log(`  Square_PROD_Access_Token : ${sqToken   ? '✅ présente (' + sqToken.slice(0,8) + '…)' : '❌ ABSENTE'}`);
  console.log('\n  Causes les plus probables (ordre de vraisemblance) :');
  console.log('');
  console.log('  1. BREVO_API_KEY absente ou incorrecte sur Cloud Run');
  console.log('     → Cloud Run > "Variables et secrets" > vérifier la valeur exacte');
  console.log('');
  console.log('  2. Template Brevo ID=1 inexistant ou désactivé');
  console.log('     → Brevo dashboard > Modèles transactionnels > vérifier que l\'ID 1 est actif');
  console.log('');
  console.log('  3. L\'email client (orderContext?.shippingInfo?.email) était vide');
  console.log('     → Dans server.js, sendOrderEmails() saute l\'email client si !email');
  console.log('     → Vérifier dans Square Dashboard que l\'email acheteur est renseigné');
  console.log('');
  console.log('  4. L\'erreur Brevo a été silencieusement avalée');
  console.log('     → server.js: catch (e) { console.error(\'Brevo emails failed:\') }');
  console.log('     → Vérifier les logs Cloud Run du moment de la commande :');
  console.log('        gcloud run services logs read copy-of-copy-of-atip-textile-jack \\');
  console.log('          --region us-west1 --limit 200 | grep -i "brevo\\|email\\|template"');
  console.log('');
  console.log('  5. Adresse expéditeur "orders@atip-textile.com" non vérifiée dans Brevo');
  console.log('     → Brevo > Expéditeurs & domaines > vérifier que le domaine est authentifié');
  console.log('');
  console.log('  6. Commande PayPal capturée (pas Square) : le flux email est différent');
  console.log('     → capturePayPalOrder() appelle bien sendOrderEmails() mais vérifier');
  console.log('       que cartItems était non vide dans la requête /paypal/capture-order');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const { paymentId, email, toOverride, dryRun } = parseArgs();

  if (!paymentId && !email) {
    console.error('Usage : node resend-receipt.js --payment-id <ID>  ou  --email <email>  [--to <email>] [--dry-run]');
    process.exit(1);
  }

  const sqToken = process.env.Square_PROD_Access_Token;
  if (!sqToken) {
    console.error('❌  Square_PROD_Access_Token est absent. Vérifiez votre fichier .env ou .env.local.');
    process.exit(1);
  }

  const client = new Client({ accessToken: sqToken, environment: Environment.Production });

  // 1. Récupérer le paiement
  let payment;
  try {
    payment = paymentId
      ? await fetchPaymentById(client, paymentId)
      : await fetchPaymentByEmail(client, email);
  } catch (err) {
    console.error(`❌  Erreur Square : ${err?.message || err}`);
    printDiagnostic();
    process.exit(1);
  }

  console.log('\n💳  Paiement trouvé :');
  console.log(`    ID      : ${payment.id}`);
  console.log(`    Statut  : ${payment.status}`);
  console.log(`    Montant : €${eur(payment.amountMoney?.amount)}`);
  console.log(`    Email   : ${payment.buyerEmailAddress || '(non renseigné dans Square)'}`);
  console.log(`    Date    : ${payment.createdAt}`);
  if (payment.receiptUrl) console.log(`    Reçu    : ${payment.receiptUrl}`);

  // 2. Construire les articles depuis le catalogue local
  const emailItems = buildEmailItemsFromCatalog();

  // 3. Vérifier et réconcilier le total
  const { totalCents } = verifyOrder(payment, emailItems);

  // 4. Construire le HTML du reçu
  const receiptHtml = buildReceiptHtml({ payment, emailItems, totalCents });

  // 5. Déterminer l'adresse de destination
  const toEmail = toOverride || payment.buyerEmailAddress;
  if (!toEmail) {
    console.error('\n❌  Adresse email introuvable. Utilisez --to <email> pour forcer la destination.');
    printDiagnostic();
    process.exit(1);
  }

  // 6. Dry-run ou envoi réel
  if (dryRun) {
    console.log(`\n🖨️  --dry-run actif. Le reçu AURAIT été envoyé à : ${toEmail}`);
    console.log('\n' + '─'.repeat(70));
    console.log('APERÇU HTML (extrait) :');
    console.log('─'.repeat(70));
    // Affiche juste les lignes clés pour ne pas saturer le terminal
    const lines = receiptHtml.split('\n').filter(l => l.trim()).slice(0, 50);
    console.log(lines.join('\n'));
    console.log('… (HTML complet non affiché)');
    // Sauvegarder le HTML dans un fichier pour inspection
    const outPath = path.join(__dirname, 'receipt-preview.html');
    fs.writeFileSync(outPath, receiptHtml, 'utf8');
    console.log(`\n    Fichier HTML complet enregistré : ${outPath}`);
  } else {
    if (!process.env.BREVO_API_KEY) {
      console.error('\n❌  BREVO_API_KEY absente. Impossible d\'envoyer. Relancez avec --dry-run pour voir le reçu.');
      printDiagnostic();
      process.exit(1);
    }
    try {
      await sendViaBrevo({ toEmail, payment, emailItems, totalCents, receiptHtml });
    } catch (err) {
      console.error(`\n❌  Échec Brevo : ${err?.message || err}`);
      printDiagnostic();
      process.exit(1);
    }
  }

  // Toujours afficher le diagnostic pour aider à comprendre ce qui s'est passé
  printDiagnostic();
}

main().catch(err => {
  console.error('\n❌  Erreur inattendue :', err);
  process.exit(1);
});
