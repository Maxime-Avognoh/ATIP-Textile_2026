// /**
//  * @license
//  * Copyright 2025 Google LLC
//  * SPDX-License-Identifier: Apache-2.0
//  */




// require('dotenv').config();
// const express = require('express');
// const fs = require('fs');
// const axios = require('axios');
// const https = require('https');
// const path = require('path');
// const WebSocket = require('ws');
// const { URLSearchParams, URL } = require('url');
// const rateLimit = require('express-rate-limit');




// const app = express();
// const port = process.env.PORT || 3000;
// const externalApiBaseUrl = 'https://generativelanguage.googleapis.com';
// const externalWsBaseUrl = 'wss://generativelanguage.googleapis.com';
// // Support either API key env-var variant
// const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;




// const staticPath = path.join(__dirname,'dist');
// const publicPath = path.join(__dirname,'public');








// if (!apiKey) {
//     // Only log an error, don't exit. The server will serve apps without proxy functionality
//     console.error("Warning: GEMINI_API_KEY or API_KEY environment variable is not set! Proxy functionality will be disabled.");
// }
// else {
//   console.log("API KEY FOUND (proxy will use this)")
// }




// // Limit body size to 50mb
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({extended: true, limit: '50mb'}));
// app.set('trust proxy', 1 /* number of proxies between user and server */)




// // Rate limiter for the proxy
// const proxyLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // Set ratelimit window at 15min (in ms)
//     max: 100, // Limit each IP to 100 requests per window
//     message: 'Too many requests from this IP, please try again after 15 minutes',
//     standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//     legacyHeaders: false, // no `X-RateLimit-*` headers
//     handler: (req, res, next, options) => {
//         console.warn(`Rate limit exceeded for IP: ${req.ip}. Path: ${req.path}`);
//         res.status(options.statusCode).send(options.message);
//     }
// });




// // Apply the rate limiter to the /api-proxy route before the main proxy logic
// app.use('/api-proxy', proxyLimiter);




// // Proxy route for Gemini API calls (HTTP)
// app.use('/api-proxy', async (req, res, next) => {
//     console.log(req.ip);
//     // If the request is an upgrade request, it's for WebSockets, so pass to next middleware/handler
//     if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
//         return next(); // Pass to the WebSocket upgrade handler
//     }




//     // Handle OPTIONS request for CORS preflight
//     if (req.method === 'OPTIONS') {
//         res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust as needed for security
//         res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//         res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Goog-Api-Key');
//         res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight response for 1 day
//         return res.sendStatus(200);
//     }




//     if (req.body) { // Only log body if it exists
//         console.log("  Request Body (from frontend):", req.body);
//     }
//     try {
//         // Construct the target URL by taking the part of the path after /api-proxy/
//         const targetPath = req.url.startsWith('/') ? req.url.substring(1) : req.url;
//         const apiUrl = `${externalApiBaseUrl}/${targetPath}`;
//         console.log(`HTTP Proxy: Forwarding request to ${apiUrl}`);




//         // Prepare headers for the outgoing request
//         const outgoingHeaders = {};
//         // Copy most headers from the incoming request
//         for (const header in req.headers) {
//             // Exclude host-specific headers and others that might cause issues upstream
//             if (!['host', 'connection', 'content-length', 'transfer-encoding', 'upgrade', 'sec-websocket-key', 'sec-websocket-version', 'sec-websocket-extensions'].includes(header.toLowerCase())) {
//                 outgoingHeaders[header] = req.headers[header];
//             }
//         }




//         // Set the actual API key in the appropriate header
//         outgoingHeaders['X-Goog-Api-Key'] = apiKey;




//         // Set Content-Type from original request if present (for relevant methods)
//         if (req.headers['content-type'] && ['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
//             outgoingHeaders['Content-Type'] = req.headers['content-type'];
//         } else if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
//             // Default Content-Type to application/json if no content type for post/put/patch
//             outgoingHeaders['Content-Type'] = 'application/json';
//         }




//         // For GET or DELETE requests, ensure Content-Type is NOT sent,
//         // even if the client erroneously included it.
//         if (['GET', 'DELETE'].includes(req.method.toUpperCase())) {
//             delete outgoingHeaders['Content-Type']; // Case-sensitive common practice
//             delete outgoingHeaders['content-type']; // Just in case
//         }




//         // Ensure 'accept' is reasonable if not set
//         if (!outgoingHeaders['accept']) {
//             outgoingHeaders['accept'] = '*/*';
//         }








//         const axiosConfig = {
//             method: req.method,
//             url: apiUrl,
//             headers: outgoingHeaders,
//             responseType: 'stream',
//             validateStatus: function (status) {
//                 return true; // Accept any status code, we'll pipe it through
//             },
//         };




//         if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
//             axiosConfig.data = req.body;
//         }
//         // For GET, DELETE, etc., axiosConfig.data will remain undefined,
//         // and axios will not send a request body.




//         const apiResponse = await axios(axiosConfig);




//         // Pass through response headers from Gemini API to the client
//         for (const header in apiResponse.headers) {
//             res.setHeader(header, apiResponse.headers[header]);
//         }
//         res.status(apiResponse.status);








//         apiResponse.data.on('data', (chunk) => {
//             res.write(chunk);
//         });




//         apiResponse.data.on('end', () => {
//             res.end();
//         });




//         apiResponse.data.on('error', (err) => {
//             console.error('Error during streaming data from target API:', err);
//             if (!res.headersSent) {
//                 res.status(500).json({ error: 'Proxy error during streaming from target' });
//             } else {
//                 // If headers already sent, we can't send a JSON error, just end the response.
//                 res.end();
//             }
//         });




//     } catch (error) {
//         console.error('Proxy error before request to target API:', error);
//         if (!res.headersSent) {
//             if (error.response) {
//                 const errorData = {
//                     status: error.response.status,
//                     message: error.response.data?.error?.message || 'Proxy error from upstream API',
//                     details: error.response.data?.error?.details || null
//                 };
//                 res.status(error.response.status).json(errorData);
//             } else {
//                 res.status(500).json({ error: 'Proxy setup error', message: error.message });
//             }
//         }
//     }
// });




// const webSocketInterceptorScriptTag = `<script src="/public/websocket-interceptor.js" defer></script>`;




