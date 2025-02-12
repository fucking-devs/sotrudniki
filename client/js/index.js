axios.defaults.baseURL = 'http://localhost:5000';

const position = document.querySelector('#position')
const city = document.querySelector('#city')
const criminal = document.querySelector('#criminal')
const prompt = document.querySelector('#prompt')

const downloadButton = document.querySelector('.download')
const form = document.querySelector('form')

form?.addEventListener('submit', async (event) => {
  event.preventDefault()

  form?.addEventListener('submit', async (event) => {
    event.preventDefault()
    
    try {
      const data = {
        position: position.value,
        city: city.value,
        criminal: criminal.value === 'not_matter',
        prompt: prompt.value
      }
  
      const response = await axios.post('/submit', data)
      
      if (response.data.error) {
        alert('Ошибка: ' + response.data.error)
      } else {
        alert('Данные успешно собраны!')
        console.log(response.data)
      }
    } catch (error) {
      console.error('Request failed:', error)
      alert('Произошла ошибка при выполнении запроса')
    }
  })
  
downloadButton.addEventListener('click', () => {
  window.location.href = '/export'
})})