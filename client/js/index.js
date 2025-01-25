import axios from "axios"; 

document.addEventListener('DOMContentLoaded', () => {
    const citySelect = document.getElementById('city');
    const customCityInput = document.getElementById('custom-city');
    const citizenshipSelect = document.getElementById('citizenship');
    const customCitizenshipInput = document.getElementById('custom-citizenship');
    const form = document.getElementById('application-form');
    const responseMessage = document.getElementById('response-message');

    citySelect.addEventListener('change', () => toggleCustomInput(customCityInput, citySelect));
    citizenshipSelect.addEventListener('change', () => toggleCustomInput(customCitizenshipInput, citizenshipSelect));
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        const formData = {
            age: Number(document.getElementById('age').value) || null, 
            experience: Number(document.getElementById('experience').value) || null,
            criminal: document.getElementById('criminal').value || null,
            position: document.getElementById('position').value || null,
            city: citySelect.value === 'other' ? customCityInput.value : citySelect.value,
            citizenship: citizenshipSelect.value === 'other' ? customCitizenshipInput.value : citizenshipSelect.value,
            query: document.getElementById('query').value 
        };

        if (!formData.city || !formData.query) {
            displayResponseMessage('Пожалуйста, заполните обязательные поля: город и промт.', 'error');
            return;
        }

        console.log("Отправляемые данные:", formData); 

        await submitForm(formData);
    });
});

function toggleCustomInput(inputElement, selectElement) {
    if (selectElement.value === 'other') {
        inputElement.style.display = 'block';
        inputElement.required = true;
    } else {
        inputElement.style.display = 'none';
        inputElement.required = false;
    }
}

async function submitForm(data) {
    const responseMessage = document.getElementById('response-message'); 
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    try {
        progressContainer.style.display = 'block'; 
        const response = await axios.post('http://localhost:5000/submit', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        response.data.pages.forEach((page, index) => {
            const progress = ((index + 1) / response.data.totalPages) * 100;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `Обработано страниц: ${index + 1} из ${response.data.totalPages}`;
        });

        displayResponseMessage(response.data.message, 'success');
    } catch (error) {
        console.error('Ошибка при отправке формы:', error);
        if (error.response && error.response.data && error.response.data.error) {
            displayResponseMessage(error.response.data.error, 'error');
        } else {
            displayResponseMessage('Произошла ошибка при отправке данных.', 'error');
        }
    }
}

function displayResponseMessage(message, type) {
    const responseMessage = document.getElementById('response-message'); 
    responseMessage.textContent = message;
    responseMessage.style.color = type === 'success' ? 'green' : 'red';
    responseMessage.style.display = 'block';

    // Удаление сообщения через несколько секунд
    setTimeout(() => {
        responseMessage.style.display = 'none';
    }, 5000);
}