// // Prepare service worker registration script content
// const serviceWorkerRegistrationScript = `
// <script>
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load' , () => {
//     navigator.serviceWorker.register('./service-worker.js')
//       .then(registration => {
//         console.log('Service Worker registered successfully with scope:', registration.scope);
//       })
//       .catch(error => {
//         console.error('Service Worker registration failed:', error);
//       });
//   });
// } else {
//   console.log('Service workers are not supported in this browser.');
// }
// </script>
// `;




// // Serve index.html or placeholder based on API key and file availability
// app.get('/', (req, res) => {
//     const placeholderPath = path.join(publicPath, 'placeholder.html');




//     // Try to serve index.html
//     console.log("LOG: Route '/' accessed. Attempting to serve index.html.");
//     const indexPath = path.join(staticPath, 'index.html');




//     fs.readFile(indexPath, 'utf8', (err, indexHtmlData) => {
//         if (err) {
//             // index.html not found or unreadable, serve the original placeholder
//             console.log('LOG: index.html not found or unreadable. Falling back to original placeholder.');
//             return res.sendFile(placeholderPath);
//         }




//         // If API key is not set, serve original HTML without injection
//         if (!apiKey) {
//           console.log("LOG: API key not set. Serving original index.html without script injections.");
//           return res.sendFile(indexPath);
//         }




//         // index.html found and apiKey set, inject scripts
//         console.log("LOG: index.html read successfully. Injecting scripts.");
//         let injectedHtml = indexHtmlData;








//         if (injectedHtml.includes('<head>')) {
//             // Inject WebSocket interceptor first, then service worker script
//             injectedHtml = injectedHtml.replace(
//                 '<head>',
//                 `<head>${webSocketInterceptorScriptTag}${serviceWorkerRegistrationScript}`
//             );
//             console.log("LOG: Scripts injected into <head>.");
//         } else {
//             console.warn("WARNING: <head> tag not found in index.html. Prepending scripts to the beginning of the file as a fallback.");
//             injectedHtml = `${webSocketInterceptorScriptTag}${serviceWorkerRegistrationScript}${indexHtmlData}`;
//         }
//         res.send(injectedHtml);
//     });
// });




// app.get('/service-worker.js', (req, res) => {
//    return res.sendFile(path.join(publicPath, 'service-worker.js'));
// });




// app.use('/public', express.static(publicPath));
// app.use(express.static(staticPath));




// // Start the HTTP server
// const server = app.listen(port, () => {
//     console.log(`Server listening on port ${port}`);
//     console.log(`HTTP proxy active on /api-proxy/**`);
//     console.log(`WebSocket proxy active on /api-proxy/**`);
// });




// // Create WebSocket server and attach it to the HTTP server
// const wss = new WebSocket.Server({ noServer: true });




// server.on('upgrade', (request, socket, head) => {
//     const requestUrl = new URL(request.url, `http://${request.headers.host}`);
//     const pathname = requestUrl.pathname;




//     if (pathname.startsWith('/api-proxy/')) {
//         if (!apiKey) {
//             console.error("WebSocket proxy: API key not configured. Closing connection.");
//             socket.destroy();
//             return;
//         }




//         wss.handleUpgrade(request, socket, head, (clientWs) => {
//             console.log('Client WebSocket connected to proxy for path:', pathname);




//             const targetPathSegment = pathname.substring('/api-proxy'.length);
//             const clientQuery = new URLSearchParams(requestUrl.search);
//             clientQuery.set('key', apiKey);
//             const targetGeminiWsUrl = `${externalWsBaseUrl}${targetPathSegment}?${clientQuery.toString()}`;
//             console.log(`Attempting to connect to target WebSocket: ${targetGeminiWsUrl}`);




//             const geminiWs = new WebSocket(targetGeminiWsUrl, {
//                 protocol: request.headers['sec-websocket-protocol'],
//             });




//             const messageQueue = [];




//             geminiWs.on('open', () => {
//                 console.log('Proxy connected to Gemini WebSocket');
//                 // Send any queued messages
//                 while (messageQueue.length > 0) {
//                     const message = messageQueue.shift();
//                     if (geminiWs.readyState === WebSocket.OPEN) {
//                         // console.log('Sending queued message from client -> Gemini');
//                         geminiWs.send(message);
//                     } else {
//                         // Should not happen if we are in 'open' event, but good for safety
//                         console.warn('Gemini WebSocket not open when trying to send queued message. Re-queuing.');
//                         messageQueue.unshift(message); // Add it back to the front
//                         break; // Stop processing queue for now
//                     }
//                 }
//             });




//             geminiWs.on('message', (message) => {
//                 // console.log('Message from Gemini -> client');
//                 if (clientWs.readyState === WebSocket.OPEN) {
//                     clientWs.send(message);
//                 }
//             });




//             geminiWs.on('close', (code, reason) => {
//                 console.log(`Gemini WebSocket closed: ${code} ${reason.toString()}`);
//                 if (clientWs.readyState === WebSocket.OPEN || clientWs.readyState === WebSocket.CONNECTING) {
//                     clientWs.close(code, reason.toString());
//                 }
//             });




//             geminiWs.on('error', (error) => {
//                 console.error('Error on Gemini WebSocket connection:', error);
//                 if (clientWs.readyState === WebSocket.OPEN || clientWs.readyState === WebSocket.CONNECTING) {
//                     clientWs.close(1011, 'Upstream WebSocket error');
//                 }
//             });




//             clientWs.on('message', (message) => {
//                 if (geminiWs.readyState === WebSocket.OPEN) {
//                     // console.log('Message from client -> Gemini');
//                     geminiWs.send(message);
//                 } else if (geminiWs.readyState === WebSocket.CONNECTING) {
//                     // console.log('Queueing message from client -> Gemini (Gemini still connecting)');
//                     messageQueue.push(message);
//                 } else {
//                     console.warn('Client sent message but Gemini WebSocket is not open or connecting. Message dropped.');
//                 }
//             });




//             clientWs.on('close', (code, reason) => {
//                 console.log(`Client WebSocket closed: ${code} ${reason.toString()}`);
//                 if (geminiWs.readyState === WebSocket.OPEN || geminiWs.readyState === WebSocket.CONNECTING) {
//                     geminiWs.close(code, reason.toString());
//                 }
//             });




//             clientWs.on('error', (error) => {
//                 console.error('Error on client WebSocket connection:', error);
//                 if (geminiWs.readyState === WebSocket.OPEN || geminiWs.readyState === WebSocket.CONNECTING) {
//                     geminiWs.close(1011, 'Client WebSocket error');
//                 }
//             });
//         });
//     } else {
//         console.log(`WebSocket upgrade request for non-proxy path: ${pathname}. Closing connection.`);
//         socket.destroy();
//     }
// });




