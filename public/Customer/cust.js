document.addEventListener('DOMContentLoaded', () => { 
    const trackBtn = document.getElementById('trackBtn');
    const viewButtons = document.querySelectorAll(".btn-view");
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const placeOrderPanel = document.getElementById('placeOrderPanel');
    const placeOrderForm = document.getElementById('placeOrderForm');

    const contactUsBtn = document.getElementById('contactUsBtn');
    const contactUsPanel = document.getElementById('contactUsPanel');
    const contactForm = document.getElementById('contactForm');


    trackBtn.addEventListener('click', function() {
        const trackingNumber = document.getElementById('trackingInput').value;
        fetch('/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ trackingNumber })
        })
        .then(response => response.json())
        .then(data => {
            const messageElem = document.getElementById('message');
            const tbody = document.getElementById('package-details-body');
            if (data.success) {
                messageElem.textContent = '';
                tbody.innerHTML = `
                    <tr>
                        <td>${data.package.packageID}</td>
                        <td>${data.package.recipientName}</td>
                        <td>${data.package.driverId}</td>
                        <td>${data.package.driverName}</td>
                        <td>${data.package.status}</td>
                        <td class="action-buttons">
                            <button class="btn btn-view">View</button>
                            <button class="btn btn-update">Update</button>
                            <button class="btn btn-delete">Delete</button>
                        </td>
                    </tr>
                    <tr class="accordion-content">
                        <td colspan="6">
                            <div class="field-row">
                                <div class="field"><strong>Package ID:</strong> ${data.package.packageID}</div>
                                <div class="field"><strong>Recipient Name:</strong> ${data.package.recipientName}</div>
                            </div>
                            <div class="field-row">
                                <div class="field"><strong>Pickup Time:</strong> ${data.package.pickupTime}</div>
                                <div class="field"><strong>Pickup Address:</strong> ${data.package.pickupAddress}</div>
                            </div>
                            <div class="field-row">
                                <div class="field"><strong>Delivery Address:</strong> ${data.package.deliveryAddress}</div>
                                <div class="field"><strong>Driver ID:</strong> ${data.package.driverId}</div>
                            </div>
                            <div class="field-row">
                                <div class="field"><strong>Driver Name:</strong> ${data.package.driverName}</div>
                                <div class="field"><strong>Size:</strong> ${data.package.size}</div>
                            </div>
                            <div class="field-row">
                                <div class="field"><strong>Vehicle Type:</strong> ${data.package.vehicleType}</div>
                                <div class="field"><strong>Status:</strong> ${data.package.status}</div>
                            </div>
                        </td>
                    </tr>
                `;
            } else {
                messageElem.textContent = 'Tracking ID does not match any records.';
                tbody.innerHTML = '<tr id="empty-row"><td colspan="6">No package details</td></tr>';
            }
        })
        .catch(error => console.error('Error:', error));
    });

    function toggleViewAccordion(event) {
        const button = event.target;
        const viewPanel = button.closest('tr').nextElementSibling;
        const updatePanel = viewPanel.nextElementSibling;

        if (viewPanel.style.display === "table-row") {
            viewPanel.style.display = "none";
            button.classList.remove("active");
        } else {
            viewPanel.style.display = "table-row";
            updatePanel.style.display = "none"; // Hide the update panel
            button.classList.add("active");
        }
    }

    // Attach click event listeners to view buttons
    viewButtons.forEach(button => {
        button.addEventListener("click", toggleViewAccordion);
    });

    function toggleAccordion(panel) {
        if (panel.style.display === 'block') {
            panel.style.display = 'none';
        } else {
            panel.style.display = 'block';
        }
    }

    placeOrderBtn.addEventListener('click', () => {
        toggleAccordion(placeOrderPanel);
    });

    contactUsBtn.addEventListener('click', () => {
        toggleAccordion(contactUsPanel);
    });

    placeOrderForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(placeOrderForm);

        const package = {
            senderName: formData.get('sender-name'),
            recipientName: formData.get('recipient-name'),
            senderPhone: formData.get('sender-phonenumber'),
            recipientPhone: formData.get('recipient-phonenumber'),
            senderEmail: formData.get('sender-email'),
            pickupAddress: formData.get('pickupAddress'),
            deliveryAddress: formData.get('deliveryAddress'),
            size: formData.get('size'),
            fragile: formData.get('fragile') ? true : false,
        };

        try {
            const response = await fetch('/placeOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(package)
            });

            if (!response.ok) {
                throw new Error('Failed to place order.');
            }

            // Reload the page to reflect new data
            window.location.reload();
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        }
    });

    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(contactForm);

        const customer = {
            firstName: formData.get('first-name'),
            lastName: formData.get('last-name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message'),
        };

        fetch("/contactUs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(customer)
        }); 
    });
});
