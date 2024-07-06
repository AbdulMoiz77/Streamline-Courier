document.addEventListener('DOMContentLoaded', () => { 
    const contactUsBtn = document.getElementById('contactUsBtn');
    const contactUsPanel = document.getElementById('contactUsPanel');

    function toggleAccordion(panel) {
        // Toggle the display of the accordion content
        if (panel.style.display === 'block') {
            panel.style.display = 'none';
        } else {
            panel.style.display = 'block';
        }
    }

    // Toggle accordion for Contact Us section
    contactUsBtn.addEventListener('click', () => {
        toggleAccordion(contactUsPanel);
    });
});

var firstName = document.querySelector('#first-name');
var lastName = document.querySelector('#last-name');
var email = document.querySelector('#email');
var phone = document.querySelector('#phone');
var message = document.querySelector('#message');
var button = document.querySelector('.sub-btn');

button.addEventListener("click", () => {
    var contactObj = {
        firstName : firstName.value,
        lastName : lastName.value,
        email : email.value,
        phone : phone.value,
        message : message.value
    };

    fetch("/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json" 
        },
        body: JSON.stringify(contactObj)
    });    
});