/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */




                                                                                                                                                                                                                 
  const path = require('path');                                                                                                                                                                                    
  require('dotenv').config(); // Works in Cloud Run (env vars injected directly)                                                                                                                                  
  // Also try .env.local for local development                                                                                                                                                                    
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });                                                                                                                                    
  const express = require('express');                                                                                                                                                                              
  const fs = require('fs');                                                                                                                                                                                        
  const axios = require('axios');  
  const nodemailer = require("nodemailer");                                                                                                                                                                              
  const WebSocket = require('ws');                                                                                                                                                                                
  const { URLSearchParams, URL } = require('url');                                                                                                                                                                
  const rateLimit = require('express-rate-limit');          
  const brevo = require('@getbrevo/brevo');
  const CATALOG = require("./catalog");


// 🌸 ÉLÉMENT SQUARE : Importation du SDK
const { Client, Environment } = require('square');




const app = express();
// Configuration du port pour Google Cloud Run (8080)
const port = process.env.PORT || 8080;




// 🌸 ÉLÉMENT SQUARE : Initialisation du client en mode PRODUCTION
// Note : SQUARE_ACCESS_TOKEN doit être ajouté dans Secret Manager
const squareClient = new Client({
    accessToken: process.env.Square_PROD_Access_Token,
    environment: Environment.Production,
});












const { paymentsApi } = squareClient;




const externalApiBaseUrl = 'https://generativelanguage.googleapis.com';
const externalWsBaseUrl = 'wss://generativelanguage.googleapis.com';
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;




// Utilisation de path.resolve pour éviter les erreurs de chemin sur Cloud Run
const staticPath = path.resolve(__dirname, 'dist');
const publicPath = path.resolve(__dirname, 'public');




if (!apiKey) {
    console.error("Warning: GEMINI_API_KEY or API_KEY not set!");
} else {
    console.log("API KEY FOUND (proxy will use this)");
}


const crypto = require("crypto");


app.post("/webhooks/square", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
    const signatureHeader = req.get("x-square-hmacsha256-signature");


    if (!signatureKey || !signatureHeader) {
      console.error("Missing webhook signature key or header");
      return res.status(400).send("missing signature");
    }




    const notificationUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL;
    // ex: https://xxx.run.app/webhooks/square


    const bodyString = req.body.toString("utf8");
    const payload = notificationUrl + bodyString;


    const hmac = crypto.createHmac("sha256", signatureKey).update(payload).digest("base64");


    if (hmac !== signatureHeader) {
      console.error("Invalid Square signature");
      return res.status(401).send("invalid signature");
    }


    const event = JSON.parse(bodyString);
    console.log("✅ Square webhook received:", event.type);


    // TODO: ici on déclenchera l’email si payment COMPLETED
    return res.status(200).send("ok");
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).send("error");
  }
});


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.set('trust proxy', 1);






// ===============================
// 📧 CONFIGURATION SMTP (BREVO)
// ===============================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


async function sendOrderEmail({ toEmail, paymentId, amount }) {
  const html = `
    <h2>Merci pour votre commande ATIP Textile ✅</h2>
    <p><strong>Référence :</strong> ${paymentId}</p>
    <p><strong>Montant :</strong> ${(amount/100).toFixed(2)} EUR</p>
    <p>Votre commande est confirmée.</p>
  `;


  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: `Confirmation de commande ATIP Textile (${paymentId})`,
    html,
  });


  console.log("✅ Email envoyé à:", toEmail);
}




const SibApiV3Sdk = require('@getbrevo/brevo');


const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();


apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);










function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, s => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[s]));
}


function buildItemsText(items, currency = "EUR") {
  return items.map((it, index) => {
    const name = it.name || "Product";
    const format = it.format || "";
    const qty = Number(it.qty || 1);
    const lineTotal = Number(it.lineTotal || 0);
    const img = it.imageUrl || "";


    return [
      `🧾 Article ${index + 1}`,
      `${name}`,
      format ? `${format}` : null,
      `Qty: ${qty}`,
      `Prix: ${(lineTotal / 100).toFixed(2)} ${currency}`,
      img ? `Image: ${img}` : null,
      `----------------------------`,
    ].filter(Boolean).join("\n");
  }).join("\n\n");
}

// ✅ Brevo "Shopify-style" params: send structured data, not raw HTML
function buildBrevoProducts(items, currency = "EUR") {
  return items.map((it) => {
    const qty = Number(it.qty || 1);
    const lineTotal = Number(it.lineTotal || 0);
    const unit = qty > 0 ? Math.round(lineTotal / qty) : 0;

    return {
      name: it.name || "Product",
      format: it.format || "",
      quantity: qty,
      // Keep numbers as strings for predictable rendering in email templates
      unitPrice: (unit / 100).toFixed(2),
      lineTotal: (lineTotal / 100).toFixed(2),
      currency,
      imageUrl: it.imageUrl || "",
    };
  });
}








// ==========================================
// 🌸 NOUVELLE ROUTE : TRAITEMENT DU PAIEMENT
// ==========================================

// --- PDF invoice generation (PDFKit) ---
// Install: npm i pdfkit
let PDFDocument;
try {
  PDFDocument = require('pdfkit');
} catch (e) {
  // If pdfkit isn't installed yet, the server will still run, but invoices won't be generated.
  PDFDocument = null;
}

const https = require('https');

function fetchImageBuffer(url) {
  return new Promise((resolve, reject) => {
    try {
      https.get(url, (res) => {
        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }).on('error', reject);
    } catch (e) {
      reject(e);
    }
  });
}

function formatMoneyEUR(amount) {
  // amount is a string like "110.00" or a number
  const n = Number(amount);
  if (!Number.isFinite(n)) return String(amount);
  return `EUR ${n.toFixed(2)}`;
}

