document.addEventListener('DOMContentLoaded', () => { 
    const trackBtn = document.getElementById('trackBtn');
    const viewHistoryBtn = document.getElementById('viewHistoryBtn');
    const historyContainer = document.getElementById('historyContainer');
    const historyAccordions = document.querySelectorAll('#historyContainer .accordion');
    const placeOrderPanel = document.getElementById('placeOrderPanel');
    const contactUsBtn = document.getElementById('contactUsBtn');
    const contactUsPanel = document.getElementById('contactUsPanel');
    const contactForm = document.getElementById('contactForm');

    //api to get customer name from login
    const id = localStorage.getItem('custID'); 
    const cust = {custID: id};
    fetch('/api/getCustomerName', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(cust)
    })
    .then(response => response.json())
    .then(data => {
    if(data.userType == 'individual'){
        document.querySelector('.user-info h3').innerHTML = data.data;
        document.querySelector('.banner-content h1').innerHTML = 'Welcome ' + data.data;
    }
    });

    // Fetch total packages count
    fetch('/api/totalPackages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cust)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const totalPackages = data.totalPackages;

        // Fetch completed packages count
        fetch('/api/completedPackages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cust)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const completedPackages = data.completedPackages;

            // Calculate in-progress packages
            const inProgressPackages = totalPackages - completedPackages;

            // Display the results
            document.querySelector('#totalShipments h3').textContent = totalPackages;
            document.querySelector('#completedShipments h3').textContent = completedPackages;
            document.querySelector('#inProgressShipments h3').textContent = inProgressPackages;
        })
        .catch(error => {
            console.error('Error fetching completed packages:', error);
        });
    })
    .catch(error => {
        console.error('Error fetching total packages:', error);
    });

    // api to get sender name and phone
    const placeOrderBtn = document.getElementById('placeOrderBtn');

    placeOrderBtn.addEventListener('click', function() {
        fetch('/api/getSenderNamePhone', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cust)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Response data:', data);
            if (data.success) {
                document.getElementById('sender-name').value = `${data.data.firstName} ${data.data.lastName}`;
                document.getElementById('sender-phonenumber').value = data.data.phone;
            } else {
                console.error('Error:', data.message);
                alert('Failed to fetch sender details. Please try again.');
            }
        })
        .catch(error => console.error('Error:', error));
    });

    // api to place an order
    const placeOrderForm = document.getElementById('placeOrderForm');

    placeOrderForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(placeOrderForm);

        try {
            // Fetch the generated package ID
            const packageIDResponse = await fetch('/generatePackageID', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!packageIDResponse.ok) {
                throw new Error('Failed to generate package ID!');
            }

            const packageIDData = await packageIDResponse.json();
            const packageID = packageIDData.packageID;

            console.log('Generated Package ID:', packageID);

            const orderDetails = {
                packageID: packageID,
                pickupAddress: formData.get('pickupAddress'),
                deliveryAddress: formData.get('deliveryAddress'),
                size: formData.get('size'),
                fragile: formData.get('fragile') ? true : false,
                status: 'awaiting confirmation',
                custID: cust.custID
            };

            // Submit the order details
            const orderResponse = await fetch('/placeOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderDetails)
            });

            if (!orderResponse.ok) {
                throw new Error('Failed to place order!');
            }

            const data = await orderResponse.json();
            console.log('Order placed successfully:', data);

            // Display success message or perform any necessary actions
            alert(`Order placed successfully with Package ID: ${packageID}`);

            // Reload the page to reflect new data
            window.location.reload();
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        }
    });

    // Helper function to format ISO date to 'YYYY-MM-DD'
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    }

    // Helper function to format ISO time to 'HH:MM AM/PM'
    function formatTime(dateString) {
        const date = new Date(dateString);
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        return `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
    }

    viewHistoryBtn.addEventListener('click', function() {
        fetch('/api/getPastOrders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify()
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const tbody = document.getElementById('history-table-body');
            tbody.innerHTML = ''; // Clear existing rows
    
            if (data.success) {
                data.data.forEach((record, index) => {
                    const tr = document.createElement('tr');
                    tr.classList.add('accordion');
                    tr.dataset.index = index;
    
                    tr.innerHTML = `
                        <td>${record.packageID}</td>
                        <td>${formatDate(record.delivery_time)}</td>
                        <td>${formatTime(record.delivery_time)}</td>
                        <td>${record.status}</td>
                    `;
    
                    // Create the accordion content row
                    const trAccordion = document.createElement('tr');
                    trAccordion.classList.add('accordion-content');
                    trAccordion.dataset.index = index;
                    trAccordion.style.display = 'none';
    
                    trAccordion.innerHTML = `
                        <td colspan="4">
                            <div class="field-row-container">
                                <div class="field-row">
                                    <h2 class="hist-header">Package Info</h2>
                                </div>
                                <div class="field-row">
                                    <div class="field"><strong>Package ID:</strong> ${record.packageID}</div>
                                </div>
                                <div class="field-row">
                                    <div class="field"><strong>Delivery Address:</strong> ${record.delivery_address}</div>
                                    <div class="field"><strong>Delivery Date:</strong> ${formatDate(record.delivery_time)}</div>
                                </div>
                                <div class="field-row">
                                    <div class="field"><strong>Delivery Time:</strong> ${formatTime(record.delivery_time)}</div>
                                    <div class="field"><strong>Size:</strong> ${record.size}</div>
                                </div>
                                <div class="field-row">
                                    <h2 class="hist-header">Driver Info</h2>
                                </div>
                                <div class="field-row">
                                    <div class="field"><strong>Driver ID:</strong> ${record.driverID}</div>
                                    <div class="field"><strong>Driver Name:</strong> ${record.DFirstName} ${record.DLastName}</div>
                                </div>
                                <div class="field-row">
                                    <div class="field"><strong>Driver Rating:</strong> ${record.rating}</div>
                                    <div class="field"><strong>Feedback:</strong> ${record.comments}</div>
                                </div>
                                <div class="field-row">
                                    <div class="field"><strong>Status:</strong> ${record.status}</div>
                                </div>
                                <div class="field-row">
                                    ${record.rating !== 'N/A' && record.comments !== 'N/A' ?
                                        `<div>Rating already submitted.</div>` :
                                        `<button class="btn give-rating-btn">Give Driver Rating</button>
                                         <div class="rating-form" style="display:none;">
                                             <label for="rating">Rating:</label>
                                             <input type="number" id="rating-${index}" name="rating" class='field' min="1" max="5">
                                             <label for="comments">Comments:</label>
                                             <textarea id="comments-${index}" name="comments class='field'" maxlength="40"></textarea>
                                             <button class="btn submit-rating-btn">Submit Rating</button>
                                         </div>`
                                    }
                                    </div>
                                </div>
                        </td>
                    `;
    
                    // Add event listener to toggle accordion content
                    tr.addEventListener('click', function() {
                        const contentRow = document.querySelector(`.accordion-content[data-index="${this.dataset.index}"]`);
                        contentRow.style.display = contentRow.style.display === 'none' ? 'table-row' : 'none';
                    });
    
                    // Append rows to the table body
                    tbody.appendChild(tr);
                    tbody.appendChild(trAccordion);
    
                    // Function to update existing accordion with rating and comments
                    function updateAccordion(packageID, driverID, rating, comments) {
                        const accordions = document.querySelectorAll('.accordion');
                        accordions.forEach(acc => {
                            if (acc.dataset.packageId === packageID && acc.dataset.driverId === driverID) {
                                acc.querySelector('.field-row:nth-child(6) .field').innerHTML = `<strong>Driver Rating:</strong> ${rating}`;
                                acc.querySelector('.field-row:nth-child(7) .field').innerHTML = `<strong>Feedback:</strong> ${comments}`;
                                const ratingForm = acc.querySelector('.rating-form');
                                if (ratingForm) {
                                    ratingForm.style.display = 'none';
                                }
                            }
                        });
                    }

                    // Add event listener to show the rating form
                    const giveRatingBtn = trAccordion.querySelector('.give-rating-btn');
                    if (giveRatingBtn) {
                        giveRatingBtn.addEventListener('click', function() {
                            const ratingForm = trAccordion.querySelector('.rating-form');
                            if (ratingForm) {
                                ratingForm.style.display = 'block';
                                giveRatingBtn.style.display = 'none';
                            }
                        });
                    }
        
                    // Add event listener to submit the rating
                    const submitRatingBtn = trAccordion.querySelector('.submit-rating-btn');
                    if(submitRatingBtn){

                    }
                    submitRatingBtn.addEventListener('click', function() {
                        const rating = trAccordion.querySelector(`#rating-${index}`).value;
                        const comments = trAccordion.querySelector(`#comments-${index}`).value;
    
                        fetch('/api/submitRating', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                packageID: record.packageID,
                                driverID: record.driverID,
                                rating: rating,
                                comments: comments
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                alert('Rating submitted successfully');
                                updateAccordion(record.packageID, record.driverID, rating, comments);
                            } else {
                                alert('Failed to submit rating');
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('An error occurred while submitting the rating.');
                        });
                    });
                });
            } else {
                alert('Failed to fetch past order records.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });    

    // Event listener for tracking button click
    trackBtn.addEventListener('click', function() {
        // Retrieve tracking number from input field
        const trackingNumber = document.getElementById('trackingInput').value;

        // Check if tracking number is provided
        if (trackingNumber === '') {
            alert('Please enter a tracking number');
            return;
        }

        // Fetch package details from backend
        fetch('/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ trackingNumber })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const messageElem = document.getElementById('message');
            const tbody = document.getElementById('package-details-body');

            if (data.success) {
                // Clear any previous message
                messageElem.textContent = '';

                // Populate package details in table row
                tbody.innerHTML = `
                    <tr>
                        <td>${data.data.packageID}</td>
                        <td>${data.data.driverName}</td>
                        <td>${data.data.driverPhone}</td>
                        <td>${data.data.plateNo}</td>
                        <td>${data.data.status}</td>
                    </tr>`;
            } else {
                tbody.innerHTML = '<tr><td colspan="5">Package was not found!</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error fetching package details. Please try again');
        });
    });
    
    // Attach click event listeners to view history button
    viewHistoryBtn.addEventListener('click', () => {
        viewHistoryBtn.classList.toggle('active');
        historyContainer.style.display = historyContainer.style.display === 'block' ? 'none' : 'block';
    });

    // Attach click event listeners to history accordions
    historyAccordions.forEach((accordion) => {
        accordion.addEventListener('click', () => {
            const panel = accordion.nextElementSibling;

            // Toggle the display of the accordion content
            if (panel.style.display === 'table-row') {
                panel.style.display = 'none';
                accordion.classList.remove('active');
            } else {
                panel.style.display = 'table-row';
                accordion.classList.add('active');
            }
        });
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

    // contactForm.addEventListener('submit', (event) => {
    //     event.preventDefault();
    //     const formData = new FormData(contactForm);

    //     const customer = {
    //         firstName: formData.get('first-name'),
    //         lastName: formData.get('last-name'),
    //         email: formData.get('email'),
    //         phone: formData.get('phone'),
    //         message: formData.get('message'),
    //     };

    //     fetch("/contactUs", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json" 
    //         },
    //         body: JSON.stringify(customer)
    //     }); 
    // });
});

