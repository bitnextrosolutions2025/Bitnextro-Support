import express from "express";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const billingcopyRoute = express.Router();

// Helper function to convert numbers to Indian Rupee Words
function numberToWords(num) {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if ((num = num.toString()).length > 9) return 'overflow';
    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'And ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Rupees Only' : 'Rupees Only';
    return str.trim();
}

// Helper to generate the exact HTML Template
const generateHTML = (data) => {
    // --- Configuration & Fallbacks ---
    const companyName = "BITNEXTRO SOLUTIONS PVT. LTD.";
    const companyLogo = "https://res.cloudinary.com/dcvejeszo/image/upload/v1772130931/user_profiles/iasw8ry0br2wgwprakxg.jpg";
    const authStamp = "https://res.cloudinary.com/dcvejeszo/image/upload/v1772137306/user_profiles/a9siliu0rbff2z4p8o5k.png";
    
    // Fallbacks from your image requirements
    const compAddress = "5, Park Lane, Parkstreet, Kolkata, West Bengal, 700016";
    const compGST = "19AAOCB2081P1ZO";
    const compPhone = "+91 9330855877";
    const bankDetails = {
        bank: "UNION BANK OF INDIA",
        AH:"BITNEXTRO SOLUTIONS PRIVATE LIMITED",
        acc: "436901010039787",
        ifsc: "UBIN0543691",
        branch: "CANNING STREET - KOLKATA"
    };

    // --- Calculations ---
    let totalTaxable = 0;
    let totalTaxAmount = 0;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const productsHtml = data.products.map((p, index) => {
        const rate = parseFloat(p.rate);
        const qty = parseInt(p.quantity);
        const taxable = rate * qty;
        
        let taxPercent = data.isGstApplied ? 18 : 0;
        let taxVal = data.isGstApplied ? (taxable * 0.18) : 0;
        let finalAmount = taxable + taxVal;

        totalTaxable += taxable;
        totalTaxAmount += taxVal;

        return `
            <tr class="border-b border-black text-xs text-center h-8">
                <td class="border-r border-black p-1">${index + 1}</td>
                <td class="border-r border-black p-1 text-left font-semibold">${p.name}</td>
                <td class="border-r border-black p-1">${p.hsn || '-'}</td>
                <td class="border-r border-black p-1 text-right">${rate.toFixed(2)}</td>
                <td class="border-r border-black p-1">${qty}</td>
                <td class="border-r border-black p-1 text-right">${taxable.toFixed(2)}</td>
                <td class="border-r border-black p-1 text-right">${data.isGstApplied ? taxVal.toFixed(2) + '<br><span class="text-[10px]">(18%)</span>' : '0.00'}</td>
                <td class="p-1 text-right">${finalAmount.toFixed(2)}</td>
            </tr>
        `;
    }).join('');

    const grandTotal = totalTaxable + totalTaxAmount;
    const amountInWords = numberToWords(Math.round(grandTotal));
    
    // Generate UPI QR dynamically based on amount
    const upiString = `upi://pay?pa=81153201@ubin&pn=${encodeURIComponent(companyName)}&am=${grandTotal.toFixed(2)}&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(upiString)}`;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { 
                font-family: 'Inter', sans-serif; 
                background: white; 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important;
            }
            .border-black { border-color: #000 !important; }
            .bg-gray-100 { background-color: #f3f4f6 !important; }
            .text-blue-600 { color: #2563eb !important; }
        </style>
    </head>
    <body class="p-6">
        <div class="border border-black max-w-4xl mx-auto flex flex-col">
            
            <!-- Header Row -->
            <div class="flex justify-between items-center border-b border-black px-2 py-1 text-xs font-bold uppercase tracking-wider">
                <div class="w-1/3"></div>
                <div class="w-1/3 text-center text-blue-600 text-sm">TAX INVOICE</div>
                <div class="w-1/3 text-right">DUPLICATE RECIPIENT</div>
            </div>

            <!-- Top Details Grid -->
            <div class="flex border-b border-black">
                <!-- Company Info -->
                <div class="w-1/2 border-r border-black p-3 flex items-start gap-3">
                    <img src="${companyLogo}" alt="Logo" class="w-16 h-16 object-contain">
                    <div class="text-[11px] leading-tight">
                        <h2 class="font-bold text-sm mb-1">${companyName}</h2>
                        <p><strong>GSTIN: ${compGST}</strong></p>
                        <p>${compAddress}</p>
                        <p>Mobile: ${compPhone}</p>
                        <p>Email: info@bitnextro.com</p>
                        <p>Website: www.bitnextro.com</p>
                    </div>
                </div>
                
                <!-- Invoice Info & Dates -->
                <div class="w-1/2 flex flex-col">
                    <div class="flex border-b border-black h-1/2">
                        <div class="w-1/2 border-r border-black p-2 text-[11px]">
                            <p class="text-gray-600 mb-1">Invoice #:</p>
                            <p class="text-sm">${data.invoiceNumber || 'N/A'}</p>
                        </div>
                        <div class="w-1/2 p-2 text-[11px]">
                            <p class="text-gray-600 mb-1">Invoice Date:</p>
                            <p class="">${today}</p>
                        </div>
                    </div>
                    <div class="flex h-1/2">
                        <div class="w-1/2 border-r border-black p-2 text-[11px]">
                            <p class="text-gray-600 mb-1">Place of Supply:</p>
                            <p class=" uppercase">${data.supplyPlace || 'N/A'}</p>
                        </div>
                        <div class="w-1/2 p-2 text-[11px]">
                            <p class="text-gray-600 mb-1">Due Date:</p>
                            <p class="">${today}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Customer Details Row -->
            <div class="flex border-b border-black">
                <div class="w-1/2 border-r border-black p-2 text-[11px] leading-tight">
                    <p class="font-bold mb-1">CUSTOMER DETAILS:</p>
                    <p>Name: ${data.user}</p> 
                    <p>Email: ${data.email}</p> 
                    <p>GSTIN: ${data.gstno}</p> 
                    <p class="font-bold mt-1">BILLING ADDRESS:</p>
                    <p>${data.billingAddress || 'N/A'}</p>
                </div>
                <div class="w-1/2 p-2 text-[11px] leading-tight">
                    <p class="font-bold mb-1">SHIPPING ADDRESS</p>
                     <p>${data.shippingAddress || 'N/A'}</p>
                </div>
            </div>

            <!-- Products Table -->
            <table class="w-full border-b border-black border-collapse">
                <thead>
                    <tr class="border-b border-black text-[11px] font-bold">
                        <th class="border-r border-black p-1 w-8">#</th>
                        <th class="border-r border-black p-1 text-left w-64">Item</th>
                        <th class="border-r border-black p-1">HSN/SAC</th>
                        <th class="border-r border-black p-1 text-right">Rate/Item</th>
                        <th class="border-r border-black p-1">Qty</th>
                        <th class="border-r border-black p-1 text-right">Taxable Value</th>
                        <th class="border-r border-black p-1 text-right">Tax Amount</th>
                        <th class="p-1 text-right w-28">Amount</th>
                    </tr>
                </thead>
                <tbody class="align-top">
                    ${productsHtml}
                    <!-- Empty filler space to match the image height style -->
                    <tr class="h-40">
                        <td class="border-r border-black"></td><td class="border-r border-black"></td>
                        <td class="border-r border-black"></td><td class="border-r border-black"></td>
                        <td class="border-r border-black"></td><td class="border-r border-black"></td>
                        <td class="border-r border-black"></td><td></td>
                    </tr>
                    
                    <!-- Totals Section integrated directly into table for perfect column alignment -->
                    <tr class="border-t border-black text-xs">
                        <td colspan="5" class="border-r border-black p-1 px-2 font-medium text-left">Total Items / Qty : ${data.products.length} / ${data.products.reduce((acc, p) => acc + parseFloat(p.quantity || 0), 0)}</td>
                        <td colspan="2" class="border-r border-black p-1 font-bold text-right">Taxable Amount</td>
                        <td class="p-1 font-bold text-right">₹${totalTaxable.toFixed(2)}</td>
                    </tr>
                    ${data.isGstApplied ? `
                    <tr class="border-t border-black text-xs">
                        <td colspan="7" class="border-r border-black p-1 text-right">SGST 9.0%</td>
                        <td class="p-1 text-right">₹${(totalTaxAmount/2).toFixed(2)}</td>
                    </tr>
                    <tr class="border-t border-black text-xs">
                        <td colspan="7" class="border-r border-black p-1 text-right">CGST 9.0%</td>
                        <td class="p-1 text-right">₹${(totalTaxAmount/2).toFixed(2)}</td>
                    </tr>
                    ` : ''}
                    <tr class="border-t border-black font-bold text-sm bg-gray-100">
                        <td colspan="7" class="border-r border-black p-1 text-right uppercase">Total</td>
                        <td class="p-1 text-right text-base">₹${grandTotal.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Amount Due Status -->
            ${data.isPaymentdone?`<div class="text-right text-[11px] font-bold text-green-600 p-1 border-b border-black">
                
                <span class="inline-flex items-center gap-1"> <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg> Amount Paid </span>
                </div>`:`<div class="text-right text-[11px] font-bold text-red-600 p-1 border-b border-black">
            
                <span class="inline-flex items-center gap-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg>
                    Amount Due
                </span>
            </div>`}

            <!-- Footer Grid (Bank, QR, Sign) -->
            <div class="flex border-b border-black">
                <div class="w-1/3 border-r border-black p-2 text-[11px] leading-relaxed">
                    <p class="font-bold mb-1">Bank Details:</p>
                    <div class="flex"><span class="w-20">Bank:</span><strong>${bankDetails.bank}</strong></div>
                    <div class="flex"><span class="w-20">Account #:</span <strong>${bankDetails.acc}</strong></div>
                    <div class="flex"><span class="w-20">IFSC:</span> <strong>${bankDetails.ifsc}</strong></div>
                    <div class="flex"><span class="w-20">Branch:</span> <strong>${bankDetails.branch}</strong></div>
                </div>
                   <div class="w-1/3 border-r border-black p-2 flex flex-col items-center justify-center">
                    <p class="text-[11px] w-full text-left font-bold mb-1">Pay using UPI:</p>
                    <img src="${qrUrl}" alt="UPI QR" class="w-20 h-20 object-contain mix-blend-multiply">
                </div>
                <div class="w-1/3 p-2 flex flex-col items-end justify-between text-[11px]">
                    <p class="font-bold text-gray-600">For ${companyName.toUpperCase()}</p>
                    ${data.isStampApplied ? `<img src="${authStamp}" alt="Stamp" class="w-24 h-24 object-contain opacity-90 my-2">` : '<div class="h-24"></div>'}
                    <p class="font-medium text-gray-500">Authorized Signatory</p>
                </div>
            </div>

            <!-- Terms and Notes -->
            <div class="flex text-[10px] h-28">
                <div class="w-1/3 border-r border-black p-2">
                    <p class="font-bold mb-1">Notes:</p>
                    <p>Thank you for the Business</p>
                </div>
                <div class="p-2">
                    <p class="font-bold mb-1">Terms and Conditions:</p>
                    <ol class="list-decimal pl-4 leading-relaxed">
                        <li>All services will be provided as per the scope mentioned in this invoice.</li>
                        <li>Work delivery and credential handover will be completed after full payment.</li>
                        <li>No refunds will be applicable once services are activated.</li>
                        <li>Any additional requirements beyond the invoice scope will be charged separately.</li>
                    </ol>
                </div>
            </div>
        </div>
        
        <!-- Page End -->
        <div class="max-w-4xl mx-auto mt-2 text-[10px] flex justify-between text-gray-600 font-medium">
            <span>Page 1 / 1</span>
            <span>This is a digitally signed document.</span>
        </div>
    </body>
    </html>
    `;
};

// --- API ROUTE ---
billingcopyRoute.post("/billing-work", async (req, res) => { 
    try {
        const alldata = req.body;
        
        if (!alldata) {
            return res.status(400).json({ "message": "Missing alldata" });
        }

        console.log("Generating invoice for:", alldata.invoiceNumber);

        // 1. Generate HTML string based on req.body
        const htmlContent = generateHTML(alldata);

        // 2. Launch Puppeteer (Vercel Serverless Configuration)
        const browser = await puppeteer.launch({
            args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });
        
        const page = await browser.newPage();
        
        // Wait until all network requests (like images/Tailwind CDN) are finished
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // 3. Generate PDF Buffer
        const pdfBuffer = await page.pdf({ 
            format: 'A4', 
            printBackground: true, // Crucial for showing Tailwind background colors
            margin: { top: '20px', bottom: '20px' }
        });

        await browser.close();

        // 4. Send PDF Buffer to Frontend
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${alldata.invoiceNumber || 'invoice'}.pdf"`,
            'Content-Length': pdfBuffer.length
        });

        // Use .end() or .send() to pass the raw buffer back
        return res.end(pdfBuffer);

    } catch (error) {
        console.error("PDF Generation Error: ", error);
        return res.status(500).json({ "message": "Failed to generate PDF", error: error.message });
    }
});

export default billingcopyRoute;