async function buildInvoicePdfBuffer({ brandName, orderNumber, date, customerEmail, products, subtotal, shipping, total }) {
  return new Promise(async (resolve, reject) => {
    if (!PDFDocument) {
      return reject(new Error('pdfkit_not_installed'));
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Layout helpers
    const PAGE_WIDTH = doc.page.width;
    const PAGE_HEIGHT = doc.page.height;
    const left = doc.page.margins.left;
    const right = PAGE_WIDTH - doc.page.margins.right;

    const colorText = '#111111';
    const colorMuted = '#666666';
    const colorLine = '#E7E7E7';

    // Create premium invoice number from order id (Square payment id can be long)
    const cleanOrder = String(orderNumber || '').replace(/[^a-zA-Z0-9]/g, '');
    const shortOrder = (cleanOrder.slice(-8) || '00000000').toUpperCase();
    const invoiceNo = `ATIP-${shortOrder}`;

    const prettyDate = (() => {
      try {
        const d = new Date(date);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch (e) {
        return String(date || '');
      }
    })();

    // ====== HEADER (logo + title + right panel) ======
    const headerTop = 46;

    // Logo (safe: if it fails, PDF still generates)
    const logoUrl = 'https://storage.googleapis.com/atip_storage/FAVICON_ATIP_BIG.png';
    let logoDrawn = false;
    try {
      const logoBuf = await fetchImageBuffer(logoUrl);
      doc.image(logoBuf, left, headerTop, { width: 42, height: 42 });
      logoDrawn = true;
    } catch (e) {
      // ignore
    }

    const titleX = logoDrawn ? (left + 54) : left;

    doc.fillColor(colorText).font('Helvetica-Bold').fontSize(18).text('INVOICE', titleX, headerTop + 2);
    doc.fillColor(colorMuted).font('Helvetica').fontSize(10)
      .text(`${brandName || 'ATIP-Textile'} — Africa Told In Patterns`, titleX, headerTop + 24);

    // Right panel (details)
    const panelW = 210;
    const panelX = right - panelW;
    const panelY = headerTop;
    const panelH = 96;

    doc.roundedRect(panelX, panelY, panelW, panelH, 8)
      .lineWidth(1)
      .strokeColor(colorLine)
      .stroke();

    doc.fillColor(colorText).font('Helvetica-Bold').fontSize(10)
      .text('Invoice details', panelX + 12, panelY + 10);

    // Use consistent label/value columns inside panel
    const pvX = panelX + 70;
    const pvW = panelW - 82;

    doc.fillColor(colorMuted).font('Helvetica').fontSize(9).text('Invoice:', panelX + 12, panelY + 28);
    doc.fillColor(colorText).font('Helvetica-Bold').fontSize(9)
      .text(invoiceNo, pvX, panelY + 28, { width: pvW, align: 'right' });

    doc.fillColor(colorMuted).font('Helvetica').fontSize(9).text('Order:', panelX + 12, panelY + 42);
    doc.fillColor(colorText).font('Helvetica').fontSize(9)
      .text(shortOrder, pvX, panelY + 42, { width: pvW, align: 'right' });

    doc.fillColor(colorMuted).font('Helvetica').fontSize(9).text('Date:', panelX + 12, panelY + 56);
    doc.fillColor(colorText).font('Helvetica').fontSize(9)
      .text(prettyDate, pvX, panelY + 56, { width: pvW, align: 'right' });

    // Status badge (aligned inside the panel)
    const badgeW = 58;
    const badgeH = 16;
    const badgeX = panelX + 12;
    const badgeY = panelY + panelH - badgeH - 4;

    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 8).fillColor(colorText).fill();
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8)
      .text('PAID', badgeX, badgeY + 4, { width: badgeW, align: 'center' });

    // Divider below header
    const dividerY = panelY + panelH + 16;
    doc.moveTo(left, dividerY).lineTo(right, dividerY).lineWidth(1).strokeColor(colorLine).stroke();

    // ====== BILL TO ======
    let y = dividerY + 14;
    doc.fillColor(colorText).font('Helvetica-Bold').fontSize(10).text('BILL TO', left, y);
    y += 14;
    doc.fillColor(colorText).font('Helvetica').fontSize(10).text(customerEmail || 'Customer', left, y);
    y += 14;
 /*   doc.fillColor(colorMuted).font('Helvetica').fontSize(9).text('If you have any questions, reply to this email.', left, y);
    y += 18; */

    // ====== TABLE ======
    const colItem = left;
    const colQty = right - 240;
    const colUnit = right - 160;
    const colTotal = right - 90;

    // Header row
    y += 10;
    doc.fillColor(colorMuted).font('Helvetica-Bold').fontSize(9);
    doc.text('Item', colItem, y, { width: colQty - colItem - 10 });
    doc.text('Qty', colQty, y, { width: 40, align: 'right' });
    doc.text('Unit', colUnit, y, { width: 70, align: 'right' });
    doc.text('Total', colTotal, y, { width: 70, align: 'right' });

    y += 14;
    doc.moveTo(left, y).lineTo(right, y).lineWidth(1).strokeColor('#DDDDDD').stroke();
    y += 10;

    doc.fillColor(colorText).font('Helvetica').fontSize(10);

    const safeProducts = Array.isArray(products) ? products : [];
    for (const p of safeProducts) {
      const title = p.format ? `${p.name} — ${p.format}` : `${p.name}`;
      const qty = String(p.quantity ?? '');
      const unitStr = formatMoneyEUR(p.unitPrice);
      const totalStr = formatMoneyEUR(p.lineTotal);

      doc.text(title, colItem, y, { width: colQty - colItem - 10 });
      doc.text(qty, colQty, y, { width: 40, align: 'right' });
      doc.text(unitStr, colUnit, y, { width: 70, align: 'right' });
      doc.text(totalStr, colTotal, y, { width: 70, align: 'right' });

      const rowH = Math.max(18, doc.heightOfString(title, { width: colQty - colItem - 10 }));
      y += rowH + 8;

      if (y > PAGE_HEIGHT - 160) {
        doc.addPage();
        y = doc.page.margins.top;
      }
    }

    doc.moveTo(left, y).lineTo(right, y).lineWidth(1).strokeColor('#DDDDDD').stroke();
    y += 14;

    // ====== TOTALS ======
    const totalsLabelX = colUnit - 40;
    const totalsValueX = colTotal + 10;

    function totalsRow(label, value, bold = false) {
      doc.fillColor(colorMuted).font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9)
        .text(label, totalsLabelX, y, { width: 120, align: 'right' });
      doc.fillColor(colorText).font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9)
        .text(formatMoneyEUR(value), totalsValueX, y, { width: 80, align: 'right' });
      y += 14;
    }

    totalsRow('Subtotal', subtotal);
    totalsRow('Shipping', shipping);
    y += 2;
    totalsRow('Total', total, true);

    // ====== FOOTER (business info) ======
    const footerY = PAGE_HEIGHT - 90;
    doc.moveTo(left, footerY - 12).lineTo(right, footerY - 12).lineWidth(1).strokeColor(colorLine).stroke();

    doc.fillColor(colorMuted).font('Helvetica').fontSize(9);
    doc.text('ATIP-Textile — When Africa is Told In Patterns', left, footerY, { align: 'left' });
    doc.text('contact@atip-textile.com  •  www.atip-textile.com', left, footerY + 14, { align: 'left' });
    doc.text('This invoice is generated automatically after payment confirmation.', left, footerY + 28, { align: 'left' });

    doc.end();
  });
}



