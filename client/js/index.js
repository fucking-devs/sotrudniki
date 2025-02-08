axios.defaults.baseURL = 'http://localhost:5000';

const position = document.querySelector('#position')
const city = document.querySelector('#city')
const criminal = document.querySelector('#criminal')
const prompt = document.querySelector('#prompt')

const downloadButton = document.querySelector('.download')
const form = document.querySelector('form')

form?.addEventListener('submit', async (event) => {
  event.preventDefault()

  const data = {
    position: position.value,
    city: city.value,
    criminal: criminal.value === 'not_matter' ? true : false,
    prompt: prompt.value
  }

  console.log(data)

  const req = await axios.post('/submit', data)

  console.log(req.data)
})

downloadButton.addEventListener('click', () => {
  window.location.href = '/export'
})