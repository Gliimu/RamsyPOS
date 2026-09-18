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

    const receiptHTML = `
        <div class="receipt-header">
            <h2>RamsyPOS</h2>
            <p>Maitama 2, Berger Qwarry Road, FCT-ABJ</p>
            <p>Tel: 080123456789</p>
            <p>${date}</p>
        </div>
        <table class="receipt-items">
            ${itemsHTML}
        </table>
        <div class="receipt-total">
            <span>TOTAL:</span>
            <span>₦${total.toLocaleString()}</span>
        </div>
        <div class="receipt-footer">
            <p>Attended by: ${attendantName}</p>
            <p>Thank you for your patronage!</p>
        </div>
    `;

    // Inject into hidden print area
    const printArea = document.getElementById('print-area');
    printArea.innerHTML = receiptHTML;
    
    // Trigger print
    window.print();
    
    // Clear print area after printing
    printArea.innerHTML = '';
}