function buildServerCartItems(cartItems = []) {
  const itemsFromClient = Array.isArray(cartItems) ? cartItems : [];
  if (!itemsFromClient.length) {
    throw new Error('Cart is empty');
  }

  const emailItems = itemsFromClient.map(({ id, qty }) => {
    const p = CATALOG[String(id)];
    if (!p) throw new Error(`Unknown product id: ${id}`);

    const safeQty = Math.max(1, Math.min(99, Number(qty || 1)));

    return {
      id: String(id),
      name: p.name,
      format: p.format,
      imageUrl: p.imageUrl,
      qty: safeQty,
      lineTotal: Number(p.unitCents || 0) * safeQty,
    };
  });

  const totalCents = emailItems.reduce((s, it) => s + Number(it.lineTotal || 0), 0);
  if (!Number.isFinite(totalCents) || totalCents <= 0) {
    throw new Error('Invalid total');
  }

  return { emailItems, totalCents };
}


async function sendOrderConfirmationEmail({ email, paymentId, emailItems, totalCents }) {
  if (!email) {
    console.warn('Skipping confirmation email: missing email');
    return;
  }

  const itemsText = buildItemsText(emailItems, 'EUR');
  const first = emailItems[0] || {};
  const dateStr = new Date().toISOString().slice(0, 10);
  const products = buildBrevoProducts(emailItems, 'EUR');
  const subtotal = (totalCents / 100).toFixed(2);
  const shipping = (0).toFixed(2);
  const total = (totalCents / 100).toFixed(2);

  let invoiceAttachment = null;
  try {
    const pdfBuffer = await buildInvoicePdfBuffer({
      brandName: 'ATIP-Textile',
      orderNumber: paymentId,
      date: dateStr,
      customerEmail: email,
      products,
      subtotal,
      shipping,
      total,
    });
    invoiceAttachment = [{
      content: pdfBuffer.toString('base64'),
      name: `Invoice_${paymentId}.pdf`,
    }];
  } catch (pdfErr) {
    console.warn('Invoice PDF not attached:', pdfErr?.message || pdfErr);
  }

  await apiInstance.sendTransacEmail({
    sender: { name: 'ATIP-Textile', email: 'orders@atip-textile.com' },
    to: [{ email }],
    templateId: 1,
    ...(invoiceAttachment ? { attachment: invoiceAttachment } : {}),
    params: {
      itemsText,
      orderNumber: paymentId,
      date: dateStr,
      products,
      subtotal,
      shipping,
      total,
      amount: (totalCents / 100).toFixed(2),
      paymentId,
      productName: first.name || '',
      format: first.format || '',
    },
  });
}

function normalizeContactInfo(info = {}) {
  return {
    fullName: String(info.fullName || '').trim(),
    email: String(info.email || '').trim(),
    phone: String(info.phone || '').trim(),
    address: String(info.address || '').trim(),
    city: String(info.city || '').trim(),
    postalCode: String(info.postalCode || '').trim(),
    country: String(info.country || '').trim(),
  };
}

function getFrameStatus(format = '') {
  const value = String(format || '').toLowerCase();
  if (value.includes('unframed') || value.includes('non encadr') || value.includes('sans cadre')) {
    return 'Non encadré';
  }
  if (value.includes('framed') || value.includes('encadr')) {
    return 'Encadré';
  }
  return 'Non précisé';
}

function formatContactBlockHtml(info = {}) {
  const safe = normalizeContactInfo(info);
  return [
    safe.fullName,
    safe.email,
    safe.phone,
    safe.address,
    [safe.city, safe.postalCode].filter(Boolean).join(', '),
    safe.country,
  ]
    .filter(Boolean)
    .map((line) => escapeHtml(line))
    .join('<br/>');
}

function formatContactBlockText(info = {}) {
  const safe = normalizeContactInfo(info);
  return [
    safe.fullName,
    safe.email,
    safe.phone,
    safe.address,
    [safe.city, safe.postalCode].filter(Boolean).join(', '),
    safe.country,
  ]
    .filter(Boolean)
    .join('\n');
}

function formatAdminOrderRowsHtml(items = []) {
  return items.map((item) => {
    const qty = Math.max(1, Number(item.qty || 1));
    const lineTotalCents = Number(item.lineTotal || 0);
    const unitPrice = qty > 0 ? (lineTotalCents / qty) / 100 : 0;
    const frameStatus = getFrameStatus(item.format);

    return `
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #f3ebdf;vertical-align:top;">
          <div style="font-size:15px;font-weight:600;color:#1e1e1e;">${escapeHtml(item.name || 'Produit')}</div>
          ${item.format ? `<div style="font-size:13px;color:#8b6f3a;margin-top:4px;">Format: ${escapeHtml(item.format)}</div>` : ''}
          <div style="font-size:13px;color:#7a6d5f;margin-top:4px;">Statut: ${escapeHtml(frameStatus)}</div>
        </td>
        <td align="center" style="padding:16px 12px;border-bottom:1px solid #f3ebdf;color:#1e1e1e;">${qty}</td>
        <td align="right" style="padding:16px 12px;border-bottom:1px solid #f3ebdf;color:#1e1e1e;">€${unitPrice.toFixed(2)}</td>
        <td align="right" style="padding:16px 20px;border-bottom:1px solid #f3ebdf;color:#1e1e1e;font-weight:600;">€${(lineTotalCents / 100).toFixed(2)}</td>
      </tr>
    `;
  }).join('');
}

