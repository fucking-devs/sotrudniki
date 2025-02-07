import axios from "axios";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('application-form');
    const citySelect = document.getElementById('city');
    const customCityInput = document.getElementById('custom-city');
    const citizenshipSelect = document.getElementById('citizenship');
    const customCitizenshipInput = document.getElementById('custom-citizenship');

    citySelect.addEventListener('change', () => toggleInput(customCityInput, citySelect));
    citizenshipSelect.addEventListener('change', () => toggleInput(customCitizenshipInput, citizenshipSelect));

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = {
            age: +form.querySelector('#age').value,
            experience: +form.querySelector('#experience').value,
            criminal: form.querySelector('#criminal').value,
            position: form.querySelector('#position').value,
            city: citySelect.value === 'other' ? customCityInput.value : citySelect.value,
            citizenship: citizenshipSelect.value === 'other' ? customCitizenshipInput.value : citizenshipSelect.value,
            query: form.querySelector('#query').value
        };

        const response = await axios.post('/submit', formData);
        displayMessage(response.data.message, 'success');
    });
});

const toggleInput = (input, select) => {
    input.style.display = select.value === 'other' ? 'block' : 'none';
    input.required = select.value === 'other';
};

const displayMessage = (message, type) => {
    const responseMessage = document.getElementById('response-message');
    responseMessage.textContent = message;
    responseMessage.style.color = type === 'success' ? 'green' : 'red';
    responseMessage.style.display = 'block';
};