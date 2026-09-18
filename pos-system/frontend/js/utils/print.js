// print.js

export function printReceipt(cart, total, attendantName) {
    const date = new Date().toLocaleString();
    
    let itemsHTML = '';
    cart.forEach(item => {
        itemsHTML += `
            <tr>
                <td>${item.qty}x ${item.name}</td>
                <td style="text-align: right;">₦${(item.price * item.qty).toLocaleString()}</td>
            </tr>
        `;
    });

    const headerHTML = `
        <div class="receipt-header">
            <img src="assets/logo.png" alt="RamsyPOS">
            <h2 style="margin: 0; font-size: 18px;">Ramsy Paradise</h2>
            <p style="margin: 2px 0;">Hotel & Suites</p>
            <p style="margin: 2px 0;">Maitama 2, Berger Quarry Road, FCT-Abuja</p>
            <p style="margin: 2px 0;">Tel: +234 906 155 5082</p>
            <p style="margin: 5px 0 0 0;">${date}</p>
        </div>
    `;

    const itemsTable = `
        <table class="receipt-items">
            ${itemsHTML}
        </table>
    `;

    const totalDiv = `
        <div class="receipt-total">
            <span>TOTAL:</span>
            <span>₦${total.toLocaleString()}</span>
        </div>
    `;

    // 1. Customer Copy
    const customerCopy = `
        <div class="receipt-copy">
            ${headerHTML}
            ${itemsTable}
            ${totalDiv}
            <div class="receipt-footer">
                <p style="margin-top: 10px; font-weight: bold;">Thank you for patronizing Ramsy Paradise Hotel & Suites!</p>
                <p>Attended by: ${attendantName}</p>
            </div>
        </div>
    `;

    // 2. Attendant Copy (No Thank You message)
    const attendantCopy = `
        <div class="receipt-copy">
            ${headerHTML}
            ${itemsTable}
            ${totalDiv}
            <div class="receipt-footer">
                <p>Attended by: ${attendantName}</p>
                <p style="margin-top: 10px; font-weight: bold;">*** ATTENDANT COPY ***</p>
            </div>
        </div>
    `;

    // Combine and inject
    const printArea = document.getElementById('print-area');
    printArea.innerHTML = customerCopy + attendantCopy;
    
    // Trigger print
    window.print();
    
    // Clear print area
    printArea.innerHTML = '';
}