function formatAdminOrderRowsText(items = []) {
  return items.map((item, index) => {
    const qty = Math.max(1, Number(item.qty || 1));
    const lineTotalCents = Number(item.lineTotal || 0);
    const unitPrice = qty > 0 ? (lineTotalCents / qty) / 100 : 0;
    const frameStatus = getFrameStatus(item.format);

    return [
      `Article ${index + 1}: ${item.name || 'Produit'}`,
      item.format ? `Format: ${item.format}` : null,
      `Statut: ${frameStatus}`,
      `Quantité: ${qty}`,
      `Prix unitaire: €${unitPrice.toFixed(2)}`,
      `Total ligne: €${(lineTotalCents / 100).toFixed(2)}`,
    ].filter(Boolean).join('\n');
  }).join('\n\n');
}

async function sendAdminOrderAlertEmail({ paymentId, paymentMethod, emailItems, totalCents, customer = {} }) {
  const adminEmail = process.env.ADMIN_ORDER_ALERT_EMAIL || 'orders@atip-textile.com';
  if (!adminEmail) {
    console.warn('Skipping admin order alert email: missing ADMIN_ORDER_ALERT_EMAIL');
    return;
  }

  const shippingInfo = normalizeContactInfo(customer?.shippingInfo || {});
  const billingInfo = normalizeContactInfo(customer?.billingInfo || {});
  const billingSameAsShipping = Boolean(customer?.sameAsShipping);
  const customerName = shippingInfo.fullName || billingInfo.fullName || 'Client';
  const customerEmail = shippingInfo.email || billingInfo.email || customer?.email || '';
  const customerPhone = shippingInfo.phone || billingInfo.phone || 'N/A';
  const dateStr = new Date().toISOString().slice(0, 10);
  const subtotal = (totalCents / 100).toFixed(2);
  const shipping = (0).toFixed(2);
  const total = (totalCents / 100).toFixed(2);
  const destinationCountry = shippingInfo.country || 'Non renseigné';
  const shippingAddressHtml = formatContactBlockHtml(shippingInfo);
  const billingAddressHtml = formatContactBlockHtml(billingInfo);
  const itemsRowsHtml = formatAdminOrderRowsHtml(emailItems);
  const productsText = formatAdminOrderRowsText(emailItems);

  let invoiceAttachment = null;
  try {
    const pdfBuffer = await buildInvoicePdfBuffer({
      brandName: 'ATIP-Textile',
      orderNumber: paymentId,
      date: dateStr,
      customerEmail,
      products: buildBrevoProducts(emailItems, 'EUR'),
      subtotal,
      shipping,
      total,
    });
    invoiceAttachment = [{
      content: pdfBuffer.toString('base64'),
      name: `Invoice_${paymentId}.pdf`,
    }];
  } catch (pdfErr) {
    console.warn('Admin invoice PDF not attached:', pdfErr?.message || pdfErr);
  }

  const htmlContent = `
  <div style="margin:0;padding:0;background-color:#f6f1e8;font-family:Georgia,'Times New Roman',serif;color:#1e1e1e;">
    <div style="max-width:760px;margin:0 auto;padding:32px 20px;">
      <div style="background:#efe6d6;border:1px solid #e3d4bb;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);">
        <div style="padding:28px 32px;background:linear-gradient(135deg,#efe3cf 0%, #f8f3ea 100%);border-bottom:1px solid #e7d9c2;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td style="vertical-align:top;">
                <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#9a7b46;margin-bottom:10px;">ATIP Textile — Alerte commande interne</div>
                <div style="font-size:30px;line-height:1.2;font-weight:normal;color:#1e1e1e;">Nouvelle commande confirmée</div>
                <div style="font-size:14px;color:#6d6257;margin-top:10px;line-height:1.6;">Une commande vient d’être payée avec succès. Voici toutes les informations nécessaires pour la préparation, la facturation et l’expédition.</div>
              </td>
              <td align="right" style="vertical-align:top;">
                <div style="display:inline-block;padding:10px 14px;border-radius:999px;background:#1e1e1e;color:#ffffff;font-size:12px;letter-spacing:1px;text-transform:uppercase;">${escapeHtml(paymentMethod || 'Paiement confirmé')}</div>
              </td>
            </tr>
          </table>
        </div>

        <div style="padding:28px 32px 10px 32px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td width="50%" style="padding:0 12px 18px 0;vertical-align:top;">
                <div style="background:#faf7f1;border:1px solid #eadfce;border-radius:16px;padding:18px;">
                  <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#9a7b46;margin-bottom:10px;">Commande</div>
                  <div style="font-size:14px;line-height:1.8;color:#2b2b2b;">
                    <strong>Order ID:</strong> ${escapeHtml(paymentId || '')}<br/>
                    <strong>Date:</strong> ${escapeHtml(dateStr)}<br/>
                    <strong>Paiement:</strong> ${escapeHtml(paymentMethod || '')}<br/>
                    <strong>Total payé:</strong> €${escapeHtml(total)}<br/>
                    <strong>Pays de destination:</strong> ${escapeHtml(destinationCountry)}
                  </div>
                </div>
              </td>
              <td width="50%" style="padding:0 0 18px 12px;vertical-align:top;">
                <div style="background:#faf7f1;border:1px solid #eadfce;border-radius:16px;padding:18px;">
                  <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#9a7b46;margin-bottom:10px;">Client</div>
                  <div style="font-size:14px;line-height:1.8;color:#2b2b2b;">
                    <strong>Nom:</strong> ${escapeHtml(customerName)}<br/>
                    <strong>Email:</strong> ${escapeHtml(customerEmail || 'N/A')}<br/>
                    <strong>Téléphone:</strong> ${escapeHtml(customerPhone || 'N/A')}
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <div style="padding:0 32px 10px 32px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td width="50%" style="padding:0 12px 18px 0;vertical-align:top;">
                <div style="background:#fffdf9;border:1px solid #eadfce;border-radius:16px;padding:20px;min-height:160px;">
                  <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#9a7b46;margin-bottom:12px;">Adresse de livraison</div>
                  <div style="font-size:14px;line-height:1.8;color:#2b2b2b;">${shippingAddressHtml || '<em style="color:#7a7066;">Aucune adresse de livraison fournie</em>'}</div>
                </div>
              </td>
              <td width="50%" style="padding:0 0 18px 12px;vertical-align:top;">
                <div style="background:#fffdf9;border:1px solid #eadfce;border-radius:16px;padding:20px;min-height:160px;">
                  <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#9a7b46;margin-bottom:12px;">Adresse de facturation</div>
                  <div style="font-size:14px;line-height:1.8;color:#2b2b2b;">${billingSameAsShipping ? '<span style="display:inline-block;padding:6px 10px;border-radius:999px;background:#f3ecdf;border:1px solid #e4d5bb;color:#6f5a2d;font-size:12px;">Identique à la livraison</span>' : (billingAddressHtml || '<em style="color:#7a7066;">Aucune adresse de facturation fournie</em>')}</div>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <div style="padding:4px 32px 18px 32px;">
          <div style="background:#fffdf9;border:1px solid #eadfce;border-radius:18px;overflow:hidden;">
            <div style="padding:18px 20px;background:#f7f1e6;border-bottom:1px solid #eadfce;">
              <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#9a7b46;">Articles commandés</div>
            </div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <thead>
                <tr>
                  <th align="left" style="padding:14px 20px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#7a6d5f;border-bottom:1px solid #f0e6d8;">Produit</th>
                  <th align="center" style="padding:14px 12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#7a6d5f;border-bottom:1px solid #f0e6d8;">Qty</th>
                  <th align="right" style="padding:14px 12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#7a6d5f;border-bottom:1px solid #f0e6d8;">Unit</th>
                  <th align="right" style="padding:14px 20px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#7a6d5f;border-bottom:1px solid #f0e6d8;">Total</th>
                </tr>
              </thead>
              <tbody>${itemsRowsHtml}</tbody>
            </table>
          </div>
        </div>

        <div style="padding:0 32px 18px 32px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;"><tr><td></td><td width="280">
            <div style="background:#1e1e1e;border-radius:18px;padding:20px 22px;color:#ffffff;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                <tr><td style="padding:6px 0;font-size:14px;color:#ddd4c6;">Sous-total</td><td align="right" style="padding:6px 0;font-size:14px;color:#ffffff;">€${escapeHtml(subtotal)}</td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:#ddd4c6;">Livraison</td><td align="right" style="padding:6px 0;font-size:14px;color:#ffffff;">€${escapeHtml(shipping)}</td></tr>
                <tr><td colspan="2" style="padding:6px 0 0 0;"><div style="border-top:1px solid rgba(255,255,255,0.15);margin-top:8px;"></div></td></tr>
                <tr><td style="padding:14px 0 4px 0;font-size:16px;font-weight:bold;color:#ffffff;">Total payé</td><td align="right" style="padding:14px 0 4px 0;font-size:20px;font-weight:bold;color:#f0c36a;">€${escapeHtml(total)}</td></tr>
              </table>
            </div>
          </td></tr></table>
        </div>

        <div style="padding:0 32px 30px 32px;">
          <div style="background:#faf7f1;border:1px dashed #d8c4a1;border-radius:18px;padding:20px;">
            <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#9a7b46;margin-bottom:10px;">Checklist interne</div>
            <div style="font-size:14px;line-height:1.9;color:#2b2b2b;">□ Vérifier le format et le statut encadré / non encadré<br/>□ Vérifier l’adresse de livraison et le pays de destination<br/>□ Préparer l’emballage adapté<br/>□ Joindre ou vérifier la facture<br/>□ Lancer la préparation / expédition</div>
          </div>
        </div>
      </div>
      <div style="text-align:center;font-size:12px;color:#8a7d70;padding:18px 10px 4px 10px;line-height:1.7;">ATIP Textile — Internal operational alert<br/>Cet email est destiné au suivi interne des commandes.</div>
    </div>
  </div>`;

  const textContent = [
    'ATIP TEXTILE — ALERTE COMMANDE INTERNE',
    '',
    `Order ID: ${paymentId}`,
    `Date: ${dateStr}`,
    `Paiement: ${paymentMethod}`,
    `Total payé: €${total}`,
    `Pays de destination: ${destinationCountry}`,
    '',
    'CLIENT',
    `Nom: ${customerName}`,
    `Email: ${customerEmail || 'N/A'}`,
    `Téléphone: ${customerPhone || 'N/A'}`,
    '',
    'ADRESSE DE LIVRAISON',
    formatContactBlockText(shippingInfo) || 'Aucune adresse de livraison fournie',
    '',
    'ADRESSE DE FACTURATION',
    billingSameAsShipping ? 'Identique à la livraison' : (formatContactBlockText(billingInfo) || 'Aucune adresse de facturation fournie'),
    '',
    'ARTICLES COMMANDÉS',
    productsText,
    '',
    `Sous-total: €${subtotal}`,
    `Livraison: €${shipping}`,
    `Total payé: €${total}`,
  ].join('\n');

  await apiInstance.sendTransacEmail({
    sender: { name: 'ATIP-Textile', email: 'orders@atip-textile.com' },
    to: [{ email: adminEmail, name: 'ATIP Orders' }],
    subject: `ATIP Textile — New Confirmed Order • ${paymentId}`,
    htmlContent,
    textContent,
    ...(invoiceAttachment ? { attachment: invoiceAttachment } : {}),
  });
}

