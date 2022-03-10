const $signUpForm = document.forms.signUpForm

const $posts = document.querySelector('[data-posts]')

if ($signUpForm) {
  const $emailInput = $signUpForm.elements.email
  const $nameInput = $signUpForm.elements.name

  const LSKey = 'signUpForm'

  const dataFromLS = JSON.parse(window.localStorage.getItem(LSKey))

  $emailInput.value = dataFromLS.email
  $nameInput.value = dataFromLS.name

  $emailInput.addEventListener('input', (e) => {
    const oldData = JSON.parse(window.localStorage.getItem(LSKey))

    const objectToSave = {
      ...oldData,
      [e.target.name]: e.target.value,
    }

    window.localStorage.setItem(LSKey, JSON.stringify(objectToSave))
  })

  $nameInput.addEventListener('input', (e) => {
    const oldData = JSON.parse(window.localStorage.getItem(LSKey))

    const objectToSave = {
      ...oldData,
      [e.target.name]: e.target.value,
    }

    window.localStorage.setItem(LSKey, JSON.stringify(objectToSave))
  })
}

$posts.addEventListener('click', async (e) => {
  if (e.target.dataset.remove_post === '') {
    console.log(e.target.dataset.remove_post)
    const parent = e.target.closest('[data-post_id]')
    const response = await fetch(`/remove_post/${parent.dataset.post_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ remove: '1' }),
    })
    if (response.status === 200) {
      parent.remove()
    } else if (response.status === 403) {
      alert('Вы пытаетесь удалить чужой пост. Не надо так nyan (」°ロ°)」 ')
    }
  }
})
