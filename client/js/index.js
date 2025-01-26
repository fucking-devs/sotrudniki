import axios from "axios"; 

document.addEventListener('DOMContentLoaded', () => {
    const citySelect = document.getElementById('city');
    const customCityInput = document.getElementById('custom-city');
    const citizenshipSelect = document.getElementById('citizenship');
    const customCitizenshipInput = document.getElementById('custom-citizenship');
    const form = document.getElementById('application-form');
    const responseMessage = document.getElementById('response-message');
    const downloadButton = document.getElementById('download-excel');

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

    downloadButton.addEventListener('click', async () => {
        console.log("Скачивание Excel файла...");
        try {
            const response = await axios.get('http://localhost:5000/export', {
                responseType: 'blob' 
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'data.xlsx'); 
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Ошибка при скачивании файла:', error);
            displayResponseMessage('Ошибка при скачивании Excel файла.', 'error');
        }
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
    const downloadButton = document.getElementById('download-excel');

    try {
        progressContainer.style.display = 'block'; 
        const response = await axios.post('http://localhost:5000/submit', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const totalPages = response.data.totalPages || 1; 
        for (let index = 0; index < totalPages; index++) {
            const progress = ((index + 1) / totalPages) * 100;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `Обработано страниц: ${index + 1} из ${totalPages}`;
            await new Promise(resolve => setTimeout(resolve, 500)); 
        }

        displayResponseMessage(response.data.message, 'success');
        downloadButton.style.display = 'block'; 
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
    setTimeout(() => {
        responseMessage.style.display = 'none';
    }, 5000);
}