async function sendOrderEmails({ email, paymentId, emailItems, totalCents, paymentMethod, customer }) {
  const jobs = [];

  if (email) {
    jobs.push(
      sendOrderConfirmationEmail({ email, paymentId, emailItems, totalCents })
        .catch((e) => console.error('Customer confirmation email failed:', e?.message || e))
    );
  }

  jobs.push(
    sendAdminOrderAlertEmail({ paymentId, paymentMethod, emailItems, totalCents, customer })
      .catch((e) => console.error('Admin order alert email failed:', e?.message || e))
  );

  await Promise.all(jobs);
}

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.paypal.com';

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are missing on the server.');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await axios.post(
    `${baseUrl}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.access_token;
}

async function createPayPalOrder({ cartItems, email }) {
  const { emailItems, totalCents } = buildServerCartItems(cartItems);
  const accessToken = await getPayPalAccessToken();
  const baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.paypal.com';

  const response = await axios.post(
    `${baseUrl}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: `ATIP-${Date.now()}`,
        custom_id: email || 'guest',
        amount: {
          currency_code: 'EUR',
          value: (totalCents / 100).toFixed(2),
        },
        description: 'ATIP-Textile order',
      }],
      application_context: {
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return { orderID: response.data.id, emailItems, totalCents };
}

