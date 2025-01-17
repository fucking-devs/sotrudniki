
document.addEventListener('DOMContentLoaded', () => {
    const citySelect = document.getElementById('city');
    const customCityInput = document.getElementById('custom-city');
    const citizenshipSelect = document.getElementById('citizenship');
    const customCitizenshipInput = document.getElementById('custom-citizenship');

    citySelect.addEventListener('change', function() {
        if (this.value === 'other') {
            customCityInput.style.display = 'block';
            customCityInput.required = true;
        } else {
            customCityInput.style.display = 'none';
            customCityInput.required = false;
        }
    });

    citizenshipSelect.addEventListener('change', function() {
        if (this.value === 'other') {
            customCitizenshipInput.style.display = 'block';
            customCitizenshipInput.required = true;
        } else {
            customCitizenshipInput.style.display = 'none';
            customCitizenshipInput.required = false;
        }
    });
});

import axios from 'axios';

async function submitForm(data) {
    try {
        const response = await axios.post('http://localhost:5000/submit', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(response.data); 
    } catch (error) {
        console.error('Ошибка при отправке формы:', error);
    }
}

const formData = {
    age: 30,
    experience: 5,
    position: 'Разработчик',
    city: 'Волгоград',
    citizenship: 'Россия',
    query: 'Ищу работу'
};

submitForm(formData);
