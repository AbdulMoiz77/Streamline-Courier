document.addEventListener('DOMContentLoaded', () => {
    const currentDate = new Date().toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });
    document.querySelectorAll('#currentDate').forEach(span => span.textContent = currentDate);

    // Function to fetch and display today's pickups
    const fetchTodaysPickups = () => {
        fetch('http://localhost:3000/api/todays-pickups')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched pickups:', data);
                const tableBody = document.querySelector('#pickupList tbody');
                tableBody.innerHTML = ''; // Clear existing rows

                if (data.length === 0) {
                    const row = document.createElement('tr');
                    const cell = document.createElement('td');
                    cell.colSpan = 5;
                    cell.textContent = 'No pickups for today';
                    row.appendChild(cell);
                    tableBody.appendChild(row);
                } else {
                    data.forEach(pkg => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td><a href="#" class="package-id" data-id="${pkg.packageID}">${pkg.packageID}</a></td>
                            <td>${pkg.pickup_address}</td>
                            <td>${formatDateTime(pkg.pickup_time)}</td>
                            <td>${pkg.status}</td>
                            <td>${pkg.fragile ? 'Yes' : 'No'}</td>
                        `;
                        tableBody.appendChild(row);
                    });

                    // Attach click event to package IDs
                    document.querySelectorAll('.package-id').forEach(link => {
                        link.addEventListener('click', event => {
                            event.preventDefault();
                            const packageID = event.target.getAttribute('data-id');
                            confirmPickupAndMoveToDelivery(packageID);
                        });
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching pickups:', error);
            });
    };

    // Function to confirm pickup and move package to delivery
    const confirmPickupAndMoveToDelivery = (packageID) => {
        const confirmPickup = confirm(`Confirm pickup of package ${packageID}?`);
        if (confirmPickup) {
            // Update status to 'ready for delivery' in backend
            fetch(`http://localhost:3000/api/confirm-pickup/${packageID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'ready for delivery' }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Package status updated:', data);
                // Remove package from today's pickups table
                const packageRow = document.querySelector(`.package-id[data-id="${packageID}"]`).closest('tr');
                packageRow.remove();

                // Add package to packages ready for delivery table
                const deliveryTableBody = document.querySelector('#deliveryList tbody');
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td><a href="#" class="package-id" data-id="${packageID}">${packageID}</a></td>
                    <td>${data.delivery_address}</td>
                    <td>${formatDateTime(data.delivery_time)}</td>
                    <td>${data.status}</td>
                `;
                deliveryTableBody.appendChild(newRow);

                // Reattach click event to the newly added package ID
                newRow.querySelector('.package-id').addEventListener('click', event => {
                    event.preventDefault();
                    const packageID = event.target.getAttribute('data-id');
                    confirmDelivery(packageID);
                });
            })
            .catch(error => {
                console.error('Error updating package status:', error);
            });
        }
    };

    // Function to confirm delivery
    const confirmDelivery = (packageID) => {
        const confirmDelivery = confirm(`Confirm delivery of package ${packageID}?`);
        if (confirmDelivery) {
            // Update status to 'delivered' in backend
            fetch(`http://localhost:3000/api/confirm-delivery/${packageID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'delivered' }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Package status updated:', data);
                // Remove package from packages ready for delivery table
                const packageRow = document.querySelector(`#deliveryList .package-id[data-id="${packageID}"]`).closest('tr');
                packageRow.remove();
            })
            .catch(error => {
                console.error('Error updating package status:', error);
            });
        }
    };

    // Fetch and display packages ready for delivery
    const fetchPackagesReadyForDelivery = () => {
        fetch('http://localhost:3000/api/packages-ready-for-delivery')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched packages ready for delivery:', data);
                const tableBody = document.querySelector('#deliveryList tbody');
                tableBody.innerHTML = ''; // Clear existing rows

                if (data.length === 0) {
                    const row = document.createElement('tr');
                    const cell = document.createElement('td');
                    cell.colSpan = 4;
                    cell.textContent = 'No packages ready for delivery';
                    row.appendChild(cell);
                    tableBody.appendChild(row);
                } else {
                    data.forEach(pkg => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td><a href="#" class="package-id" data-id="${pkg.packageID}">${pkg.packageID}</a></td>
                            <td>${pkg.delivery_address}</td>
                            <td>${formatDateTime(pkg.delivery_time)}</td>
                            <td>${pkg.status}</td>
                        `;
                        tableBody.appendChild(row);
                    });

                    // Attach click event to package IDs for delivery confirmation
                    document.querySelectorAll('#deliveryList .package-id').forEach(link => {
                        link.addEventListener('click', event => {
                            event.preventDefault();
                            const packageID = event.target.getAttribute('data-id');
                            confirmDelivery(packageID);
                        });
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching packages ready for delivery:', error);
            });
    };

    // Utility function to format date and time
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Fetch today's pickups on page load
    fetchTodaysPickups();
    // Fetch packages ready for delivery on page load
    fetchPackagesReadyForDelivery();
});