async function capturePayPalOrder({ orderID, cartItems, email, customer }) {
  const { emailItems, totalCents } = buildServerCartItems(cartItems);
  const accessToken = await getPayPalAccessToken();
  const baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.paypal.com';

  const response = await axios.post(
    `${baseUrl}/v2/checkout/orders/${orderID}/capture`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const capture = response.data?.purchase_units?.[0]?.payments?.captures?.[0];
  const captureId = capture?.id || orderID;

  await sendOrderEmails({
    email,
    paymentId: captureId,
    emailItems,
    totalCents,
    paymentMethod: 'PayPal',
    customer,
  });

  return { raw: response.data, captureId, totalCents };
}

app.get('/paypal/config', (req, res) => {
  if (!process.env.PAYPAL_CLIENT_ID) {
    return res.status(500).json({ error: 'PAYPAL_CLIENT_ID is missing on the server.' });
  }

  return res.status(200).json({ clientId: process.env.PAYPAL_CLIENT_ID });
});

app.post('/paypal/create-order', async (req, res) => {
  try {
    const { cartItems, email } = req.body;
    const { orderID, totalCents } = await createPayPalOrder({ cartItems, email });
    return res.status(200).json({ orderID, amount: (totalCents / 100).toFixed(2) });
  } catch (error) {
    console.error('❌ PayPal create-order error:', error?.response?.data || error?.message || error);
    return res.status(500).json({ success: false, error: error?.response?.data?.message || error.message || 'Unable to create PayPal order.' });
  }
});

app.post('/paypal/capture-order', async (req, res) => {
  try {
    const { orderID, cartItems, email, customer } = req.body;
    if (!orderID) {
      return res.status(400).json({ success: false, error: 'Missing orderID.' });
    }

    const captured = await capturePayPalOrder({ orderID, cartItems, email, customer });
    return res.status(200).json({
      success: true,
      orderID,
      captureId: captured.captureId,
      paypalOrder: captured.raw,
    });
  } catch (error) {
    console.error('❌ PayPal capture-order error:', error?.response?.data || error?.message || error);
    return res.status(500).json({ success: false, error: error?.response?.data?.message || error.message || 'Unable to capture PayPal order.' });
  }
});

app.post('/process-payment', async (req, res) => {
  const { sourceId, idempotencyKey, email, cartItems, customer } = req.body;

  try {
    const { emailItems, totalCents } = buildServerCartItems(cartItems);

    // ✅ 2) Paiement Square (maintenant totalCents existe)
    const { result } = await paymentsApi.createPayment({
      sourceId,
      idempotencyKey,
      amountMoney: { amount: totalCents, currency: 'EUR' },
      note: 'Achat ATIP Textile - Mode Production',
    });


    const paymentId = result.payment.id;


// ✅ 3) Emails client + interne (ne bloquent pas le paiement)
try {
  await sendOrderEmails({
    email,
    paymentId,
    emailItems,
    totalCents,
    paymentMethod: 'Square',
    customer,
  });
} catch (e) {
  console.error('Brevo emails failed:', e?.message || e);
}

    // ✅ 4) Réponse paiement
    const safePayment = JSON.parse(JSON.stringify(result.payment, (k, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ));


    return res.status(200).json({ success: true, payment: safePayment });


  } catch (error) {
    console.error("❌ Erreur /process-payment:", error?.errors || error?.message || error);
    const errorMessage = error?.errors ? error.errors[0].detail : (error.message || "Erreur interne");
    return res.status(500).json({ success: false, error: errorMessage });
  }
});








// ==========================================
// 🤖 PROXY GEMINI (TON CODE ORIGINAL)
// ==========================================
const proxyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});




app.use('/api-proxy', proxyLimiter);




app.use('/api-proxy', async (req, res, next) => {
    if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
        return next();
    }
    try {
        const targetPath = req.url.startsWith('/') ? req.url.substring(1) : req.url;
        const apiUrl = `${externalApiBaseUrl}/${targetPath}`;
        const outgoingHeaders = {};
        for (const header in req.headers) {
            if (!['host', 'connection', 'content-length', 'upgrade'].includes(header.toLowerCase())) {
                outgoingHeaders[header] = req.headers[header];
            }
        }
        outgoingHeaders['X-Goog-Api-Key'] = apiKey;




        const apiResponse = await axios({
            method: req.method,
            url: apiUrl,
            headers: outgoingHeaders,
            data: req.body,
            responseType: 'stream',
            validateStatus: () => true,
        });




        for (const header in apiResponse.headers) {
            res.setHeader(header, apiResponse.headers[header]);
        }
        res.status(apiResponse.status);
        apiResponse.data.pipe(res);
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ error: 'Proxy error', message: error.message });
        }
    }
});




// ==========================================
// 📁 SERVEUR DE FICHIERS STATIQUES
// ==========================================
const webSocketInterceptorScriptTag = `<script src="/public/websocket-interceptor.js" defer></script>`;
const serviceWorkerRegistrationScript = `
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load' , () => {
    navigator.serviceWorker.register('./service-worker.js').catch(e => console.error(e));
  });
}
</script>`;




app.get('/', (req, res) => {
    const indexPath = path.join(staticPath, 'index.html');
    fs.readFile(indexPath, 'utf8', (err, indexHtmlData) => {
        if (err) {
            return res.status(404).send("index.html non trouvé. Vérifiez votre dossier dist.");
        }
        let injectedHtml = indexHtmlData;
        if (injectedHtml.includes('<head>')) {
            injectedHtml = injectedHtml.replace('<head>', `<head>${webSocketInterceptorScriptTag}${serviceWorkerRegistrationScript}`);
        }
        res.send(injectedHtml);
    });
});




app.use('/public', express.static(publicPath));
app.use(express.static(staticPath));




// DÉMARRAGE : L'adresse '0.0.0.0' est cruciale pour Cloud Run
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Serveur ATIP Textile actif sur le port ${port}`);
});




// ==========================================
// ⚡ WEBSOCKETS (TON CODE ORIGINAL)
// ==========================================
const wss = new WebSocket.Server({ noServer: true });
server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
    if (pathname.startsWith('/api-proxy/')) {
        wss.handleUpgrade(request, socket, head, (clientWs) => {
            const targetPathSegment = pathname.substring('/api-proxy'.length);
            const targetGeminiWsUrl = `${externalWsBaseUrl}${targetPathSegment}?key=${apiKey}`;
            const geminiWs = new WebSocket(targetGeminiWsUrl);
            geminiWs.on('message', (msg) => clientWs.send(msg));
            clientWs.on('message', (msg) => geminiWs.send(msg));
            geminiWs.on('close', () => clientWs.close());
            clientWs.on('close', () => geminiWs.close());
        });
    } else {
        socket.destroy();
    }
});



















